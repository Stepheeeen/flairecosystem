import mongoose, { Schema, Document } from "mongoose"

export interface ICompany extends Document {
    name: string
    slug: string
    customDomain?: string
    subdomain?: string
    logo?: string
    theme?: {
        primaryColor?: string
        backgroundColor?: string
        heroImage?: string
    }
    status: "active" | "suspended"
    createdAt: Date
    updatedAt: Date
}

const CompanySchema = new Schema<ICompany>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        customDomain: { type: String, unique: true, sparse: true, lowercase: true },
        subdomain: { type: String, unique: true, sparse: true, lowercase: true },
        logo: { type: String },
        theme: {
            primaryColor: { type: String },
            backgroundColor: { type: String },
            heroImage: { type: String },
        },
        status: {
            type: String,
            enum: ["active", "suspended"],
            default: "active",
        },
    },
    { timestamps: true }
)

export default mongoose.models.Company || mongoose.model<ICompany>("Company", CompanySchema)
