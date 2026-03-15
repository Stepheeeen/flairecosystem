import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get("host") || ""

  // Define root domains (e.g., localhost:3000, flairecosystem.com)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || ""
  const isLocalRoot = hostname === "localhost:3000" || hostname === "localhost"
  const isProdRoot = hostname === rootDomain || hostname === `www.${rootDomain}`
  const isRoot = isLocalRoot || isProdRoot
  const isVercel = hostname.includes("vercel.app")

  // 1. Handle Authentication for Admin routes
  const isAdminRoute = url.pathname.startsWith("/admin") || /^\/[^/]+\/admin(\/.*)?$/.test(url.pathname)
  const isSuperAdminRoute = url.pathname.startsWith("/super-admin") && !url.pathname.startsWith("/super-admin/signin")

  if (isAdminRoute || isSuperAdminRoute) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    console.log(`[Middleware] Auth Check - Path: ${url.pathname}, Host: ${hostname}, Token: ${!!token}, Role: ${token?.role}`)
    
    if (!token) {
      let signInUrl: URL
      if (isSuperAdminRoute) {
        signInUrl = new URL("/super-admin/signin", request.url)
      } else {
        const match = url.pathname.match(/^\/([^/]+)\/admin(\/.*)?$/)
        const slug = match ? match[1] : (!isRoot && !isVercel ? hostname : "")
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
  const isNextInternal = url.pathname.startsWith("/_next") || url.pathname.startsWith("/api")
  const isExcludedPath = 
    url.pathname.startsWith("/super-admin") || 
    url.pathname.startsWith("/suspended") ||
    url.pathname.startsWith("/api")

  if (
    !isRoot &&
    !isVercel &&
    !isNextInternal &&
    !isExcludedPath
  ) {
    let slug = hostname

    // If it's a subdomain of the root domain, extract the prefix
    if (hostname.endsWith(`.${rootDomain}`)) {
      slug = hostname.replace(`.${rootDomain}`, "")
    }

    // Don't rewrite if slug is 'www'
    if (slug === "www") {
      return NextResponse.next()
    }

    // REDIRECT: If the pathname starts with the slug, redirect to the clean version
    // e.g., vellion.flairecosystem.com/vellion/products -> /products
    if (url.pathname.startsWith(`/${slug}`)) {
      const cleanPath = url.pathname.replace(`/${slug}`, "") || "/"
      const redirectUrl = new URL(cleanPath, request.url)
      // Preserving search params
      url.searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value)
      })
      console.log(`[Middleware] Subdomain Redirect - From: ${url.pathname}, To: ${cleanPath}`)
      return NextResponse.redirect(redirectUrl)
    }

    return NextResponse.rewrite(new URL(`/${slug}${url.pathname}`, request.url))
  }

  return NextResponse.next()
}
