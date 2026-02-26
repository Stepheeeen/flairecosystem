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

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [salesAgg, orderCount, productCount, customerAgg, historyAgg] = await Promise.all([
      Order.aggregate([
        { $match: { status: "completed", ...filter } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments(filter),
      Product.countDocuments(filter),
      Order.distinct("customerEmail", filter),
      Order.aggregate([
        { $match: { status: "completed", createdAt: { $gte: thirtyDaysAgo }, ...filter } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            dailyRevenue: { $sum: "$totalAmount" }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ])

    // Format history string for easy charting
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const revenueHistory = historyAgg.map((h: any) => {
      const [y, m, d] = h._id.split('-')
      return {
        date: `${months[parseInt(m) - 1]} ${d}`,
        revenue: h.dailyRevenue
      }
    })

    return Response.json({
      totalSales: salesAgg[0]?.total || 0,
      orderCount,
      productCount,
      customerCount: customerAgg.length,
      revenueHistory,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return Response.json(
      { error: "Failed to fetch stats", data: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
