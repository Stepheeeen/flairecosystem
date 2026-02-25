import dbConnect from "@/lib/db"
import User from "@/lib/models/user"

export async function POST(request: Request) {
    try {
        const { token, newPassword } = await request.json()

        if (!token || !newPassword) {
            return Response.json({ error: "Token and new password are required" , data: null }, { status: 400 })
        }

        if (newPassword.length < 6) {
            return Response.json({ error: "Password must be at least 6 characters" , data: null }, { status: 400 })
        }

        await dbConnect()

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiry: { $gt: Date.now() },
        })

        if (!user) {
            return Response.json(
                { error: "Invalid or expired reset token" , data: null },
                { status: 400 }
            )
        }

        user.password = newPassword
        user.resetPasswordToken = undefined
        user.resetPasswordTokenExpiry = undefined
        await user.save()

        return Response.json({ success: true, message: "Password reset successfully" })
    } catch (error) {
        console.error("Reset password error:", error)
        return Response.json(
            { error: "Failed to reset password" , data: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
