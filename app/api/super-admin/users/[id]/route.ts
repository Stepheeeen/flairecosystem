import dbConnect from "@/lib/db"
import User from "@/lib/models/user"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "super_admin") {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        await dbConnect()

        const { password } = await request.json()

        if (!password || password.length < 6) {
            return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 })
        }

        // We find the user and explicitly reset their password
        const user = await User.findById(id)

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 })
        }

        user.password = password
        await user.save()

        return Response.json({ message: "Password updated successfully" })
    } catch (error) {
        console.error("Super Admin Users PATCH error:", error)
        return Response.json(
            { error: "Failed to update user password", data: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
