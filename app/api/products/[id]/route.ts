import dbConnect from "@/lib/db"
import Product from "@/lib/models/product"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    const session = await getServerSession(authOptions)

    const product = await Product.findById(id)
    if (!product) {
      return Response.json({ error: "Product not found", data: null }, { status: 404 })
    }

    // Only allow public access if no company filter logic is enforced, OR
    // enforce that admins only view their own products in admin view
    // (Here, GET /api/products/[id] is used by both public frontend and admin, 
    // but the public frontend uses company slug logically. We will just ensure
    // we return the product. Ideally, if it's admin, we check ownership, but 
    // the public product details page also hits this. We'll leave it open for GET, 
    // or we could filter based on referer. Leaving open for now since products are public.)

    return Response.json(product)
  } catch (error) {
    console.error("Product GET error:", error)
    return Response.json(
      { error: "Failed to fetch product", data: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return Response.json({ error: "Unauthorized", data: null }, { status: 401 })
    }

    await dbConnect()
    const { id } = await params
    const body = await request.json()

    // Ownership check for tenant admins
    if (session.user.role === "admin") {
      const existingProduct = await Product.findById(id)
      if (!existingProduct) {
        return Response.json({ error: "Product not found", data: null }, { status: 404 })
      }
      if (existingProduct.companyId.toString() !== session.user.companyId) {
        return Response.json({ error: "Unauthorized access to product", data: null }, { status: 403 })
      }
      // Force companyId to remain the same for admins
      body.companyId = session.user.companyId
    }

    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })

    if (!product) {
      return Response.json({ error: "Product not found", data: null }, { status: 404 })
    }

    return Response.json(product)
  } catch (error) {
    console.error("Product PUT error:", error)
    return Response.json(
      { error: "Failed to update product", data: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return Response.json({ error: "Unauthorized", data: null }, { status: 401 })
    }

    await dbConnect()
    const { id } = await params

    if (session.user.role === "admin") {
      const existingProduct = await Product.findById(id)
      if (!existingProduct) {
        return Response.json({ error: "Product not found", data: null }, { status: 404 })
      }
      if (existingProduct.companyId.toString() !== session.user.companyId) {
        return Response.json({ error: "Unauthorized access to product", data: null }, { status: 403 })
      }
    }

    const product = await Product.findByIdAndDelete(id)
    if (!product) {
      return Response.json({ error: "Product not found", data: null }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Product DELETE error:", error)
    return Response.json(
      { error: "Failed to delete product", data: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
