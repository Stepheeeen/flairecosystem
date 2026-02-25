import dbConnect from "@/lib/db"
import Product from "@/lib/models/product"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import mongoose from "mongoose"

export async function GET(request: Request) {
  try {
    await dbConnect()
    const session = await getServerSession(authOptions)

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const companyId = searchParams.get("companyId")

    const filter: Record<string, any> = {}

    if (session?.user?.role === "admin" && session.user.companyId) {
      if (mongoose.Types.ObjectId.isValid(session.user.companyId)) {
        filter.companyId = new mongoose.Types.ObjectId(session.user.companyId)
      }
    } else if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
      filter.companyId = new mongoose.Types.ObjectId(companyId)
    } else if (session?.user?.role !== "super_admin") {
      // Default to returning an empty array if no context is found for public/customer view
      return NextResponse.json([])
    }

    if (category) filter.category = category
    if (search) filter.name = { $regex: search, $options: "i" }

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean()

    // Explicitly cast to array just in case
    const results = Array.isArray(products) ? products : []

    return NextResponse.json(results)
  } catch (error: any) {
    console.error("Products GET error:", error)
    return NextResponse.json({
      error: "Failed to fetch products",
      message: error.message
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return Response.json({ error: "Unauthorized", data: null }, { status: 401 })
    }

    await dbConnect()
    const body = await request.json()

    // Ensure products are attached to the correct company
    const productData = {
      ...body,
      companyId: session.user.role === "super_admin" ? body.companyId : session.user.companyId
    }

    if (!productData.companyId || !mongoose.Types.ObjectId.isValid(productData.companyId)) {
      return Response.json({ error: "Valid Company ID is required", data: null }, { status: 400 })
    }

    productData.companyId = new mongoose.Types.ObjectId(productData.companyId)

    const product = await Product.create(productData)
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Products POST error:", error)
    return NextResponse.json({ error: "Failed to create product", data: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
