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

  // Extract slug from hostname if it's a subdomain/custom domain
  let slug = ""
  if (!isRoot && !isVercel) {
    slug = hostname
    if (hostname.endsWith(`.${rootDomain}`)) {
      slug = hostname.replace(`.${rootDomain}`, "")
    }
  }

  // 0. Prevent redirect loops from internal rewrites
  if (request.headers.get("x-internal-rewrite") === "true") {
    return NextResponse.next()
  }

  // 1. Handle Authentication for Admin routes
  const isAdminRoute = url.pathname.startsWith("/admin") || /^\/[^/]+\/admin(\/.*)?$/.test(url.pathname)
  const isSuperAdminRoute = url.pathname.startsWith("/super-admin") && !url.pathname.startsWith("/super-admin/signin")

  if (isAdminRoute || isSuperAdminRoute) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token) {
      let signInUrl: URL
      if (isSuperAdminRoute) {
        signInUrl = new URL("/super-admin/signin", request.url)
      } else {
        // Construct sign-in path using the extracted slug
        const effectiveSlug = slug || (url.pathname.match(/^\/([^/]+)\/admin(\/.*)?$/)?.[1]) || "default"
        const signInPath = `/${effectiveSlug}/auth/signin`
        signInUrl = new URL(signInPath, request.url)
      }
      signInUrl.searchParams.set("callbackUrl", request.url)
      return NextResponse.redirect(signInUrl)
    }

    if (isSuperAdminRoute && token.role !== "super_admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (isAdminRoute) {
      if (token.role === "super_admin" || (token.role === "admin" && token.companyId)) {
        // If it's a root domain, we can proceed. 
        // If it's a subdomain, we NEED to fall through to the rewrite section.
        if (isRoot || isVercel) {
          return NextResponse.next()
        }
      } else {
        return NextResponse.redirect(new URL("/", request.url))
      }
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
    !isExcludedPath &&
    slug && 
    slug !== "www"
  ) {
    // REDIRECT: If the pathname starts with the slug, redirect to the clean version
    // STRICTOR CHECK: We check if it starts with /slug/ or is exactly /slug
    if (url.pathname === `/${slug}` || url.pathname.startsWith(`/${slug}/`)) {
      const cleanPath = url.pathname.replace(`/${slug}`, "") || "/"
      const redirectUrl = new URL(cleanPath, request.url)
      url.searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value)
      })
      console.log(`[Middleware] Subdomain Redirect - From: ${url.pathname}, To: ${cleanPath}`)
      return NextResponse.redirect(redirectUrl)
    }

    const rewriteUrl = new URL(`/${slug}${url.pathname}`, request.url)
    console.log(`[Middleware] Subdomain Rewrite - Host: ${hostname}, Path: ${url.pathname} -> /${slug}${url.pathname}`)
    
    // Create response with internal rewrite header to prevent loops
    const responseHeaders = new Headers(request.headers)
    responseHeaders.set("x-internal-rewrite", "true")
    
    return NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: responseHeaders
      }
    })
  }

  return NextResponse.next()
}
