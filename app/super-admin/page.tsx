"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, ShoppingCart, Building2, TrendingUp } from "lucide-react"
import axios from "axios"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function SuperAdminDashboard() {
    const [companies, setCompanies] = useState<any[]>([])
    const [adminUsers, setAdminUsers] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const [platformSettings, setPlatformSettings] = useState<any>(null)
    const [isSavingSettings, setIsSavingSettings] = useState(false)
    const [newCompanyName, setNewCompanyName] = useState("")
    const [newCompanySlug, setNewCompanySlug] = useState("")
    const [adminEmail, setAdminEmail] = useState("")
    const [adminPassword, setAdminPassword] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [compRes, statsRes, adminRes, settingsRes] = await Promise.all([
                    axios.get("/api/companies"),
                    axios.get("/api/super-admin/stats"),
                    axios.get("/api/super-admin/users?role=admin"),
                    axios.get("/api/super-admin/settings")
                ])
                setCompanies(compRes.data)
                setStats(statsRes.data)
                setAdminUsers(adminRes.data)
                setPlatformSettings(settingsRes.data)
            } catch (error) {
                console.error("Failed to load dashboard data", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    const handleCreateCompany = async () => {
        if (!newCompanyName || !newCompanySlug) return

        try {
            const res = await axios.post("/api/companies", {
                name: newCompanyName,
                slug: newCompanySlug,
                adminEmail: adminEmail || undefined,
                adminPassword: adminPassword || undefined
            })
            setCompanies([res.data, ...companies])
            setNewCompanyName("")
            setNewCompanySlug("")
            setAdminEmail("")
            setAdminPassword("")
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to create company")
        }
    }

    const handleToggleStatus = async (companyId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === "active" ? "suspended" : "active"
            const res = await axios.patch(`/api/companies/${companyId}`, { status: newStatus })
            setCompanies(companies.map(c => c._id === companyId || c.id === companyId ? { ...c, status: res.data.status } : c))
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to update status")
        }
    }

    const handleResetPassword = async (userId: string, currentEmail: string) => {
        const newPassword = prompt(`Enter new password for ${currentEmail} (min 6 chars):`)
        if (!newPassword) return

        try {
            await axios.patch(`/api/super-admin/users/${userId}`, { password: newPassword })
            alert(`Password for ${currentEmail} updated successfully.`)
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to reset password")
        }
    }

    const handleSaveSettings = async () => {
        setIsSavingSettings(true)
        try {
            const res = await axios.patch("/api/super-admin/settings", {
                platformCommissionRate: parseFloat(platformSettings.platformCommissionRate),
                supportEmail: platformSettings.supportEmail,
                globalMaintenanceMode: platformSettings.globalMaintenanceMode
            })
            setPlatformSettings(res.data)
            alert("Platform Settings updated successfully")
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to update platform settings")
        } finally {
            setIsSavingSettings(false)
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Flair Eco System Global Dashboard</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Global Sales</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "..." : `₦${(stats?.globalSales / 100 || 0).toLocaleString()}`}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Global Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "..." : stats?.globalOrders || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Brands</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "..." : stats?.totalTenants || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Platform Revenue (Trailing 7 Days)
                    </CardTitle>
                    <CardDescription>Daily aggregated sales volume across all storefronts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full mt-4">
                        {isLoading ? (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                Loading chart data...
                            </div>
                        ) : stats?.revenueChartData?.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                                        }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                        tickFormatter={(value) => `₦${value.toLocaleString()}`}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString("en-US", { weekday: 'long', month: "long", day: "numeric" })}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                No sales data available for the last 7 days.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Platform Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Global Platform Settings</CardTitle>
                    <CardDescription>Configure core system behavior across all tenants.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Commission Rate (%)</label>
                            <Input
                                type="number"
                                min="0" max="100" step="0.1"
                                value={platformSettings?.platformCommissionRate || 0}
                                onChange={(e) => setPlatformSettings({ ...platformSettings, platformCommissionRate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Support Email</label>
                            <Input
                                type="email"
                                value={platformSettings?.supportEmail || ""}
                                onChange={(e) => setPlatformSettings({ ...platformSettings, supportEmail: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="maintenance"
                            checked={platformSettings?.globalMaintenanceMode || false}
                            onChange={(e) => setPlatformSettings({ ...platformSettings, globalMaintenanceMode: e.target.checked })}
                            className="w-4 h-4 accent-primary"
                        />
                        <label htmlFor="maintenance" className="text-sm cursor-pointer select-none">
                            Enable Global Maintenance Mode (Blocks checkout on all stores)
                        </label>
                    </div>
                    <Button onClick={handleSaveSettings} disabled={isSavingSettings} className="mt-4">
                        {isSavingSettings ? "Saving..." : "Save Config"}
                    </Button>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Brand Performance Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sales by Brand</CardTitle>
                        <CardDescription>Top performing tenants across the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Brand Name</TableHead>
                                    <TableHead className="text-right">Orders</TableHead>
                                    <TableHead className="text-right">Total Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow key="loading">
                                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">Loading performance data...</TableCell>
                                    </TableRow>
                                ) : stats?.performanceByBrand?.length === 0 ? (
                                    <TableRow key="empty">
                                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No sales data recorded yet.</TableCell>
                                    </TableRow>
                                ) : (
                                    stats?.performanceByBrand?.map((brand: any) => (
                                        <TableRow key={brand.slug}>
                                            <TableCell className="font-medium">{brand.name}</TableCell>
                                            <TableCell className="text-right">{brand.orderCount}</TableCell>
                                            <TableCell className="text-right">₦{(brand.totalSales / 100).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Company Management */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Register New Brand</CardTitle>
                            <CardDescription>Provision a new tenant storefront.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="Brand Name (e.g., Flair)"
                                value={newCompanyName}
                                onChange={(e) => setNewCompanyName(e.target.value)}
                            />
                            <Input
                                placeholder="URL Slug (e.g., flair)"
                                value={newCompanySlug}
                                onChange={(e) => setNewCompanySlug(e.target.value)}
                            />
                            <div className="pt-2 border-t border-border mt-2">
                                <p className="text-xs text-muted-foreground mb-2">Initial Admin Account (Optional)</p>
                                <Input
                                    placeholder="Admin Email"
                                    type="email"
                                    value={adminEmail}
                                    onChange={(e) => setAdminEmail(e.target.value)}
                                    className="mb-2"
                                />
                                <Input
                                    placeholder="Admin Password"
                                    type="password"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleCreateCompany} className="w-full mt-4">Provision Tenant</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tenant Directory</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Store URL</TableHead>
                                        <TableHead className="text-right">Access Control</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {companies.length === 0 ? (
                                        <TableRow key="empty">
                                            <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                                                No companies found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        companies.map((company) => (
                                            <TableRow key={company._id || company.slug}>
                                                <TableCell className="font-medium">{company.name}</TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    <div>/{company.slug}</div>
                                                    {company.customDomain && <div className="text-blue-500">{company.customDomain}</div>}
                                                    {company.subdomain && <div className="text-orange-500">{company.subdomain}.flairecosystem.com</div>}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant={company.status === "active" ? "outline" : "destructive"}
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(company._id || company.id, company.status || "active")}
                                                    >
                                                        {company.status === "suspended" ? "Unsuspend Site" : "Suspend Site"}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Admin User Directory</CardTitle>
                            <CardDescription>Manage brand owners and administrators.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Brand</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {adminUsers.length === 0 ? (
                                        <TableRow key="empty">
                                            <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                                No admin users found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        adminUsers.map((user) => (
                                            <TableRow key={user._id}>
                                                <TableCell className="font-medium text-sm">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {user.companyId?.name || "Unassigned"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleResetPassword(user._id, user.email)}
                                                    >
                                                        Reset Password
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
