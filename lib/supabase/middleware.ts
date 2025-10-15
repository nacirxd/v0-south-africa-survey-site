import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export async function updateSession(request: NextRequest) {
  // If Supabase is not configured, just continue without auth
  if (!isSupabaseConfigured) {
    console.warn("[v0] Supabase not configured, skipping auth middleware")
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )

    // Check if this is an auth callback
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
        // Add timeout to prevent hanging requests
        const userPromise = supabase.auth.getUser()
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Auth timeout")), 5000))

        const {
          data: { user },
        } = (await Promise.race([userPromise, timeoutPromise])) as any

        if (!user) {
          console.log("[v0] No user found, redirecting to login")
          const redirectUrl = new URL("/auth/login", request.url)
          return NextResponse.redirect(redirectUrl)
        }
      } catch (error) {
        console.error("[v0] Error getting user in middleware:", error)
        if (!request.nextUrl.pathname.startsWith("/api") && !request.nextUrl.pathname.startsWith("/_next")) {
          const redirectUrl = new URL("/auth/login", request.url)
          return NextResponse.redirect(redirectUrl)
        }
      }
    }

    return supabaseResponse
  } catch (error) {
    console.error("[v0] Middleware error:", error)
    // Continue without auth if there's a general middleware error
    return NextResponse.next({
      request,
    })
  }
}
