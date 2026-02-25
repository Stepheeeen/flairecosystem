import dbConnect from "@/lib/db"
import Order from "@/lib/models/order"
import Product from "@/lib/models/product"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return Response.json({ error: "Unauthorized", data: null }, { status: 401 })
    }

    await dbConnect()

    const filter: any = {}
    if (session.user.role === "admin" && session.user.companyId) {
      if (!mongoose.Types.ObjectId.isValid(session.user.companyId)) {
        return Response.json({ error: "Invalid Company ID", data: null }, { status: 400 })
      }
      filter.companyId = new mongoose.Types.ObjectId(session.user.companyId)
    }

    const [salesAgg, orderCount, productCount, customerAgg] = await Promise.all([
      Order.aggregate([
        { $match: { status: "completed", ...filter } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments(filter),
      Product.countDocuments(filter),
      Order.distinct("customerEmail", filter),
    ])

    return Response.json({
      totalSales: salesAgg[0]?.total || 0,
      orderCount,
      productCount,
      customerCount: customerAgg.length,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return Response.json(
      { error: "Failed to fetch stats", data: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
