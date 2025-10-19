import type { NextRequest } from "next/server"

// Authentication is handled at the page level in server components
export async function middleware(request: NextRequest) {
  // Just pass through all requests
  // Auth checks happen in individual pages using server components
  return
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
