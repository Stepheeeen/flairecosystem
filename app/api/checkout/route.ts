import { initializePayment, generateReference } from "@/lib/paystack"
import dbConnect from "@/lib/db"
import Order from "@/lib/models/order"

export async function POST(request: Request) {
  try {
    const { email, amount, cart, customer, companyId, userId } = await request.json()

    if (!email || !amount || !cart || cart.length === 0 || !companyId) {
      return Response.json(
        { error: "Missing required fields (including companyId)", data: null },
        { status: 400 }
      )
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
      }
    )

    if (!paymentResponse.status) {
      return Response.json(
        { error: "Payment initialization failed", data: null },
        { status: 400 }
      )
    }

    await dbConnect()

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
