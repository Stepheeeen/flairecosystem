"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, UserPlus, ShieldAlert, Trash2, Edit2, Check, X, Building2 } from "lucide-react"
import axios from "axios"
import Link from "next/link"
import { toast } from "sonner"

export default function StoreOverviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [company, setCompany] = useState<any>(null)
    const [admins, setAdmins] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // New Admin Form
    const [showAddForm, setShowAddForm] = useState(false)
    const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" })
    const [isSaving, setIsSaving] = useState(false)

    // Editing State
    const [editingAdminId, setEditingAdminId] = useState<string | null>(null)
    const [editData, setEditData] = useState({ name: "", email: "" })

    // Logo state
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [isUpdatingLogo, setIsUpdatingLogo] = useState(false)

    const handleLogoUpload = async (file: File) => {
        setIsUpdatingLogo(true)
        try {
            const data = new FormData()
            data.append("file", file)
            data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "flair_products")
            const uploadRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                data
            )
            const logoUrl = uploadRes.data.secure_url

            await axios.put(`/api/companies/${id}`, {
                ...company,
                logo: logoUrl
            })

            setCompany({ ...company, logo: logoUrl })
            setLogoFile(null)
            toast.success("Logo updated successfully")
        } catch (error: any) {
            toast.error("Failed to update logo")
        } finally {
            setIsUpdatingLogo(false)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [companyRes, adminsRes] = await Promise.all([
                    axios.get(`/api/companies/${id}`),
                    axios.get(`/api/super-admin/companies/${id}/admins`)
                ])
                setCompany(companyRes.data)
                setAdmins(adminsRes.data)
            } catch (error) {
                console.error("Failed to load store data", error)
                toast.error("Failed to load store data")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [id])

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const res = await axios.post(`/api/super-admin/companies/${id}/admins`, newAdmin)
            setAdmins([res.data, ...admins])
            setNewAdmin({ name: "", email: "", password: "" })
            setShowAddForm(false)
            toast.success("Admin added successfully")
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to add admin")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteAdmin = async (adminId: string) => {
        if (!confirm("Are you sure you want to remove this admin?")) return
        try {
            await axios.delete(`/api/super-admin/users/${adminId}`)
            setAdmins(admins.filter(a => a._id !== adminId))
            toast.success("Admin removed")
        } catch (error: any) {
            toast.error("Failed to remove admin")
        }
    }

    const handleStartEdit = (admin: any) => {
        setEditingAdminId(admin._id)
        setEditData({ name: admin.name, email: admin.email })
    }

    const handleSaveEdit = async (adminId: string) => {
        try {
            const res = await axios.patch(`/api/super-admin/users/${adminId}`, editData)
            setAdmins(admins.map(a => a._id === adminId ? res.data : a))
            setEditingAdminId(null)
            toast.success("Admin updated")
        } catch (error: any) {
            toast.error("Failed to update admin")
        }
    }

    const handleDeleteStore = async () => {
        if (!confirm("CRITICAL: Are you sure you want to delete this entire storefront? This action cannot be undone.")) return
        const confirmPhrase = prompt("Type the store name to confirm deletion:")
        if (confirmPhrase !== company.name) {
            toast.error("Confirmation failed. Store not deleted.")
            return
        }

        try {
            await axios.delete(`/api/companies/${id}`)
            toast.success("Store deleted successfully")
            window.location.href = "/super-admin"
        } catch (error: any) {
            toast.error("Failed to delete store")
        }
    }

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading Store Metrics...</div>

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <Link href="/super-admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
                <div className="flex gap-4">
                    <Button variant="destructive" size="sm" onClick={handleDeleteStore}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Store
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 relative group">
                    <div className="h-24 w-24 rounded-lg border border-border bg-secondary/30 overflow-hidden flex items-center justify-center p-2">
                        {company?.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={company.logo} alt={company.name} className="h-full w-full object-contain" />
                        ) : (
                            <Building2 className="w-8 h-8 text-muted-foreground" />
                        )}
                    </div>
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-lg">
                        <span className="text-[10px] text-white font-bold uppercase tracking-tighter">{isUpdatingLogo ? "..." : "Change"}</span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            disabled={isUpdatingLogo}
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleLogoUpload(file)
                            }}
                        />
                    </label>
                </div>
                <div className="flex-1 space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight uppercase">{company?.name}</h1>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Slug: <strong>{company?.slug}</strong></span>
                        {company?.customDomain && <span>Domain: <strong className="text-blue-500">{company.customDomain}</strong></span>}
                    </div>
                </div>
                <Card className="w-full md:w-64 bg-secondary/20">
                    <CardHeader className="py-2">
                        <CardDescription className="text-xs uppercase tracking-widest">Status</CardDescription>
                        <CardTitle className={`text-sm ${company?.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                            {company?.status?.toUpperCase()}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Admin Management */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Management & Access</CardTitle>
                            <CardDescription>Authorized administrators for this storefront.</CardDescription>
                        </div>
                        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
                            {showAddForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4 mr-2" />}
                            {showAddForm ? "Cancel" : "Add Admin"}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {showAddForm && (
                            <form onSubmit={handleAddAdmin} className="p-4 bg-secondary/30 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-end animate-in slide-in-from-top-2 duration-300">
                                <div className="space-y-2 col-span-1">
                                    <label className="text-xs font-semibold uppercase">Full Name</label>
                                    <Input value={newAdmin.name} onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })} required />
                                </div>
                                <div className="space-y-2 col-span-1">
                                    <label className="text-xs font-semibold uppercase">Email Address</label>
                                    <Input type="email" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} required />
                                </div>
                                <div className="space-y-2 col-span-1">
                                    <label className="text-xs font-semibold uppercase">Password</label>
                                    <Input type="password" value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} required />
                                </div>
                                <Button type="submit" disabled={isSaving} className="w-full">
                                    {isSaving ? "Saving..." : "Create Account"}
                                </Button>
                            </form>
                        )}

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Admin Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {admins.map((admin) => (
                                    <TableRow key={admin._id}>
                                        <TableCell>
                                            {editingAdminId === admin._id ? (
                                                <Input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                                            ) : (
                                                <span className="font-medium">{admin.name}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingAdminId === admin._id ? (
                                                <Input type="email" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} />
                                            ) : (
                                                <span className="text-muted-foreground">{admin.email}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {editingAdminId === admin._id ? (
                                                    <>
                                                        <Button size="icon" variant="ghost" className="text-green-600" onClick={() => handleSaveEdit(admin._id)}>
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="text-red-600" onClick={() => setEditingAdminId(null)}>
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button size="icon" variant="ghost" onClick={() => handleStartEdit(admin)}>
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteAdmin(admin._id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {admins.length === 0 && !showAddForm && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                            No active administrators found for this store.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Configuration Stats Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Platform Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Store ID</span>
                            <span className="font-mono text-xs">{company._id}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Created On</span>
                            <span>{new Date(company.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Custom Domains</span>
                            <span>{company.customDomain ? "ENABLED" : "NONE"}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
