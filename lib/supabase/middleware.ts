import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured) {
    console.warn("[v0] Supabase not configured, skipping auth middleware")
    return NextResponse.next({ request })
  }

  const response = NextResponse.next({ request })

  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: {
        storage: {
          getItem: (key: string) => {
            return request.cookies.get(key)?.value
          },
          setItem: (key: string, value: string) => {
            request.cookies.set(key, value)
            response.cookies.set(key, value, {
              path: "/",
              maxAge: 60 * 60 * 24 * 7,
            })
          },
          removeItem: (key: string) => {
            request.cookies.delete(key)
            response.cookies.delete(key)
          },
        },
      },
    })

    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (code) {
      try {
        await supabase.auth.exchangeCodeForSession(code)
        return NextResponse.redirect(new URL("/dashboard", request.url))
      } catch (error) {
        console.error("[v0] Error exchanging code for session:", error)
        return NextResponse.redirect(new URL("/auth/login?error=auth_callback_failed", request.url))
      }
    }

    const isAuthRoute =
      request.nextUrl.pathname.startsWith("/auth/login") ||
      request.nextUrl.pathname.startsWith("/auth/sign-up") ||
      request.nextUrl.pathname === "/auth/callback"

    const isPublicRoute = request.nextUrl.pathname === "/"

    if (!isAuthRoute && !isPublicRoute) {
      try {
        const userPromise = supabase.auth.getUser()
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Auth timeout")), 5000))

        const {
          data: { user },
        } = (await Promise.race([userPromise, timeoutPromise])) as any

        if (!user) {
          console.log("[v0] No user found, redirecting to login")
          return NextResponse.redirect(new URL("/auth/login", request.url))
        }
      } catch (error) {
        console.error("[v0] Error getting user in middleware:", error)
        if (!request.nextUrl.pathname.startsWith("/api") && !request.nextUrl.pathname.startsWith("/_next")) {
          return NextResponse.redirect(new URL("/auth/login", request.url))
        }
      }
    }

    return response
  } catch (error) {
    console.error("[v0] Middleware error:", error)
    return NextResponse.next({ request })
  }
}
