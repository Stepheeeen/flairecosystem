"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getStoreUrl } from "@/lib/utils"
import { Package, User, MapPin, Plus, Trash2 } from "lucide-react"
import axios from "axios"

export default function CustomerAccountDashboard({ params }: { params: Promise<{ companySlug: string }> }) {
    const unwrappedParams = use(params)
    const { companySlug } = unwrappedParams

    const { data: session, status } = useSession()
    const router = useRouter()

    const [profile, setProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [addressForm, setAddressForm] = useState({ street: "", city: "", state: "", zip: "" })

    useEffect(() => {
        if (session) {
            axios.get("/api/account/profile")
                .then((res) => setProfile(res.data))
                .catch((err) => console.error("Failed to load profile", err))
                .finally(() => setIsLoading(false))
        } else if (status === "unauthenticated") {
            setIsLoading(false)
        }
    }, [session, status])

    if (status === "loading" || (session && isLoading)) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    if (!session) {
        router.push(getStoreUrl(companySlug, "/auth/signin"))
        return null
    }

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const currentBook = profile?.addressBook || []
            const newAddress = { ...addressForm, isDefault: currentBook.length === 0 }
            const res = await axios.put("/api/account/profile", { addressBook: [...currentBook, newAddress] })
            setProfile(res.data)
            setShowAddressForm(false)
            setAddressForm({ street: "", city: "", state: "", zip: "" })
        } catch (error) {
            console.error("Failed to save address", error)
        }
    }

    const handleDeleteAddress = async (index: number) => {
        try {
            const currentBook = [...(profile?.addressBook || [])]
            currentBook.splice(index, 1)
            // Fix default if necessary
            if (currentBook.length > 0 && !currentBook.some((a: any) => a.isDefault)) {
                currentBook[0].isDefault = true
            }
            const res = await axios.put("/api/account/profile", { addressBook: currentBook })
            setProfile(res.data)
        } catch (error) {
            console.error("Failed to delete address", error)
        }
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

                                {/* Address Book */}
                                <div className="border border-border p-8 h-full rounded-sm bg-secondary/5">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-5 w-5" />
                                            <h3 className="text-xl font-light">Saved Addresses</h3>
                                        </div>
                                        {!showAddressForm && (
                                            <Button variant="outline" size="sm" onClick={() => setShowAddressForm(true)}>
                                                <Plus className="h-4 w-4 mr-1" /> Add New
                                            </Button>
                                        )}
                                    </div>

                                    {showAddressForm ? (
                                        <form onSubmit={handleSaveAddress} className="space-y-4 mb-6">
                                            <Input placeholder="Street Address" required value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input placeholder="City" required value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
                                                <Input placeholder="State/Province" required value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} />
                                            </div>
                                            <Input placeholder="ZIP / Postal Code" required value={addressForm.zip} onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })} />
                                            <div className="flex space-x-2">
                                                <Button type="submit" className="w-full">Save Address</Button>
                                                <Button type="button" variant="outline" onClick={() => setShowAddressForm(false)}>Cancel</Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-4">
                                            {(!profile?.addressBook || profile.addressBook.length === 0) ? (
                                                <p className="text-sm text-muted-foreground text-center py-4">You have no saved addresses.</p>
                                            ) : (
                                                profile.addressBook.map((addr: any, idx: number) => (
                                                    <div key={idx} className="border border-border p-4 rounded-sm flex justify-between items-start bg-background group">
                                                        <div>
                                                            {addr.isDefault && <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-medium mb-2 rounded-sm">Default Address</span>}
                                                            <p className="font-medium text-sm">{addr.street}</p>
                                                            <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zip}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteAddress(idx)}
                                                            className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 p-2"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main >
        </>
    )
}
