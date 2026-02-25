import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get("host") || ""

  // Define root domains (e.g., localhost:3000, flairecosystem.com)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"

  // 1. Handle Authentication for Admin routes
  const isAdminRoute = url.pathname.startsWith("/admin") || /^\/[^/]+\/admin(\/.*)?$/.test(url.pathname)
  const isSuperAdminRoute = url.pathname.startsWith("/super-admin") && !url.pathname.startsWith("/super-admin/signin")

  if (isAdminRoute || isSuperAdminRoute) {
    const token = await getToken({ req: request })
    if (!token) {
      let signInUrl: URL
      if (isSuperAdminRoute) {
        signInUrl = new URL("/super-admin/signin", request.url)
      } else {
        const match = url.pathname.match(/^\/([^/]+)\/admin(\/.*)?$/)
        const slug = match ? match[1] : (hostname !== rootDomain && !hostname.includes("vercel.app") ? hostname : "")
        const signInPath = slug ? `/${slug}/auth/signin` : "/default/auth/signin"
        signInUrl = new URL(signInPath, request.url)
      }
      signInUrl.searchParams.set("callbackUrl", request.url)
      return NextResponse.redirect(signInUrl)
    }

    if (isSuperAdminRoute && token.role !== "super_admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (isAdminRoute) {
      if (token.role === "super_admin") return NextResponse.next()
      if (token.role === "admin" && token.companyId) return NextResponse.next()
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // 2. Handle Custom Domain / Subdomain Rewrites
  // If the hostname is NOT the root domain (and not a Vercel preview domain),
  // we rewrite the URL so that the App Router treats the hostname as the first path segment.
  if (
    hostname !== rootDomain &&
    !hostname.includes("vercel.app") &&
    !url.pathname.startsWith("/super-admin")
  ) {
    // We rewrite mystore.com/products to /mystore.com/products
    return NextResponse.rewrite(new URL(`/${hostname}${url.pathname}`, request.url))
  }

  return NextResponse.next()
}
