"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { getStoreUrl } from "@/lib/utils"
import { ArrowLeft, Package } from "lucide-react"
import axios from "axios"

export default function CustomerOrdersPage({ params }: { params: Promise<{ companySlug: string }> }) {
    const unwrappedParams = use(params)
    const { companySlug } = unwrappedParams

    const { data: session, status } = useSession()
    const router = useRouter()

    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [companyContext, setCompanyContext] = useState<{ id: string, name: string, logo?: string } | null>(null)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(getStoreUrl(companySlug, "/auth/signin"))
        }
    }, [status, router, companySlug])

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // We need the companyId to fetch the right orders for this storefront
                const compRes = await axios.get(`/api/companies/${companySlug}`)
                const companyId = compRes.data._id || compRes.data.id

                setCompanyContext({ id: companyId, name: compRes.data.name, logo: compRes.data.logo })

                if (companyId) {
                    const ordersRes = await axios.get(`/api/account/orders?companyId=${companyId}`)
                    setOrders(ordersRes.data)
                }
            } catch (error) {
                console.error("Failed to load orders:", error)
            } finally {
                setIsLoading(false)
            }
        }

        if (session) {
            fetchOrders()
        }
    }, [session, companySlug])

    if (status === "loading" || isLoading) {
        return (
            <>
                <Navbar companySlug={companySlug} companyName={companyContext?.name} companyLogo={companyContext?.logo} />
                <div className="min-h-screen flex items-center justify-center">Loading orders...</div>
            </>
        )
    }

    if (!session) return null

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "text-green-600 bg-green-50 border-green-200"
            case "processing":
                return "text-blue-600 bg-blue-50 border-blue-200"
            case "shipped":
                return "text-indigo-600 bg-indigo-50 border-indigo-200"
            case "delivered":
                return "text-emerald-600 bg-emerald-50 border-emerald-200"
            case "pending":
                return "text-yellow-600 bg-yellow-50 border-yellow-200"
            case "failed":
            case "cancelled":
                return "text-red-600 bg-red-50 border-red-200"
            default:
                return "text-gray-600 bg-gray-50 border-gray-200"
        }
    }

    return (
        <>
            <Navbar companySlug={companySlug} companyName={companyContext?.name} companyLogo={companyContext?.logo} />
            <main className="min-h-screen bg-background pb-20">
                <div className="border-b border-border bg-secondary">
                    <div className="max-w-4xl mx-auto px-4 py-8">
                        <Link
                            href={getStoreUrl(companySlug, "/account")}
                            className="inline-flex items-center gap-2 mb-6 text-sm hover:text-primary transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Account
                        </Link>
                        <h1 className="text-3xl font-light tracking-widest uppercase mb-2">Order History</h1>
                        <p className="text-muted-foreground">Track and manage your recent purchases</p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-12">
                    {orders.length === 0 ? (
                        <div className="text-center py-20 border border-border border-dashed rounded-sm bg-secondary/10">
                            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h2 className="text-xl font-light mb-2">No orders found</h2>
                            <p className="text-muted-foreground mb-6">Looks like you haven't made any purchases yet.</p>
                            <Link href={getStoreUrl(companySlug, "/products")}>
                                <span className="inline-flex h-10 items-center justify-center rounded-sm bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                                    Start Shopping
                                </span>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div key={order._id || order.id} className="border border-border rounded-sm overflow-hidden bg-card">
                                    {/* Order Header */}
                                    <div className="bg-secondary/50 px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="grid grid-cols-2 sm:flex sm:gap-8 text-sm">
                                            <div>
                                                <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider">Date Placed</p>
                                                <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider">Total Amount</p>
                                                <p className="font-medium">₦{(order.totalAmount / 100).toLocaleString()}</p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1 mt-2 sm:mt-0">
                                                <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider">Order Reference</p>
                                                <p className="font-mono text-xs">{order.reference}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)} uppercase tracking-wider`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="px-6 py-4">
                                        <ul className="divide-y divide-border">
                                            {order.items.map((item: any, idx: number) => (
                                                <li key={idx} className="py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                                    <div>
                                                        <p className="font-medium text-sm">{item.name}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Qty: {item.quantity} {item.size && `| Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                                                        </p>
                                                    </div>
                                                    <p className="font-medium text-sm">
                                                        ₦{(item.price * item.quantity).toLocaleString()}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Order Footer (Shipping Info) */}
                                    <div className="bg-secondary/10 px-6 py-4 border-t border-border mt-auto">
                                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Shipping Details</h4>
                                        <p className="text-sm">{order.shippingAddress}</p>
                                        <p className="text-sm">{order.city}{order.state ? `, ${order.state}` : ''} {order.zip}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}
