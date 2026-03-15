import mongoose from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"

// Load env vars
dotenv.config({ path: ".env.local" })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
    console.error("Please provide MONGODB_URI in your .env.local file")
    process.exit(1)
}

// User schema definition required for Mongoose
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
}, { strict: false })

const User = mongoose.models.User || mongoose.model("User", userSchema)

async function resetPassword() {
    const args = process.argv.slice(2)

    if (args.length < 2) {
        console.error("Usage: node scripts/reset-password.mjs <email> <new_password>")
        process.exit(1)
    }

    const [email, newPassword] = args

    try {
        await mongoose.connect(MONGODB_URI)
        console.log(`Connected to MongoDB. Searching for ${email}...`)

        const user = await User.findOne({ email: email.toLowerCase() })

        if (!user) {
            console.error(`User with email ${email} not found!`)
            process.exit(1)
        }

        user.password = newPassword
        
        await user.save()

        console.log(`✅ Success! Password for ${email} has been reset.`)
        console.log(`You can now log in with your new password.`)
    } catch (error) {
        console.error("Database Error:", error)
    } finally {
        await mongoose.disconnect()
        process.exit(0)
    }
}

resetPassword()
