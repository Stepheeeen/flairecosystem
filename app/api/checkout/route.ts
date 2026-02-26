import { initializePayment, generateReference } from "@/lib/paystack"
import dbConnect from "@/lib/db"
import Order from "@/lib/models/order"
import Company from "@/lib/models/company"
import Product from "@/lib/models/product"
import Notification from "@/lib/models/notification"

export async function POST(request: Request) {
  try {
    const { email, amount, cart, customer, companyId, userId } = await request.json()

    if (!email || !amount || !cart || cart.length === 0 || !companyId) {
      return Response.json(
        { error: "Missing required fields (including companyId)", data: null },
        { status: 400 }
      )
    }

    await dbConnect()

    const company = await Company.findById(companyId)
    if (!company) {
      return Response.json(
        { error: "Storefront company not found", data: null },
        { status: 404 }
      )
    }

    // 1. Concurrency Check: Verify all items have sufficient stock BEFORE initializing Paystack
    for (const item of cart) {
      const product = await Product.findById(item.id)
      if (!product) {
        return Response.json({ error: `Product not found: ${item.name}`, data: null }, { status: 404 })
      }
      if (product.stockCount < item.quantity) {
        return Response.json(
          { error: `Insufficient stock for ${product.name}. Only ${product.stockCount} left.`, data: null },
          { status: 400 }
        )
      }
    }

    const reference = generateReference()

    const paymentResponse = await initializePayment(
      email,
      amount,
      reference,
      {
        customer: {
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          phone: customer.phone,
        },
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zip: customer.zip,
        cart_items: cart.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        companyId, // Pass companyId to metadata if needed
      },
      company.paystackPublicKey // Dynamically inject the local merchant API key if one is set!
    )

    if (!paymentResponse.status) {
      return Response.json(
        { error: "Payment initialization failed", data: null },
        { status: 400 }
      )
    }

    // 2. Decrement Stock Counts atomically since checkout has been initialized
    for (const item of cart) {
      const updatedProduct = await Product.findByIdAndUpdate(
        item.id,
        { $inc: { stockCount: -item.quantity } },
        { new: true }
      )

      if (updatedProduct && updatedProduct.stockCount <= 5) {
        // Create an In-App Notification for Low Stock
        await Notification.create({
          companyId,
          title: "Low Stock Alert",
          message: `${updatedProduct.name} is running low on inventory. Only ${updatedProduct.stockCount} remaining.`,
          type: "STOCK",
          link: `/${company.slug}/admin/products`
        })
      }
    }

    await Order.create({
      reference,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email || email,
      customerPhone: customer.phone || "",
      shippingAddress: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      zip: customer.zip || "",
      items: cart.map((item: any) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      totalAmount: amount,
      status: "pending",
      companyId,
      userId: userId || undefined,
    })

    return Response.json({
      success: true,
      reference,
      paymentUrl: paymentResponse.data.authorization_url,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return Response.json(
      { error: "Failed to process checkout", data: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
