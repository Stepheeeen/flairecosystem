import dbConnect from "@/lib/db"
import User from "@/lib/models/user"
import crypto from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: Request) {
    try {
        const { email, companyName } = await request.json()

        if (!email) {
            return Response.json({ error: "Email is required" , data: null }, { status: 400 })
        }

        await dbConnect()

        const user = await User.findOne({ email: email.toLowerCase() })

        if (!user) {
            // Return success even if user not found to prevent email enumeration
            return Response.json({ success: true, message: "If an account with that email exists, a reset link has been sent." })
        }

        // Generate Verification Token
        const resetPasswordToken = crypto.randomBytes(32).toString('hex')
        const resetPasswordTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

        user.resetPasswordToken = resetPasswordToken
        user.resetPasswordTokenExpiry = resetPasswordTokenExpiry
        await user.save()

        // Skip sending email if testing/dev without a real key
        if (process.env.RESEND_API_KEY) {
            try {
                await sendPasswordResetEmail(user.email, resetPasswordToken, companyName || "Flair Eco System")
            } catch (e) {
                console.error("Failed to send password reset email:", e)
            }
        } else {
            console.warn("No RESEND_API_KEY found. Password reset email skipped.")
            console.log(`[DEBUG] Reset Password Token for ${email}: ${resetPasswordToken}`)
        }

        return Response.json({ success: true, message: "If an account with that email exists, a reset link has been sent." })
    } catch (error) {
        console.error("Forgot password error:", error)
        return Response.json(
            { error: "Failed to process forgot password request" , data: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
