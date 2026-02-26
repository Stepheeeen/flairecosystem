import dbConnect from "@/lib/db"
import Order from "@/lib/models/order"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sendOrderShippedEmail } from "@/lib/emails"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return Response.json({ error: "Unauthorized", data: null }, { status: 401 })
    }

    await dbConnect()
    const { id } = await params
    const { status } = await request.json()

    if (!["pending", "completed", "processing", "shipped", "delivered", "cancelled", "failed"].includes(status)) {
      return Response.json(
        { error: "Invalid status", data: null },
        { status: 400 }
      )
    }

    // Ownership check for tenant admins
    if (session.user.role === "admin") {
      const existingOrder = await Order.findById(id)
      if (!existingOrder) {
        return Response.json({ error: "Order not found", data: null }, { status: 404 })
      }
      if (existingOrder.companyId.toString() !== session.user.companyId) {
        return Response.json({ error: "Unauthorized access to order", data: null }, { status: 403 })
      }
    }

    const update: Record<string, any> = { status }
    if (status === "completed") {
      update.paidAt = new Date()
    }

    const order = await Order.findByIdAndUpdate(id, update, { new: true })
    if (!order) {
      return Response.json({ error: "Order not found", data: null }, { status: 404 })
    }

    if (status === "shipped") {
      await sendOrderShippedEmail(order.customerEmail, order.customerName, order.reference)
    }

    return Response.json(order)
  } catch (error) {
    console.error("Order PATCH error:", error)
    return Response.json(
      { error: "Failed to update order", data: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return Response.json({ error: "Unauthorized", data: null }, { status: 401 })
    }

    await dbConnect()
    const { id } = await params

    const order = await Order.findById(id)
    if (!order) {
      return Response.json({ error: "Order not found", data: null }, { status: 404 })
    }

    // Ownership check for tenant admins
    if (session.user.role === "admin" && order.companyId.toString() !== session.user.companyId) {
      return Response.json({ error: "Unauthorized access to order", data: null }, { status: 403 })
    }

    return Response.json(order)
  } catch (error) {
    console.error("Order GET error:", error)
    return Response.json(
      { error: "Failed to fetch order", data: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
