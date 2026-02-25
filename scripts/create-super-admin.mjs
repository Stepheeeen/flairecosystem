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
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: "customer" },
    emailVerified: { type: Boolean, default: false },
}, { strict: false })

// Pre-save hook to hash passwords if we were using the actual model, 
// but since this is a standalone script and we are accessing the DB directly without the full app logic,
// we will hash the password using bcryptjs explicitly to ensure it works properly.
import bcrypt from "bcryptjs"

const User = mongoose.models.User || mongoose.model("User", userSchema)

async function createSuperAdmin() {
    const args = process.argv.slice(2)

    if (args.length < 3) {
        console.error("Usage: node scripts/create-super-admin.mjs <name> <email> <password>")
        process.exit(1)
    }

    const [name, email, password] = args

    try {
        await mongoose.connect(MONGODB_URI)
        console.log(`Connected to MongoDB. Creating super admin ${email}...`)

        const existingUser = await User.findOne({ email: email.toLowerCase() })

        if (existingUser) {
            console.error(`User with email ${email} already exists! Use make-super-admin.mjs to promote them.`)
            process.exit(1)
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "super_admin",
            emailVerified: true // Automatically verify email for super admin
        })

        await newUser.save()

        console.log(`✅ Success! Super admin ${email} has been created.`)
        console.log(`You can now log in at /super-admin/signin`)
    } catch (error) {
        console.error("Database Error:", error)
    } finally {
        await mongoose.disconnect()
        process.exit(0)
    }
}

createSuperAdmin()
