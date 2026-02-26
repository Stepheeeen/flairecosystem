import dbConnect from "@/lib/db"
import User from "@/lib/models/user"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

// Fetch the logged in user's profile and address book
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()
        const user = await User.findById(session.user.id).select("-password -__v")

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error("Profile GET error:", error)
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }
}

// Update the user's address book
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()
        const { addressBook } = await request.json()

        if (!Array.isArray(addressBook)) {
            return NextResponse.json({ error: "addressBook must be an array" }, { status: 400 })
        }

        // Force one default address if applicable
        const hasDefault = addressBook.some(a => a.isDefault)
        if (addressBook.length > 0 && !hasDefault) {
            addressBook[0].isDefault = true
        }

        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { addressBook },
            { new: true, runValidators: true }
        ).select("-password -__v")

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error("Profile PUT error:", error)
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }
}
