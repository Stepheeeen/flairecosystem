import dbConnect from "@/lib/db"
import Company from "@/lib/models/company"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        console.log("DEBUG: GET company by id/slug:", id)
        await dbConnect()

        // Find by slug first for public routing
        let company = await Company.findOne({ slug: id })
        console.log("DEBUG: Company found by slug:", company ? "YES" : "NO")

        if (!company && mongoose.Types.ObjectId.isValid(id)) {
            // Fallback to find by ID if not slug and is valid ObjectId
            console.log("DEBUG: Not found by slug, trying by ID")
            company = await Company.findById(id)
            console.log("DEBUG: Company found by ID:", company ? "YES" : "NO")
        }

        if (!company) {
            console.log("DEBUG: Returning 404")
            return Response.json({ error: "Company not found", data: null }, { status: 404 })
        }

        return Response.json(company)
    } catch (error) {
        console.error("Company GET error:", error)
        return Response.json(
            { error: "Failed to fetch company", data: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
            return Response.json({ error: "Unauthorized", data: null }, { status: 401 })
        }

        const { id } = await params

        if (session.user.role === "admin" && session.user.companyId !== id) {
            return Response.json({ error: "Forbidden: You can only edit your own company settings.", data: null }, { status: 403 })
        }

        await dbConnect()
        const { name, slug, customDomain, subdomain, theme, paystackPublicKey, seoTitle, seoDescription, landingPage } = await request.json()

        if (!name || !slug) {
            return Response.json({ error: "Name and slug are required", data: null }, { status: 400 })
        }

        const existingCompany = await Company.findOne({ slug, _id: { $ne: id } })
        if (existingCompany) {
            return Response.json({ error: "Slug is already taken by another company", data: null }, { status: 409 })
        }

        // Optional check for customDomain and subdomain uniqueness could be added here
        // if needed, depending on how strict we want to be, but MongoDB unique index
        // handles it and will throw if sparse unique constraint is violated.

        const company = await Company.findByIdAndUpdate(
            id,
            { name, slug, customDomain, subdomain, theme, paystackPublicKey, seoTitle, seoDescription, landingPage },
            { new: true, runValidators: true }
        )

        if (!company) {
            return Response.json({ error: "Company not found", data: null }, { status: 404 })
        }

        return Response.json(company)
    } catch (error) {
        console.error("Company PUT error:", error)
        return Response.json(
            { error: "Failed to update company settings", data: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "super_admin") {
            return Response.json({ error: "Unauthorized", data: null }, { status: 401 })
        }

        const { id } = await params

        await dbConnect()
        const { status } = await request.json()

        if (!status || !["active", "suspended"].includes(status)) {
            return Response.json({ error: "Invalid status value", data: null }, { status: 400 })
        }

        const company = await Company.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        )

        if (!company) {
            return Response.json({ error: "Company not found", data: null }, { status: 404 })
        }

        return Response.json(company)
    } catch (error) {
        console.error("Company PATCH error:", error)
        return Response.json(
            { error: "Failed to update company status", data: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
