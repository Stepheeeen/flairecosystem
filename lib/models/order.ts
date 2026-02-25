import mongoose, { Schema, Document, Types } from "mongoose"

export interface IOrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
}

export interface IOrder extends Document {
  reference: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  city: string
  state: string
  zip: string
  items: IOrderItem[]
  totalAmount: number
  status: "pending" | "completed" | "processing" | "shipped" | "delivered" | "cancelled" | "failed"
  paidAt?: Date
  userId?: Types.ObjectId
  companyId: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: { type: String },
    color: { type: String },
  },
  { _id: false }
)

const OrderSchema = new Schema<IOrder>(
  {
    reference: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, default: "" },
    shippingAddress: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zip: { type: String, default: "" },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "processing", "shipped", "delivered", "cancelled", "failed"],
      default: "pending",
    },
    paidAt: { type: Date },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  },
  { timestamps: true }
)

OrderSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString()
    delete ret.__v
    return ret
  },
})

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)
