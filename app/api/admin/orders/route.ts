import dbConnect from "@/lib/db"
import Order from "@/lib/models/order"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return Response.json({ error: "Unauthorized", data: null }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const filter: Record<string, any> = {}

    // Isolation logic
    if (session.user.role === "admin" && session.user.companyId) {
      if (!mongoose.Types.ObjectId.isValid(session.user.companyId)) {
        return Response.json({ error: "Invalid Company ID", data: null }, { status: 400 })
      }
      filter.companyId = new mongoose.Types.ObjectId(session.user.companyId)
    }

    if (status) {
      filter.status = status
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 })
    return Response.json(orders)
  } catch (error) {
    console.error("Admin orders error:", error)
    return Response.json(
      { error: "Failed to fetch orders", data: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
