import dbConnect from "@/lib/db"
import User from "@/lib/models/user"
import Company from "@/lib/models/company"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "super_admin") {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const role = searchParams.get('role')
        const companyId = searchParams.get('companyId')

        const query: any = {}
        if (role) query.role = role
        if (companyId) query.companyId = companyId

        // Provide populated company info on the users for the UI
        const users = await User.find(query)
            .populate('companyId', 'name slug status')
            .select('-password -verificationToken') // exclude sensitive
            .sort({ createdAt: -1 })
            .lean()

        return Response.json(users)
    } catch (error) {
        console.error("Super Admin Users GET error:", error)
        return Response.json(
            { error: "Failed to fetch users", data: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
