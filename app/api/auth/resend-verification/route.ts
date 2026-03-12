export const dynamic = "force-dynamic"

import dbConnect from "@/lib/db"
import User from "@/lib/models/user"
import Company from "@/lib/models/company"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/email-service"

export async function POST(request: Request) {
    try {
        const { email, companySlug } = await request.json()

        if (!email) {
            return Response.json({ error: "Email is required" }, { status: 400 })
        }

        await dbConnect()

        const user = await User.findOne({ email: email.toLowerCase() })

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 })
        }

        if (user.isVerified) {
            return Response.json({ error: "Email already verified" }, { status: 400 })
        }

        // Find company for branding
        let companyName = "Flair Eco System"
        if (companySlug) {
            const company = await Company.findOne({ slug: companySlug })
            if (company) companyName = company.name
        }

        // Generate new token
        const verificationToken = crypto.randomBytes(32).toString('hex')
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

        user.verificationToken = verificationToken
        user.verificationTokenExpiry = verificationTokenExpiry
        await user.save()

        // Send Email
        if (process.env.RESEND_API_KEY) {
            await sendVerificationEmail(user.email, verificationToken, companyName)
        } else {
            console.warn("No RESEND_API_KEY found. Verification email skipped.")
            console.log(`[DEBUG] New Verification Token for ${email}: ${verificationToken}`)
        }

        return Response.json({ success: true, message: "Verification email resent successfully." })
    } catch (error) {
        console.error("Resend verification error:", error)
        return Response.json(
            { error: "Failed to resend verification email" },
            { status: 500 }
        )
    }
}
