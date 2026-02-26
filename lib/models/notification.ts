import mongoose, { Schema, Document } from "mongoose"

export interface INotification extends Document {
    companyId: mongoose.Types.ObjectId
    title: string
    message: string
    type: "ORDER" | "STOCK" | "SYSTEM"
    read: boolean
    link?: string
    createdAt: Date
    updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
    {
        companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ["ORDER", "STOCK", "SYSTEM"],
            default: "SYSTEM",
        },
        read: { type: Boolean, default: false },
        link: { type: String },
    },
    { timestamps: true }
)

NotificationSchema.set("toJSON", {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
        ret.id = ret._id.toString()
        delete ret.__v
        return ret
    },
})

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema)
