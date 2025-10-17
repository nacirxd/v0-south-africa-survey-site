import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = await cookies()

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: {
        storage: {
          getItem: (key: string) => {
            return cookieStore.get(key)?.value
          },
          setItem: (key: string, value: string) => {
            cookieStore.set(key, value, {
              path: "/",
              maxAge: 60 * 60 * 24 * 7,
            })
          },
          removeItem: (key: string) => {
            cookieStore.delete(key)
          },
        },
      },
    })

    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=callback_error`)
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
