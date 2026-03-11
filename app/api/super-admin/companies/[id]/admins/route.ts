import dbConnect from "@/lib/db"
import User from "@/lib/models/user"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

export async function GET(
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

        const admins = await User.find({
            companyId: id,
            role: "admin"
        }).select("-password -verificationToken").sort({ createdAt: -1 })

        return Response.json(admins)
    } catch (error) {
        console.error("Store Admins GET error:", error)
        return Response.json(
            { error: "Failed to fetch store admins", data: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "super_admin") {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const { name, email, password } = await request.json()

        if (!name || !email || !password) {
            return Response.json({ error: "Missing required fields" }, { status: 400 })
        }

        await dbConnect()

        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            return Response.json({ error: "User with this email already exists" }, { status: 400 })
        }

        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role: "admin",
            companyId: id,
            emailVerified: true
        })

        const userResponse = newUser.toObject()
        delete userResponse.password

        return Response.json(userResponse, { status: 201 })
    } catch (error) {
        console.error("Store Admins POST error:", error)
        return Response.json(
            { error: "Failed to add store admin", data: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
