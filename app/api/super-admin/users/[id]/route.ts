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

        const { name, email, password, role, companyId } = await request.json()

        const user = await User.findById(id)
        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 })
        }

        if (name) user.name = name
        if (email) user.email = email.toLowerCase()
        if (password && password.length >= 6) user.password = password
        if (role) user.role = role
        if (companyId !== undefined) user.companyId = companyId || null

        await user.save()

        const userResponse = user.toObject()
        delete userResponse.password

        return Response.json(userResponse)
    } catch (error) {
        console.error("Super Admin Users PATCH error:", error)
        return Response.json(
            { error: "Failed to update user", data: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "super_admin") {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        await dbConnect()

        const deletedUser = await User.findByIdAndDelete(id)

        if (!deletedUser) {
            return Response.json({ error: "User not found" }, { status: 404 })
        }

        return Response.json({ message: "User deleted successfully" })
    } catch (error) {
        console.error("Super Admin Users DELETE error:", error)
        return Response.json(
            { error: "Failed to delete user", data: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
