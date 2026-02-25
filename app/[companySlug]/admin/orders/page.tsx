"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import axios from "axios"

interface Order {
  _id: string
  id: string
  reference: string
  customerName: string
  customerEmail: string
  totalAmount: number
  status: "pending" | "completed" | "processing" | "shipped" | "delivered" | "cancelled" | "failed"
  createdAt: string
}

export default function AdminOrdersPage() {
  const params = useParams()
  const companySlug = params.companySlug as string
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/admin/orders")
        setOrders(response.data)
      } catch (error) {
        console.error("Failed to load orders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50"
      case "processing":
        return "text-blue-600 bg-blue-50"
      case "shipped":
        return "text-indigo-600 bg-indigo-50"
      case "delivered":
        return "text-emerald-600 bg-emerald-50"
      case "pending":
        return "text-yellow-600 bg-yellow-50"
      case "failed":
      case "cancelled":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await axios.patch(`/api/admin/orders/${orderId}`, { status: newStatus })
      setOrders((prev) =>
        prev.map((o) =>
          (o._id || o.id) === orderId ? { ...o, status: newStatus as Order["status"] } : o
        )
      )
    } catch (error) {
      console.error("Failed to update order:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link
              href={`/${companySlug}/admin`}
              className="flex items-center gap-2 text-sm hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Link>
            <h1 className="text-3xl font-light tracking-widest">ORDERS</h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Orders Table */}
        <div className="border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Reference
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id || order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono">
                      <Link href={`/${companySlug}/admin/orders/${order._id || order.id}`} className="hover:text-primary hover:underline">
                        {order.reference}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      ₦{(order.totalAmount / 100).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(order.status)} uppercase tracking-wider`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2 items-center">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id || order.id, e.target.value)}
                        className="text-xs border border-border rounded px-2 py-1.5 bg-background cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="failed">Failed</option>
                      </select>
                      <Link href={`/${companySlug}/admin/orders/${order._id || order.id}`} className="text-xs text-muted-foreground hover:text-primary uppercase tracking-wider ml-2">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
