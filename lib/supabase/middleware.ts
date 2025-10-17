import { createServerClient } from "@supabase/ssr"
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

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

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
      const {
        data: { user },
      } = await supabase.auth.getUser()

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

  return supabaseResponse
}
