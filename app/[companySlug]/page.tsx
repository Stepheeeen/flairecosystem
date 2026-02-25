"use client"

import { useEffect, useState, Suspense, use } from "react"
import Link from "next/link"
import Image from "next/image"
import axios from "axios"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { getStoreUrl } from "@/lib/utils"

function StoreLandingContent({ companySlug }: { companySlug: string }) {
    const [company, setCompany] = useState<any>(null)

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const compRes = await axios.get(`/api/companies/${companySlug}`)
                setCompany(compRes.data)
            } catch (error) {
                console.error("Failed to load storefront:", error)
            }
        }
        fetchCompany()
    }, [companySlug])

    const brandName = company?.name || "STOREFRONT"
    const theme = company?.theme || {}
    const landingPage = company?.landingPage || {}

    const heroImage = theme.heroImage || "/hero-bg.jpg"
    const primaryColor = theme.primaryColor || null

    const heroTitle = landingPage.heroTitle || brandName
    const heroSubtitle = landingPage.heroSubtitle || "Curated Collections for the Discerning"
    const heroButtonText = landingPage.heroButtonText || "Shop Collection"
    const heroButtonLink = landingPage.heroButtonLink || getStoreUrl(companySlug, "/products")

    const featuredCollectionsTitle = landingPage.featuredCollectionsTitle || "FEATURED COLLECTIONS"

    const newsletterTitle = landingPage.newsletterTitle || "STAY CONNECTED"
    const newsletterSubtitle = landingPage.newsletterSubtitle || `Subscribe for exclusive ${company?.name ? `${company.name} ` : ''}collections and early access to new arrivals.`

    return (
        <div style={primaryColor ? { '--theme-primary': primaryColor, '--primary': primaryColor } as React.CSSProperties : {}}>
            <Navbar companySlug={companySlug} companyName={company?.name} />
            <main className="min-h-screen bg-background">
                {/* Hero Section */}
                <section className="relative h-screen flex items-center justify-center overflow-hidden bg-secondary">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                            src={heroImage}
                            alt="Luxury fashion"
                            fill
                            className="object-cover"
                            priority
                            unoptimized={heroImage.startsWith('http')}
                        />
                        <div className="absolute inset-0 bg-black/30" />
                    </div>

                    <div className="relative z-10 text-center text-white space-y-6 px-4">
                        <h1 className="text-5xl md:text-7xl font-light tracking-widest uppercase">
                            {heroTitle}
                        </h1>
                        <p className="text-xl md:text-2xl font-light tracking-wide">
                            {heroSubtitle}
                        </p>
                        <Link href={heroButtonLink}>
                            <Button size="lg" className="text-base px-8 mt-4">
                                {heroButtonText}
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Featured Collections */}
                <section className="py-20 px-4">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-4xl font-light tracking-widest text-center mb-16 uppercase">
                            {featuredCollectionsTitle}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Women's Collection */}
                            <Link href={getStoreUrl(companySlug, "/products?category=women")}>
                                <div className="group cursor-pointer">
                                    <div className="relative h-80 bg-muted overflow-hidden mb-4">
                                        <Image
                                            src="/collection-women.jpg"
                                            alt="Women's Collection"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <h3 className="text-2xl font-light text-center">Women</h3>
                                </div>
                            </Link>

                            {/* Men's Collection */}
                            <Link href={getStoreUrl(companySlug, "/products?category=men")}>
                                <div className="group cursor-pointer">
                                    <div className="relative h-80 bg-muted overflow-hidden mb-4">
                                        <Image
                                            src="/collection-men.jpg"
                                            alt="Men's Collection"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <h3 className="text-2xl font-light text-center">Men</h3>
                                </div>
                            </Link>

                            {/* Accessories */}
                            <Link href={getStoreUrl(companySlug, "/products?category=accessories")}>
                                <div className="group cursor-pointer">
                                    <div className="relative h-80 bg-muted overflow-hidden mb-4">
                                        <Image
                                            src="/collection-accessories.jpg"
                                            alt="Accessories Collection"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <h3 className="text-2xl font-light text-center">Accessories</h3>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Newsletter Section */}
                <section className="bg-primary text-primary-foreground py-16 px-4">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl font-light tracking-widest uppercase">
                            {newsletterTitle}
                        </h2>
                        <p className="text-lg font-light">
                            {newsletterSubtitle}
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="flex-1 px-4 py-3 bg-primary-foreground text-primary rounded-sm focus:outline-none"
                            />
                            <Button
                                className="bg-accent text-accent-foreground hover:opacity-90"
                            >
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-secondary py-12 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <h3 className="font-light tracking-widest mb-4">SHOP</h3>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <Link href={getStoreUrl(companySlug, "/products?category=women")} className="hover:text-primary">
                                            Women
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={getStoreUrl(companySlug, "/products?category=men")} className="hover:text-primary">
                                            Men
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={getStoreUrl(companySlug, "/products?category=accessories")} className="hover:text-primary">
                                            Accessories
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-light tracking-widest mb-4">CUSTOMER</h3>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <Link href={getStoreUrl(companySlug, "/account/orders")} className="hover:text-primary">
                                            Orders
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={getStoreUrl(companySlug, "/account")} className="hover:text-primary">
                                            Account
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={getStoreUrl(companySlug, "/")} className="hover:text-primary">
                                            Contact
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-light tracking-widest mb-4">COMPANY</h3>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <Link href={getStoreUrl(companySlug, "/")} className="hover:text-primary">
                                            About
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={getStoreUrl(companySlug, "/")} className="hover:text-primary">
                                            Sustainability
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={getStoreUrl(companySlug, "/")} className="hover:text-primary">
                                            Careers
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-light tracking-widest mb-4">FOLLOW</h3>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <a href="#" className="hover:text-primary">
                                            Instagram
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="hover:text-primary">
                                            Facebook
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="hover:text-primary">
                                            Twitter
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
                            <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    )
}

export default function TenantLandingPage({ params }: { params: Promise<{ companySlug: string }> }) {
    const unwrappedParams = use(params)
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading storefront...</div>}>
            <StoreLandingContent companySlug={unwrappedParams.companySlug} />
        </Suspense>
    )
}
