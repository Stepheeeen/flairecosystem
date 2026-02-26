"use client"
import { getStoreUrl } from "@/lib/utils"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { ShoppingCart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartSheet } from "./cart-sheet"

interface NavbarProps {
  companySlug?: string
  companyName?: string
  companyLogo?: string
}

export function Navbar({ companySlug, companyName, companyLogo }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const basePath = companySlug ? `/${companySlug}` : ""
  const shopPath = `${basePath}/products`
  const cartPath = `${basePath}/cart`
  const brandName = companyName || (companySlug ? companySlug.replace(/-/g, ' ').toUpperCase() : "FLAIR ECO SYSTEM")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background border-b border-border shadow-sm" : "bg-background"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={basePath || "/"} className="flex items-center">
            {companyLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={companyLogo} alt={brandName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-xl font-light tracking-widest">{brandName}</span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href={shopPath}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Shop
            </Link>
            <Link
              href={shopPath}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Collections
            </Link>
            {session && (
              <Link
                href={getStoreUrl(companySlug, "/account")}
                className="text-sm font-medium hover:text-primary transition-colors text-primary"
              >
                Account
              </Link>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {session ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: basePath || "/" })}
                className="text-sm font-medium"
              >
                Sign Out
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(basePath ? basePath + "/auth/signin" : "/auth/signin")}
                className="text-sm font-medium"
              >
                Sign In
              </Button>
            )}

            <CartSheet companySlug={companySlug} />

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-border">
            <Link
              href={shopPath}
              className="block text-sm font-medium py-2 hover:text-primary transition-colors"
            >
              Shop
            </Link>
            <Link
              href={shopPath}
              className="block text-sm font-medium py-2 hover:text-primary transition-colors"
            >
              Collections
            </Link>
            {session && (
              <Link
                href={getStoreUrl(companySlug, "/account")}
                className="block text-sm font-medium py-2 hover:text-primary transition-colors text-primary"
              >
                Account
              </Link>
            )}
          </div>
        )}
      </div>
    </nav >
  )
}
