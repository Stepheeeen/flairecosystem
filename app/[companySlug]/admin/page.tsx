"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, Users, DollarSign, Settings } from "lucide-react"
import axios from "axios"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Stats {
  totalSales: number
  orderCount: number
  productCount: number
  customerCount: number
  revenueHistory?: { date: string; revenue: number }[]
}

export default function AdminDashboard() {
  const params = useParams()
  const companySlug = params.companySlug as string
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/api/admin/stats")
        setStats(response.data)
      } catch (error) {
        console.error("Failed to load stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      label: "Total Sales",
      value: stats ? `₦${(stats.totalSales / 100).toLocaleString()}` : "—",
      icon: DollarSign,
    },
    {
      label: "Orders",
      value: stats?.orderCount?.toString() ?? "—",
      icon: ShoppingCart,
    },
    {
      label: "Products",
      value: stats?.productCount?.toString() ?? "—",
      icon: Package,
    },
    {
      label: "Customers",
      value: stats?.customerCount?.toString() ?? "—",
      icon: Users,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-light tracking-widest">ADMIN</h1>
            <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-light">
                      {isLoading ? "..." : stat.value}
                    </p>
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Revenue Chart */}
        {!isLoading && stats?.revenueHistory && (
          <div className="border border-border p-8 mb-12 bg-secondary/10">
            <h2 className="text-xl font-light mb-6 tracking-widest uppercase text-muted-foreground">30-Day Revenue</h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.revenueHistory}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", borderRadius: "4px" }}
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, "Revenue"]}
                    labelStyle={{ color: "var(--foreground)", marginBottom: "4px", fontWeight: 500 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href={`/${companySlug}/admin/products`} className="group">
            <div className="border border-border p-8 cursor-pointer hover:bg-muted transition-colors h-full flex flex-col">
              <Package className="h-8 w-8 mb-4 group-hover:text-primary transition-colors" />
              <h2 className="text-xl font-light mb-2">Manage Products</h2>
              <p className="text-sm text-muted-foreground mb-4 flex-grow">
                Add, edit, or delete products from your catalog
              </p>
              <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors border border-input bg-background group-hover:bg-accent group-hover:text-accent-foreground h-10 px-4 py-2 mt-auto">
                Go to Products
              </span>
            </div>
          </Link>

          <Link href={`/${companySlug}/admin/orders`} className="group">
            <div className="border border-border p-8 cursor-pointer hover:bg-muted transition-colors h-full flex flex-col">
              <ShoppingCart className="h-8 w-8 mb-4 group-hover:text-primary transition-colors" />
              <h2 className="text-xl font-light mb-2">View Orders</h2>
              <p className="text-sm text-muted-foreground mb-4 flex-grow">
                Monitor and manage customer orders
              </p>
              <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors border border-input bg-background group-hover:bg-accent group-hover:text-accent-foreground h-10 px-4 py-2 mt-auto">
                Go to Orders
              </span>
            </div>
          </Link>

          <Link href={`/${companySlug}/admin/settings`} className="group">
            <div className="border border-border p-8 cursor-pointer hover:bg-muted transition-colors h-full flex flex-col">
              <Settings className="h-8 w-8 mb-4 group-hover:text-primary transition-colors" />
              <h2 className="text-xl font-light mb-2">Store Settings</h2>
              <p className="text-sm text-muted-foreground mb-4 flex-grow">
                Configure your store details and custom domains
              </p>
              <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors border border-input bg-background group-hover:bg-accent group-hover:text-accent-foreground h-10 px-4 py-2 mt-auto">
                Go to Settings
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
