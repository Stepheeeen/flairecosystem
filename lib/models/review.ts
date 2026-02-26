import mongoose, { Schema, Document } from "mongoose"

export interface IReview extends Document {
    productId: mongoose.Types.ObjectId
    userId: mongoose.Types.ObjectId
    companyId: mongoose.Types.ObjectId
    rating: number
    text: string
    isApproved: boolean
    createdAt: Date
    updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        text: { type: String, required: true },
        isApproved: { type: Boolean, default: true }, // Auto-approve by default for prototype speed
    },
    { timestamps: true }
)

ReviewSchema.set("toJSON", {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
        ret.id = ret._id.toString()
        delete ret.__v
        return ret
    },
})

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema)
