import { verifyPayment } from "@/lib/paystack"
import dbConnect from "@/lib/db"
import Order from "@/lib/models/order"
import User from "@/lib/models/user"
import crypto from "crypto"
import { sendOrderConfirmedEmail, sendNewSaleEmail } from "@/lib/emails"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    if (!verifyWebhookSignature(body, signature)) {
      return Response.json(
        { error: "Invalid signature", data: null },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)

    if (event.event === "charge.success") {
      const { reference } = event.data

      const verification = await verifyPayment(reference)

      if (verification.status && verification.data.status === "success") {
        await dbConnect()

        const order: any = await Order.findOneAndUpdate(
          { reference },
          { status: "completed", paidAt: new Date() },
          { new: true }
        )

        if (order) {
          // Send email to the shopper
          await sendOrderConfirmedEmail(order.customerEmail, order.customerName, order.reference, order.totalAmount)

          // Notify the Company Admin that they made a sale!
          const admin = await User.findOne({ companyId: order.companyId, role: "admin" })
          if (admin) {
            await sendNewSaleEmail(admin.email, order.reference, order.totalAmount)
          }
        }

        return Response.json({ received: true })
      }
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return Response.json(
      { error: "Webhook processing failed", data: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

function verifyWebhookSignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) {
    return false
  }

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex")

  return hash === signature
}
