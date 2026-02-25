import dbConnect from "@/lib/db"
import PlatformSettings from "@/lib/models/platform-settings"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "super_admin") {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()

        let settings = await PlatformSettings.findOne()

        // Auto-initialize if it doesn't exist yet
        if (!settings) {
            settings = await PlatformSettings.create({})
        }

        return Response.json(settings)
    } catch (error) {
        console.error("Super Admin Settings GET error:", error)
        return Response.json(
            { error: "Failed to fetch platform settings", data: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "super_admin") {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()
        const updates = await request.json()

        // Get the singleton
        let settings = await PlatformSettings.findOne()

        if (!settings) {
            settings = await PlatformSettings.create(updates)
        } else {
            // Update fields
            if (updates.platformCommissionRate !== undefined) settings.platformCommissionRate = updates.platformCommissionRate
            if (updates.globalMaintenanceMode !== undefined) settings.globalMaintenanceMode = updates.globalMaintenanceMode
            if (updates.supportEmail !== undefined) settings.supportEmail = updates.supportEmail
            await settings.save()
        }

        return Response.json(settings)
    } catch (error) {
        console.error("Super Admin Settings PATCH error:", error)
        return Response.json(
            { error: "Failed to update platform settings", data: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
