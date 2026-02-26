import dbConnect from "@/lib/db"
import Review from "@/lib/models/review"
import Product from "@/lib/models/product"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

// Fetch all approved reviews for a specific product
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const { id } = await params

        const reviews = await Review.find({ productId: id, isApproved: true })
            .sort({ createdAt: -1 })
            .populate("userId", "name") // just get the reviewer's name
            .lean()

        return Response.json(reviews)
    } catch (error) {
        console.error("Reviews GET error:", error)
        return Response.json({ error: "Failed to fetch reviews", data: null }, { status: 500 })
    }
}

// Post a new review
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return Response.json({ error: "Unauthorized. Please log in to leave a review.", data: null }, { status: 401 })
        }

        await dbConnect()
        const { id } = await params
        const { rating, text } = await request.json()

        if (!rating || rating < 1 || rating > 5 || !text) {
            return Response.json({ error: "Valid rating (1-5) and text are required.", data: null }, { status: 400 })
        }

        const product = await Product.findById(id)
        if (!product) {
            return Response.json({ error: "Product not found", data: null }, { status: 404 })
        }

        // Optional: Check if the user actually ordered the item to be a "verified buyer"
        // For now we just allow logged-in users to review.

        const review = await Review.create({
            productId: new mongoose.Types.ObjectId(id),
            userId: new mongoose.Types.ObjectId(session.user.id),
            companyId: product.companyId,
            rating: Number(rating),
            text,
            isApproved: true, // auto-approve to get it working out of the box
        })

        return Response.json(review, { status: 201 })
    } catch (error) {
        console.error("Reviews POST error:", error)
        return Response.json({ error: "Failed to create review", data: null }, { status: 500 })
    }
}
