import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] Checking Supabase configuration:", {
    hasUrl: !!url,
    hasKey: !!key,
    urlType: typeof url,
    keyType: typeof key,
  })

  const isConfigured = !!url && url.length > 0 && !!key && key.length > 0
  console.log("[v0] Supabase configured:", isConfigured)

  return isConfigured
}

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    console.warn("[v0] Supabase not configured, skipping auth middleware")
    return NextResponse.next({ request })
  }

  console.log("[v0] Supabase configured, processing auth middleware")

  const supabaseResponse = NextResponse.next({
    request,
  })

  const accessToken = request.cookies.get("sb-access-token")?.value
  const refreshToken = request.cookies.get("sb-refresh-token")?.value

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: true, // Enable auto refresh
    },
  })

  if (refreshToken) {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken || "",
        refresh_token: refreshToken,
      })

      if (error) {
        console.error("[v0] Error refreshing session:", error)
        // Clear invalid tokens
        supabaseResponse.cookies.delete("sb-access-token")
        supabaseResponse.cookies.delete("sb-refresh-token")
      } else if (data.session) {
        // Update cookies with new tokens
        supabaseResponse.cookies.set("sb-access-token", data.session.access_token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        })
        supabaseResponse.cookies.set("sb-refresh-token", data.session.refresh_token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        })
      }
    } catch (error) {
      console.error("[v0] Error setting session:", error)
    }
  }

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error

      if (data.session) {
        supabaseResponse.cookies.set("sb-access-token", data.session.access_token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        })
        supabaseResponse.cookies.set("sb-refresh-token", data.session.refresh_token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        })
      }

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
