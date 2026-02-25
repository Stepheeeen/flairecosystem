import dbConnect from "@/lib/db"
import User from "@/lib/models/user"

export async function POST(request: Request) {
    try {
        const { token } = await request.json()

        if (!token) {
            return Response.json({ error: "Verification token is required" , data: null }, { status: 400 })
        }

        await dbConnect()

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiry: { $gt: Date.now() },
        })

        if (!user) {
            return Response.json(
                { error: "Invalid or expired verification token" , data: null },
                { status: 400 }
            )
        }

        user.emailVerified = true
        user.verificationToken = undefined
        user.verificationTokenExpiry = undefined
        await user.save()

        return Response.json({ success: true, message: "Email verified successfully" })
    } catch (error) {
        console.error("Email verification error:", error)
        return Response.json(
            { error: "Verification failed" , data: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
