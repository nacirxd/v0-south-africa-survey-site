import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If environment variables are not available, skip Supabase auth but allow the request
  if (!supabaseUrl || !supabaseKey) {
    console.log("[v0] Supabase env vars not available in Edge Runtime, skipping auth check")
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
  })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const isAuthRoute =
      request.nextUrl.pathname.startsWith("/auth/login") ||
      request.nextUrl.pathname.startsWith("/auth/sign-up") ||
      request.nextUrl.pathname === "/auth/callback"

    const isPublicRoute = request.nextUrl.pathname === "/"

    if (!isAuthRoute && !isPublicRoute && !user) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    if (isAuthRoute && user) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  } catch (error) {
    console.error("[v0] Supabase auth error in middleware:", error)
    // Allow the request to continue even if there's an error
  }

  return supabaseResponse
}
