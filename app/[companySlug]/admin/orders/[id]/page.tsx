"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function AdminOrderDetailPage({ params }: { params: Promise<{ companySlug: string, id: string }> }) {
    const unwrappedParams = use(params)
    const { companySlug, id } = unwrappedParams

    const router = useRouter()
    const [order, setOrder] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`/api/admin/orders/${id}`)
                setOrder(response.data)
            } catch (error) {
                console.error("Failed to load order:", error)
                toast.error("Failed to load order details")
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrder()
    }, [id])

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true)
        try {
            await axios.patch(`/api/admin/orders/${id}`, { status: newStatus })
            setOrder({ ...order, status: newStatus })
            toast.success(`Order status updated to ${newStatus}`)
        } catch (error) {
            console.error("Failed to update order:", error)
            toast.error("Failed to update order status")
        } finally {
            setIsUpdating(false)
        }
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-background">Loading order details...</div>
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <p className="text-muted-foreground mb-4">Order not found</p>
                <Link href={`/${companySlug}/admin/orders`}>
                    <Button>Back to Orders</Button>
                </Link>
            </div>
        )
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />
            case 'processing': return <Package className="h-5 w-5 text-blue-600" />
            case 'shipped': return <Truck className="h-5 w-5 text-indigo-600" />
            case 'delivered':
            case 'completed': return <CheckCircle className="h-5 w-5 text-emerald-600" />
            case 'failed':
            case 'cancelled': return <XCircle className="h-5 w-5 text-red-600" />
            default: return <Package className="h-5 w-5 text-gray-600" />
        }
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="border-b border-border bg-secondary">
                <div className="max-w-5xl mx-auto px-4 py-6">
                    <Link
                        href={`/${companySlug}/admin/orders`}
                        className="inline-flex items-center gap-2 mb-6 text-sm hover:text-primary transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Orders
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-light tracking-widest uppercase mb-1">
                                Order #{order.reference}
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Placed on {new Date(order.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 bg-background px-4 py-2 border border-border rounded-sm">
                            {getStatusIcon(order.status)}
                            <span className="uppercase tracking-widest font-medium text-sm">
                                {order.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content: Items and Actions */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Fulfillment Actions */}
                        <div className="border border-border p-6 bg-card rounded-sm">
                            <h2 className="text-lg font-medium mb-4 uppercase tracking-widest">Update Status</h2>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={order.status === 'processing' ? 'default' : 'outline'}
                                    onClick={() => handleStatusChange('processing')}
                                    disabled={isUpdating || order.status === 'processing'}
                                    className="text-xs uppercase tracking-wider"
                                >
                                    Mark Processing
                                </Button>
                                <Button
                                    variant={order.status === 'shipped' ? 'default' : 'outline'}
                                    onClick={() => handleStatusChange('shipped')}
                                    disabled={isUpdating || order.status === 'shipped'}
                                    className="text-xs uppercase tracking-wider"
                                >
                                    Mark Shipped
                                </Button>
                                <Button
                                    variant={order.status === 'delivered' ? 'default' : 'outline'}
                                    onClick={() => handleStatusChange('delivered')}
                                    disabled={isUpdating || order.status === 'delivered'}
                                    className="text-xs uppercase tracking-wider"
                                >
                                    Mark Delivered
                                </Button>
                                <div className="w-full h-px bg-border my-2 block sm:hidden" />
                                <Button
                                    variant={order.status === 'cancelled' ? 'destructive' : 'outline'}
                                    onClick={() => handleStatusChange('cancelled')}
                                    disabled={isUpdating || order.status === 'cancelled'}
                                    className="text-xs uppercase tracking-wider text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    Cancel Order
                                </Button>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="border border-border rounded-sm overflow-hidden bg-card">
                            <div className="bg-secondary/50 px-6 py-4 border-b border-border">
                                <h2 className="text-sm font-medium uppercase tracking-widest">Items ({order.items.length})</h2>
                            </div>
                            <div className="p-6">
                                <ul className="divide-y divide-border -my-4">
                                    {order.items.map((item: any, idx: number) => (
                                        <li key={idx} className="py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                            <div>
                                                <p className="font-medium text-sm">{item.name}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Qty: {item.quantity}
                                                    {item.size && <span className="ml-2 bg-secondary px-2 py-0.5 rounded">Size: {item.size}</span>}
                                                    {item.color && <span className="ml-2 bg-secondary px-2 py-0.5 rounded">Color: {item.color}</span>}
                                                </p>
                                            </div>
                                            <p className="font-medium text-sm whitespace-nowrap">
                                                ₦{(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-secondary/10 px-6 py-4 border-t border-border flex justify-between items-center text-sm font-medium">
                                <span className="uppercase tracking-widest">Total Paid</span>
                                <span>₦{(order.totalAmount / 100).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Customer Info */}
                    <div className="space-y-6">
                        <div className="border border-border p-6 bg-card rounded-sm">
                            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Customer</h3>
                            <p className="font-medium text-sm">{order.customerName}</p>
                            <p className="text-sm text-primary mb-1 break-all">
                                <a href={`mailto:${order.customerEmail}`} className="hover:underline">{order.customerEmail}</a>
                            </p>
                            {order.customerPhone && (
                                <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                            )}
                        </div>

                        <div className="border border-border p-6 bg-card rounded-sm">
                            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Shipping Address</h3>
                            <p className="text-sm">{order.shippingAddress}</p>
                            <p className="text-sm">{order.city}{order.state ? `, ${order.state}` : ''}</p>
                            {order.zip && <p className="text-sm">{order.zip}</p>}
                        </div>

                        <div className="border border-border p-6 bg-card rounded-sm">
                            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Payment</h3>
                            <p className="text-sm flex justify-between mb-2">
                                <span className="text-muted-foreground">Status</span>
                                {order.paidAt || order.status === 'completed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? (
                                    <span className="text-emerald-600 font-medium tracking-wide">PAID</span>
                                ) : (
                                    <span className="text-yellow-600 font-medium tracking-wide">UNPAID</span>
                                )}
                            </p>
                            {order.paidAt && (
                                <p className="text-xs text-muted-foreground text-right">
                                    on {new Date(order.paidAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
