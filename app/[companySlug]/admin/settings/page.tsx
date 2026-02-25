"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import axios from "axios"

export default function AdminSettingsPage() {
    const params = useParams()
    const companySlug = params.companySlug as string
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        customDomain: "",
        subdomain: "",
        theme: {
            primaryColor: "",
            backgroundColor: "",
            heroImage: "",
        }
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const fetchSessionAndCompany = async () => {
            try {
                const res = await axios.get("/api/auth/session")
                const session = res.data
                if (session?.user?.companyId) {
                    try {
                        const compRes = await axios.get(`/api/companies/${session.user.companyId}`)
                        const company = compRes.data
                        setFormData({
                            name: company.name || "",
                            slug: company.slug || "",
                            customDomain: company.customDomain || "",
                            subdomain: company.subdomain || "",
                            theme: {
                                primaryColor: company.theme?.primaryColor || "",
                                backgroundColor: company.theme?.backgroundColor || "",
                                heroImage: company.theme?.heroImage || "",
                            }
                        })
                    } catch (e) {
                        // Ignore error if company not found
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchSessionAndCompany()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        if (name.startsWith("theme.")) {
            const themeKey = name.split(".")[1]
            setFormData((prev) => ({
                ...prev,
                theme: { ...prev.theme, [themeKey]: value }
            }))
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const res = await axios.get("/api/auth/session")
            const session = res.data

            if (!session?.user?.companyId) throw new Error("No company found for user")

            await axios.put(`/api/companies/${session.user.companyId}`, formData)

            toast.success("Settings updated successfully")
        } catch (error) {
            console.error(error)
            toast.error("Failed to update settings")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b border-border bg-secondary">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/${companySlug}/admin`}
                            className="flex items-center gap-2 text-sm hover:text-primary"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <h1 className="text-3xl font-light tracking-widest border-l pl-4 border-border">
                            COMPANY SETTINGS
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-12">
                {isLoading ? (
                    <p className="text-muted-foreground text-center">Loading settings...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8 border border-border p-8 bg-secondary/50">
                        <div>
                            <h2 className="text-xl font-light mb-6">Store Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Company Name</label>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="bg-background border-border"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        This is displayed on your storefront.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Store URL Slug</label>
                                    <Input
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        className="bg-background border-border"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Your store will be accessible at <code>/{formData.slug || "slug"}</code>.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Custom Domain (Optional)</label>
                                    <Input
                                        name="customDomain"
                                        value={formData.customDomain}
                                        onChange={handleChange}
                                        className="bg-background border-border"
                                        placeholder="e.g. www.mystore.com"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Map your own domain directly to your storefront. Requires DNS configuration.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Subdomain (Optional)</label>
                                    <Input
                                        name="subdomain"
                                        value={formData.subdomain}
                                        onChange={handleChange}
                                        className="bg-background border-border"
                                        placeholder="e.g. mystore"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Your store will be accessible at <code>{formData.subdomain || "mystore"}.flairecosystem.com</code> (if configured).
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-border">
                            <h2 className="text-xl font-light mb-6">Theme Customization</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Primary Color</label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="color"
                                            name="theme.primaryColor"
                                            value={formData.theme.primaryColor}
                                            onChange={handleChange}
                                            className="w-16 h-10 p-1 cursor-pointer bg-background border-border"
                                        />
                                        <Input
                                            type="text"
                                            name="theme.primaryColor"
                                            value={formData.theme.primaryColor}
                                            onChange={handleChange}
                                            placeholder="#000000"
                                            className="bg-background border-border font-mono max-w-[150px]"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Used for buttons, active links, and accents.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Customer Hero Image URL</label>
                                    <Input
                                        name="theme.heroImage"
                                        value={formData.theme.heroImage}
                                        onChange={handleChange}
                                        className="bg-background border-border"
                                        placeholder="https://example.com/my-hero-image.jpg"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        The background image displayed at the top of your storefront.
                                    </p>
                                    {formData.theme.heroImage && (
                                        <div className="mt-4 relative h-32 w-full rounded-sm overflow-hidden border border-border">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={formData.theme.heroImage}
                                                alt="Hero Preview"
                                                className="object-cover w-full h-full"
                                                onError={(e) => {
                                                    ; (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" font-family="sans-serif" font-size="12" text-anchor="middle" alignment-baseline="middle" fill="%239ca3af">Invalid Image URL</text></svg>'
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={isSaving} className="w-full">
                            {isSaving ? "Saving..." : "Save Settings"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    )
}
