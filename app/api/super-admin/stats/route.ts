import dbConnect from "@/lib/db"
import Order from "@/lib/models/order"
import Company from "@/lib/models/company"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "super_admin") {
            return Response.json({ error: "Unauthorized", data: null }, { status: 401 })
        }

        await dbConnect()

        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const [salesAgg, orderCount, companyCount, companies, dailyRevenueAgg] = await Promise.all([
            // Global Total Sales
            Order.aggregate([
                { $match: { status: "completed" } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]),
            // Global Total Orders
            Order.countDocuments(),
            // Total Active Tenants
            Company.countDocuments(),
            // Sales grouped by Company
            Order.aggregate([
                { $match: { status: "completed" } },
                {
                    $group: {
                        _id: "$companyId", // Groups by CompanyObjectId
                        totalSales: { $sum: "$totalAmount" },
                        orderCount: { $sum: 1 },
                    },
                },
                {
                    $lookup: {
                        from: "companies", // Must match collection name
                        localField: "_id",
                        foreignField: "_id",
                        as: "companyInfo",
                    },
                },
                { $unwind: "$companyInfo" },
                {
                    $project: {
                        name: "$companyInfo.name",
                        slug: "$companyInfo.slug",
                        totalSales: 1,
                        orderCount: 1,
                    },
                },
                { $sort: { totalSales: -1 } },
            ]),
            // Daily Revenue over the last 7 days
            Order.aggregate([
                {
                    $match: {
                        status: "completed",
                        createdAt: { $gte: sevenDaysAgo }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        dailyTotal: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { _id: 1 } } // Sort by date ascending
            ])
        ])

        // Format chart data filling in empty days
        const chartData = []
        for (let i = 6; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dateStr = d.toISOString().split('T')[0]

            const found = dailyRevenueAgg.find((agg: any) => agg._id === dateStr)
            chartData.push({
                date: dateStr,
                revenue: found ? found.dailyTotal / 100 : 0 // Convert to standard currency format
            })
        }

        return Response.json({
            globalSales: salesAgg[0]?.total || 0,
            globalOrders: orderCount,
            totalTenants: companyCount,
            performanceByBrand: companies,
            revenueChartData: chartData
        })
    } catch (error) {
        console.error("Super Admin stats error:", error)
        return Response.json(
            { error: "Failed to fetch global stats", data: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
