import mongoose, { Schema, Document } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: "customer" | "admin" | "super_admin"
  companyId?: mongoose.Types.ObjectId
  emailVerified: boolean
  verificationTokenExpiry?: Date
  resetPasswordToken?: string
  resetPasswordTokenExpiry?: Date
  addressBook?: {
    street: string
    city: string
    state: string
    zip: string
    isDefault: boolean
  }[]
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "admin", "super_admin"],
      default: "customer",
    },
    companyId: { type: Schema.Types.ObjectId, ref: "Company" },
    emailVerified: { type: Boolean, default: false },
    verificationTokenExpiry: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordTokenExpiry: { type: Date },
    addressBook: [
      {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      }
    ],
  },
  { timestamps: true }
)

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return
  this.password = await bcrypt.hash(this.password, 12)
})

UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
