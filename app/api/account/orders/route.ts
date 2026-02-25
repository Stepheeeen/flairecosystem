import dbConnect from "@/lib/db"
import Order from "@/lib/models/order"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return Response.json({ error: "Unauthorized", data: null }, { status: 401 })
        }

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const companyIdStr = searchParams.get("companyId")

        if (!companyIdStr || !mongoose.Types.ObjectId.isValid(companyIdStr)) {
            return Response.json({ error: "Invalid Company ID", data: null }, { status: 400 })
        }

        // Only get orders for this specific logged in user AND this specific company storefront
        const orders = await Order.find({
            userId: new mongoose.Types.ObjectId(session.user.id),
            companyId: new mongoose.Types.ObjectId(companyIdStr),
        }).sort({ createdAt: -1 })

        return Response.json(orders)
    } catch (error) {
        console.error("Customer orders GET error:", error)
        return Response.json(
            { error: "Failed to fetch orders", data: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
