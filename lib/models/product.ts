import mongoose, { Schema, Document } from "mongoose"

export interface IProduct extends Document {
  name: string
  description: string
  price: number
  category: "women" | "men" | "accessories"
  image: string
  sizes: string[]
  colors: string[]
  inStock: boolean
  companyId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: ["women", "men", "accessories"],
    },
    image: { type: String, default: "" },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    inStock: { type: Boolean, default: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  },
  { timestamps: true }
)

ProductSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString()
    delete ret.__v
    return ret
  },
})

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)
