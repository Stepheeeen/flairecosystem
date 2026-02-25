import mongoose from "mongoose"
import dotenv from "dotenv"

// Load env vars
dotenv.config({ path: ".env.local" })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
    console.error("Please provide MONGODB_URI in your .env.local file")
    process.exit(1)
}

// User schema definition required for Mongoose
const userSchema = new mongoose.Schema({
    email: String,
    role: String,
}, { strict: false })

const User = mongoose.models.User || mongoose.model("User", userSchema)

async function makeSuperAdmin() {
    const targetEmail = process.argv[2]

    if (!targetEmail) {
        console.error("Usage: node scripts/make-super-admin.mjs <user_email>")
        process.exit(1)
    }

    try {
        await mongoose.connect(MONGODB_URI)
        console.log(`Connected to MongoDB. Searching for ${targetEmail}...`)

        const user = await User.findOne({ email: targetEmail.toLowerCase() })

        if (!user) {
            console.error(`User with email ${targetEmail} not found!`)
            process.exit(1)
        }

        if (user.role === "super_admin") {
            console.log(`User ${targetEmail} is already a super_admin.`)
            process.exit(0)
        }

        user.role = "super_admin"
        await user.save()

        console.log(`✅ Success! ${targetEmail} has been promoted to super_admin.`)
        console.log(`Please log out and log back in to refresh your permissions.`)
    } catch (error) {
        console.error("Database Error:", error)
    } finally {
        await mongoose.disconnect()
    }
}

makeSuperAdmin()
