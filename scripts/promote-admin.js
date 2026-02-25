const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI not found in .env.local");
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    email: String,
    role: String,
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function promote(email) {
    try {
        await mongoose.connect(MONGODB_URI);
        const user = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { role: "super_admin" },
            { new: true }
        );

        if (user) {
            console.log(`Success: User ${email} is now a super_admin`);
        } else {
            console.log(`Error: User with email ${email} not found`);
        }
    } catch (error) {
        console.error("Connection error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

if (!process.argv[2]) {
    console.log("Usage: node scripts/promote-admin.js <email>");
    process.exit(1);
}

promote(process.argv[2]);
