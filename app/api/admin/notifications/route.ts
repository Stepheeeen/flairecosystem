import dbConnect from "@/lib/db"
import Notification from "@/lib/models/notification"
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
            filter.companyId = new mongoose.Types.ObjectId(session.user.companyId)
        }

        const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(20)

        const unreadCount = await Notification.countDocuments({
            ...filter,
            read: false
        })

        return Response.json({ notifications, unreadCount })
    } catch (error) {
        console.error("Notifications fetch error:", error)
        return Response.json({ error: "Failed to fetch notifications", data: null }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
            return Response.json({ error: "Unauthorized", data: null }, { status: 401 })
        }

        const { id } = await request.json()

        await dbConnect()

        const filter: any = { _id: new mongoose.Types.ObjectId(id) }
        if (session.user.role === "admin" && session.user.companyId) {
            filter.companyId = new mongoose.Types.ObjectId(session.user.companyId)
        }

        const notification = await Notification.findOneAndUpdate(
            filter,
            { read: true },
            { new: true }
        )

        if (!notification) {
            return Response.json({ error: "Notification not found", data: null }, { status: 404 })
        }

        return Response.json({ notification })
    } catch (error) {
        console.error("Notification update error:", error)
        return Response.json({ error: "Failed to update notification", data: null }, { status: 500 })
    }
}
