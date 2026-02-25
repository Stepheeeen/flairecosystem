import { notFound, redirect } from "next/navigation"
import { Metadata } from "next"
import dbConnect from "@/lib/db"
import Company from "@/lib/models/company"
import mongoose from "mongoose"

export async function generateMetadata(
    { params }: { params: Promise<{ companySlug: string }> }
): Promise<Metadata> {
    const { companySlug } = await params
    await dbConnect()

    let company = await Company.findOne({ slug: companySlug }).lean()

    if (!company && mongoose.Types.ObjectId.isValid(companySlug)) {
        company = await Company.findById(companySlug).lean()
    }

    if (!company) {
        return {
            title: "Store Not Found",
            description: "The requested storefront does not exist."
        }
    }

    return {
        title: company.seoTitle || company.name,
        description: company.seoDescription || `Welcome to ${company.name}, curated collections for the discerning.`
    }
}

export default async function CompanyLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ companySlug: string }>
}) {
    const { companySlug } = await params

    await dbConnect()

    let company = await Company.findOne({ slug: companySlug }).lean()

    if (!company && mongoose.Types.ObjectId.isValid(companySlug)) {
        company = await Company.findById(companySlug).lean()
    }

    if (!company) {
        return notFound()
    }

    if (company.status === "suspended") {
        return redirect("/suspended")
    }

    return (
        <>
            {children}
        </>
    )
}
