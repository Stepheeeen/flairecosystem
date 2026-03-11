import { initializePayment, generateReference } from "@/lib/paystack"
import dbConnect from "@/lib/db"
import Order from "@/lib/models/order"
import Company from "@/lib/models/company"
import Product from "@/lib/models/product"
import Notification from "@/lib/models/notification"
import PlatformSettings from "@/lib/models/platform-settings"

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

    // Fetch platform settings for commission rate
    const settings = await PlatformSettings.findOne({})
    const commissionPercentage = settings?.platformCommissionRate || 0

    // Calculate surcharge: Customer pays Total = Store Price + (Store Price * 3%)
    const originalAmount = amount
    const platformFee = Math.round(originalAmount * (commissionPercentage / 100))
    const totalToPay = originalAmount + platformFee

    const reference = generateReference()

    const paymentResponse = await initializePayment(
      email,
      totalToPay, // Customer pays total (Store Price + Surcharge)
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
        companyId,
        originalAmount, // Store original for reference
        platformFee,   // Store fee for reference
      },
      company.paystackSubaccountCode, // Subaccount for splitting
      commissionPercentage, // Pass percentage to internal split logic
      platformFee // Pass the calculated surcharge fee explicitly
    )

    if (!paymentResponse.status) {
      return Response.json(
        { error: "Payment initialization failed", data: null },
        { status: 400 }
      )
    }

    // 2. We no longer decrement stock here. 
    // It is now handled in the Paystack Webhook only after successful payment!

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
      totalAmount: totalToPay,
      platformFee: platformFee,
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
