import mongoose, { Schema, Document } from "mongoose"

export interface IPlatformSettings extends Document {
    platformCommissionRate: number
    globalMaintenanceMode: boolean
    supportEmail: string
    updatedAt: Date
    createdAt: Date
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>(
    {
        platformCommissionRate: {
            type: Number,
            default: 5, // 5% by default
            min: 0,
            max: 100
        },
        globalMaintenanceMode: {
            type: Boolean,
            default: false
        },
        supportEmail: {
            type: String,
            default: "support@flairecosystem.com"
        }
    },
    { timestamps: true }
)

export default mongoose.models.PlatformSettings ||
    mongoose.model<IPlatformSettings>("PlatformSettings", PlatformSettingsSchema)
