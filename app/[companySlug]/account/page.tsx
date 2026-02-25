"use client"

import { use } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { getStoreUrl } from "@/lib/utils"
import { Package, User } from "lucide-react"

export default function CustomerAccountDashboard({ params }: { params: Promise<{ companySlug: string }> }) {
    const unwrappedParams = use(params)
    const { companySlug } = unwrappedParams

    const { data: session, status } = useSession()
    const router = useRouter()

    if (status === "loading") {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    if (!session) {
        router.push(getStoreUrl(companySlug, "/auth/signin"))
        return null
    }

    return (
        <>
            <Navbar companySlug={companySlug} companyName="STOREFRONT" />
            <main className="min-h-screen bg-background">
                <div className="border-b border-border bg-secondary">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <h1 className="text-3xl font-light tracking-widest uppercase mb-2">My Account</h1>
                        <p className="text-muted-foreground">Welcome back, {session.user.name}</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Account Info */}
                        <div className="col-span-1 space-y-6">
                            <div className="border border-border p-6 bg-secondary/30 rounded-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <User className="h-5 w-5 text-primary" />
                                    <h2 className="text-lg font-medium">Profile Details</h2>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-muted-foreground">Name:</span> {session.user.name}</p>
                                    <p><span className="text-muted-foreground">Email:</span> {session.user.email}</p>
                                </div>
                                {session.user.role === "admin" && (
                                    <Link href={`/${companySlug}/admin`} className="block mt-6">
                                        <Button className="w-full text-xs uppercase tracking-widest bg-primary text-primary-foreground">
                                            Store Admin Dashboard
                                        </Button>
                                    </Link>
                                )}
                                {session.user.role === "super_admin" && (
                                    <Link href="/super-admin" className="block mt-6">
                                        <Button className="w-full text-xs uppercase tracking-widest bg-primary text-primary-foreground">
                                            Platform Admin Dashboard
                                        </Button>
                                    </Link>
                                )}
                                <Button
                                    variant="outline"
                                    className="w-full mt-4 text-xs uppercase tracking-widest"
                                    onClick={() => signOut({ callbackUrl: getStoreUrl(companySlug, "/") })}
                                >
                                    Sign Out
                                </Button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="col-span-1 md:col-span-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Link href={getStoreUrl(companySlug, "/account/orders")} className="group block">
                                    <div className="border border-border p-8 h-full rounded-sm hover:border-primary transition-colors bg-secondary/10 group-hover:bg-secondary/30 text-center flex flex-col items-center justify-center">
                                        <Package className="h-8 w-8 mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        <h3 className="text-xl font-light mb-2">Order History</h3>
                                        <p className="text-sm text-muted-foreground">View and track your previous orders</p>
                                    </div>
                                </Link>

                                {/* Placeholder for future features like Wishlist or Saved Addresses */}
                                <div className="border border-border border-dashed p-8 h-full rounded-sm bg-secondary/5 text-center flex flex-col items-center justify-center opacity-70">
                                    <h3 className="text-xl font-light mb-2 text-muted-foreground">Saved Addresses</h3>
                                    <p className="text-sm text-muted-foreground">Coming soon</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main >
        </>
    )
}
