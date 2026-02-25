import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Company from "@/lib/models/company"
import User from "@/lib/models/user"
import mongoose from "mongoose"

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "super_admin") {
        return Response.json({ error: "Unauthorized", data: null }, { status: 401 })
    }

    try {
        await dbConnect()
        const companies = await Company.find({}).sort({ createdAt: -1 })
        return Response.json(companies)
    } catch (error) {
        console.error("Companies GET error:", error)
        return Response.json({ error: "Failed to fetch companies", data: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "super_admin") {
        return Response.json({ error: "Unauthorized", data: null }, { status: 401 })
    }

    try {
        await dbConnect()
        const body = await request.json()

        const sessionConfig = { session: await mongoose.startSession() }
        sessionConfig.session.startTransaction()

        try {
            // Check if slug already exists
            const existing = await Company.findOne({ slug: body.slug }).session(sessionConfig.session)
            if (existing) {
                await sessionConfig.session.abortTransaction()
                sessionConfig.session.endSession()
                return Response.json({ error: "Slug already in use", data: null }, { status: 400 })
            }

            // Check if admin email is already in use by anyone on the platform
            if (body.adminEmail) {
                const existingUser = await User.findOne({ email: body.adminEmail.toLowerCase() }).session(sessionConfig.session)
                if (existingUser) {
                    await sessionConfig.session.abortTransaction()
                    sessionConfig.session.endSession()
                    return Response.json({ error: "Admin email already attached to an existing user account", data: null }, { status: 400 })
                }
            }

            // Create Company
            const company = await Company.create([{
                name: body.name,
                slug: body.slug,
                // Pass down other fields if provided later
            }], { session: sessionConfig.session })

            const createdCompany = company[0]

            // Provision Initial Admin if credentials provided
            if (body.adminEmail && body.adminPassword) {
                await User.create([{
                    name: `Admin (${body.name})`,
                    email: body.adminEmail.toLowerCase(),
                    password: body.adminPassword,
                    role: "admin",
                    companyId: createdCompany._id,
                    emailVerified: true // Auto-verify platform-generated admins safely
                }], { session: sessionConfig.session })
            }

            await sessionConfig.session.commitTransaction()
            sessionConfig.session.endSession()

            return Response.json(createdCompany, { status: 201 })
        } catch (trxError: any) {
            await sessionConfig.session.abortTransaction()
            sessionConfig.session.endSession()
            throw trxError
        }

    } catch (error) {
        console.error("Companies POST error:", error)
        return Response.json({ error: "Failed to create company", data: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
}
