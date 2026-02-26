"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import axios from "axios"

export default function AdminSettingsPage() {
    const params = useParams()
    const companySlug = params.companySlug as string
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        logo: "",
        customDomain: "",
        subdomain: "",
        theme: {
            primaryColor: "",
            backgroundColor: "",
            heroImage: "",
        },
        paystackPublicKey: "",
        seoTitle: "",
        seoDescription: "",
        landingPage: {
            heroTitle: "",
            heroSubtitle: "",
            heroButtonText: "",
            heroButtonLink: "",
            featuredCollectionsTitle: "",
            newsletterTitle: "",
            newsletterSubtitle: "",
        }
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [heroImageFile, setHeroImageFile] = useState<File | null>(null)
    const [logoFile, setLogoFile] = useState<File | null>(null)

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
                            logo: company.logo || "",
                            customDomain: company.customDomain || "",
                            subdomain: company.subdomain || "",
                            theme: {
                                primaryColor: company.theme?.primaryColor || "",
                                backgroundColor: company.theme?.backgroundColor || "",
                                heroImage: company.theme?.heroImage || "",
                            },
                            paystackPublicKey: company.paystackPublicKey || "",
                            seoTitle: company.seoTitle || "",
                            seoDescription: company.seoDescription || "",
                            landingPage: {
                                heroTitle: company.landingPage?.heroTitle || "",
                                heroSubtitle: company.landingPage?.heroSubtitle || "",
                                heroButtonText: company.landingPage?.heroButtonText || "",
                                heroButtonLink: company.landingPage?.heroButtonLink || "",
                                featuredCollectionsTitle: company.landingPage?.featuredCollectionsTitle || "",
                                newsletterTitle: company.landingPage?.newsletterTitle || "",
                                newsletterSubtitle: company.landingPage?.newsletterSubtitle || "",
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
        } else if (name.startsWith("landingPage.")) {
            const lpKey = name.split(".")[1]
            setFormData((prev) => ({
                ...prev,
                landingPage: { ...prev.landingPage, [lpKey]: value }
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

            let finalHeroImage = formData.theme.heroImage
            let finalLogo = formData.logo

            const uploadToCloudinary = async (file: File) => {
                const data = new FormData()
                data.append("file", file)
                data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "vellion_products")
                const res = await axios.post(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    data
                )
                return res.data.secure_url
            }

            const uploadPromises = []

            if (heroImageFile) {
                uploadPromises.push(
                    uploadToCloudinary(heroImageFile).then(url => { finalHeroImage = url })
                )
            }

            if (logoFile) {
                uploadPromises.push(
                    uploadToCloudinary(logoFile).then(url => { finalLogo = url })
                )
            }

            if (uploadPromises.length > 0) {
                await Promise.all(uploadPromises)
            }

            const payloadToSave = {
                ...formData,
                logo: finalLogo,
                theme: {
                    ...formData.theme,
                    heroImage: finalHeroImage
                }
            }

            await axios.put(`/api/companies/${session.user.companyId}`, payloadToSave)

            // Sync local state with new URL
            setFormData(prev => ({
                ...prev,
                logo: finalLogo,
                theme: { ...prev.theme, heroImage: finalHeroImage }
            }))
            setHeroImageFile(null)
            setLogoFile(null)

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
            <AdminHeader title="Settings" backLink={`/${companySlug}/admin`} />

            <div className="max-w-4xl mx-auto px-4 py-12">
                {isLoading ? (
                    <p className="text-muted-foreground text-center">Loading settings...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-secondary/10 border border-border rounded-lg shadow-sm overflow-hidden line-clamp-none">
                        <Tabs defaultValue="general" className="w-full">
                            <div className="border-b border-border bg-secondary/30 px-6 py-4">
                                <TabsList className="grid w-full grid-cols-5 max-w-2xl h-12 bg-background/50 border border-border/50 rounded-md p-1">
                                    <TabsTrigger value="general" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm">General</TabsTrigger>
                                    <TabsTrigger value="theme" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm">Theme</TabsTrigger>
                                    <TabsTrigger value="landingPage" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm">Landing Page</TabsTrigger>
                                    <TabsTrigger value="payments" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm">Payments</TabsTrigger>
                                    <TabsTrigger value="seo" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm">SEO</TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="p-8">
                                <TabsContent value="general" className="mt-0 space-y-8 animate-in fade-in-50 duration-300">
                                    <div>
                                        <h2 className="text-xl font-light mb-6">Store Details</h2>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Company Name</label>
                                                <Input
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="bg-background border-border max-w-lg"
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
                                                    className="bg-background border-border max-w-lg"
                                                    required
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Your store will be accessible at <code>/{formData.slug || "slug"}</code>.
                                                </p>
                                            </div>

                                            <div className="border-t border-border pt-6 pb-2">
                                                <label className="block text-sm font-medium mb-1">Company Logo</label>
                                                {(formData.logo || logoFile) ? (
                                                    <div className="relative inline-block mt-2">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={logoFile ? URL.createObjectURL(logoFile) : formData.logo}
                                                            alt="Logo Preview"
                                                            className="h-24 w-24 object-contain bg-muted border border-border rounded-sm p-2"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setLogoFile(null)
                                                                setFormData(prev => ({ ...prev, logo: "" }))
                                                            }}
                                                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90 transition-colors"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="mt-2 h-24 w-24 border-2 border-dashed border-border rounded-sm flex items-center justify-center flex-col text-muted-foreground hover:bg-secondary/50 hover:border-primary transition-colors hover:text-primary cursor-pointer leading-tight text-center overflow-hidden">
                                                        <span className="text-xs font-medium px-2">Upload Logo</span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                setLogoFile(e.target.files[0])
                                                            }
                                                        }} />
                                                    </label>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-2 max-w-lg">
                                                    Displays in the main navigation bar. We recommend a transparent PNG/SVG.
                                                </p>
                                            </div>

                                            <div className="border-t border-border pt-4">
                                                <label className="block text-sm font-medium mb-1">Custom Domain (Optional)</label>
                                                <Input
                                                    name="customDomain"
                                                    value={formData.customDomain}
                                                    onChange={handleChange}
                                                    className="bg-background border-border max-w-lg"
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
                                                    className="bg-background border-border max-w-lg"
                                                    placeholder="e.g. mystore"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Your store will be accessible at <code>{formData.subdomain || "mystore"}.flairecosystem.com</code> (if configured).
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="theme" className="mt-0 space-y-8 animate-in fade-in-50 duration-300">
                                    <div>
                                        <h2 className="text-xl font-light mb-6">Theme Customization</h2>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Primary Color</label>
                                                <div className="flex items-center gap-4">
                                                    <Input
                                                        type="color"
                                                        name="theme.primaryColor"
                                                        value={formData.theme.primaryColor}
                                                        onChange={handleChange}
                                                        className="w-16 h-12 p-1 cursor-pointer bg-background border-border rounded-md"
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
                                                <label className="block text-sm font-medium mb-1">Customer Hero Image</label>
                                                {(formData.theme.heroImage || heroImageFile) ? (
                                                    <div className="relative inline-block mt-2 w-full max-w-lg">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={heroImageFile ? URL.createObjectURL(heroImageFile) : formData.theme.heroImage}
                                                            alt="Hero Preview"
                                                            className="h-40 w-full object-cover border border-border rounded-sm"
                                                            onError={(e) => {
                                                                ; (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" font-family="sans-serif" font-size="12" text-anchor="middle" alignment-baseline="middle" fill="%239ca3af">Invalid Image URL</text></svg>'
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setHeroImageFile(null)
                                                                setFormData(prev => ({ ...prev, theme: { ...prev.theme, heroImage: "" } }))
                                                            }}
                                                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90 transition-colors"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="mt-2 w-full max-w-lg h-40 border-2 border-dashed border-border rounded-sm flex items-center justify-center flex-col text-muted-foreground hover:bg-secondary/50 hover:border-primary transition-colors hover:text-primary cursor-pointer">
                                                        <span className="text-sm font-medium">Click to select Hero Image</span>
                                                        <span className="text-xs opacity-70 mt-1">Uploads safely to Cloudinary</span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                setHeroImageFile(e.target.files[0])
                                                            }
                                                        }} />
                                                    </label>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-2 max-w-lg">
                                                    The broad background image displayed at the very top of your storefront.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="landingPage" className="mt-0 space-y-8 animate-in fade-in-50 duration-300">
                                    <div>
                                        <h2 className="text-xl font-light mb-6">Storefront Landing Page Builder</h2>
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-medium mb-4 text-muted-foreground border-b border-border pb-2">Hero Section</h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Hero Title</label>
                                                        <Input
                                                            name="landingPage.heroTitle"
                                                            value={formData.landingPage.heroTitle}
                                                            onChange={handleChange}
                                                            className="bg-background border-border max-w-lg"
                                                            placeholder="e.g. SUMMER SALE"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Hero Subtitle</label>
                                                        <Input
                                                            name="landingPage.heroSubtitle"
                                                            value={formData.landingPage.heroSubtitle}
                                                            onChange={handleChange}
                                                            className="bg-background border-border max-w-lg"
                                                            placeholder="e.g. Up to 50% off all collections."
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 max-w-lg">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Button Text</label>
                                                            <Input
                                                                name="landingPage.heroButtonText"
                                                                value={formData.landingPage.heroButtonText}
                                                                onChange={handleChange}
                                                                className="bg-background border-border"
                                                                placeholder="e.g. Shop Now"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Button Link</label>
                                                            <Input
                                                                name="landingPage.heroButtonLink"
                                                                value={formData.landingPage.heroButtonLink}
                                                                onChange={handleChange}
                                                                className="bg-background border-border"
                                                                placeholder="e.g. /products?category=sale"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <h3 className="text-lg font-medium mb-4 text-muted-foreground border-b border-border pb-2">Featured Collections</h3>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Section Title</label>
                                                    <Input
                                                        name="landingPage.featuredCollectionsTitle"
                                                        value={formData.landingPage.featuredCollectionsTitle}
                                                        onChange={handleChange}
                                                        className="bg-background border-border max-w-lg"
                                                        placeholder="e.g. FEATURED COLLECTIONS"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <h3 className="text-lg font-medium mb-4 text-muted-foreground border-b border-border pb-2">Newsletter Widget</h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Widget Title</label>
                                                        <Input
                                                            name="landingPage.newsletterTitle"
                                                            value={formData.landingPage.newsletterTitle}
                                                            onChange={handleChange}
                                                            className="bg-background border-border max-w-lg"
                                                            placeholder="e.g. STAY CONNECTED"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Widget Subtitle</label>
                                                        <Input
                                                            name="landingPage.newsletterSubtitle"
                                                            value={formData.landingPage.newsletterSubtitle}
                                                            onChange={handleChange}
                                                            className="bg-background border-border max-w-lg"
                                                            placeholder="Subscribe for exclusive updates."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="payments" className="mt-0 space-y-8 animate-in fade-in-50 duration-300">
                                    <div>
                                        <h2 className="text-xl font-light mb-6">Payment Configuration</h2>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Paystack Public API Key</label>
                                                <Input
                                                    name="paystackPublicKey"
                                                    value={formData.paystackPublicKey}
                                                    onChange={handleChange}
                                                    className="bg-background border-border font-mono max-w-lg"
                                                    placeholder="pk_test_..."
                                                />
                                                <p className="text-xs text-muted-foreground mt-1 max-w-lg">
                                                    Provide your public Paystack API key. All checkout payments will be settled directly to your connected account instead of the global platform.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="seo" className="mt-0 space-y-8 animate-in fade-in-50 duration-300">
                                    <div>
                                        <h2 className="text-xl font-light mb-6">Search Engine Optimization (SEO)</h2>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">SEO Title Tag</label>
                                                <Input
                                                    name="seoTitle"
                                                    value={formData.seoTitle}
                                                    onChange={handleChange}
                                                    className="bg-background border-border max-w-lg"
                                                    placeholder={`e.g. ${formData.name || "My Brand"} | Premium Fashion`}
                                                />
                                                <p className="text-xs text-muted-foreground mt-1 max-w-lg">
                                                    The exact title shown inside the user's browser tab and on Google search results.
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">SEO Meta Description</label>
                                                <Input
                                                    name="seoDescription"
                                                    value={formData.seoDescription}
                                                    onChange={handleChange}
                                                    className="bg-background border-border max-w-lg"
                                                    placeholder="Discover the latest premium fashion collections..."
                                                />
                                                <p className="text-xs text-muted-foreground mt-1 max-w-lg">
                                                    A short description of your store used for search engine indexing. Limit to ~150 characters.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>

                            <div className="px-8 py-5 border-t border-border bg-secondary/30 flex justify-end">
                                <Button type="submit" disabled={isSaving} className="w-full md:w-auto min-w-[150px]">
                                    {isSaving ? "Saving..." : "Save Configuration"}
                                </Button>
                            </div>
                        </Tabs>
                    </form>
                )}
            </div>
        </div>
    )
}
