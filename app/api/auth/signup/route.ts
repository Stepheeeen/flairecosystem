import dbConnect from "@/lib/db"
import User from "@/lib/models/user"
import Company from "@/lib/models/company"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { name, email, password, companySlug } = await request.json()

    if (!name || !email || !password) {
      return Response.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters", data: null },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: "Invalid email format", data: null },
        { status: 400 }
      )
    }

    await dbConnect()

    let companyId = null
    if (companySlug) {
      const company = await Company.findOne({ slug: companySlug })
      if (company) {
        companyId = company._id
      }
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return Response.json(
        { error: "An account with this email already exists", data: null },
        { status: 409 }
      )
    }

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "customer",
      companyId,
      verificationToken,
      verificationTokenExpiry,
    })

    // Skip sending email if testing/dev without a real key
    if (process.env.RESEND_API_KEY) {
      try {
        await sendVerificationEmail(newUser.email, verificationToken)
      } catch (e) {
        console.error("Failed to send verification email:", e)
      }
    } else {
      console.warn("No RESEND_API_KEY found. Email verification skipped.")
      console.log(`[DEBUG] Verification Token for ${email}: ${verificationToken}`)
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Signup error:", error)
    return Response.json(
      { error: "Failed to create account", data: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
