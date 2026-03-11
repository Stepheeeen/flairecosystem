import { verifyPayment } from "@/lib/paystack"
import dbConnect from "@/lib/db"
import Order from "@/lib/models/order"
import User from "@/lib/models/user"
import Company from "@/lib/models/company"
import Product from "@/lib/models/product"
import crypto from "crypto"
import Notification from "@/lib/models/notification"
import { sendOrderConfirmedEmail, sendNewSaleEmail } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    if (!signature) {
      return Response.json({ error: "Missing signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    const { reference } = event.data || {}

    // Find the correct secret key to use for signature verification
    // Default to platform key (required for split payments)
    let secretKey = process.env.PAYSTACK_SECRET_KEY

    // Backward compatibility: check if the order was initialized with a merchant-specific key
    if (reference) {
      await dbConnect()
      const order = await Order.findOne({ reference })
      if (order) {
        const company = await Company.findById(order.companyId)
        // If the company has a secret key AND the order doesn't have a subaccount (logic check needed?)
        // Actually, Paystack Split always uses the platform key to initialize.
        // So if we find a subaccount involved, it MUST be the platform key.
        // For now, we'll favor the platform key but allow override if the order was explicitly set up for a merchant key.
        if (company?.paystackSecretKey && !company.paystackSubaccountCode) {
          secretKey = company.paystackSecretKey
        }
      }
    }

    if (!verifyWebhookSignature(body, signature, secretKey)) {
      return Response.json(
        { error: "Invalid signature", data: null },
        { status: 401 }
      )
    }

    if (event.event === "charge.success") {
      const verification = await verifyPayment(reference)

      if (verification.status && verification.data.status === "success") {
        await dbConnect()

        const order: any = await Order.findOneAndUpdate(
          { reference },
          { status: "completed", paidAt: new Date() },
          { new: true }
        )

        if (order) {
          // Decrement stock levels for each item in the order
          for (const item of order.items) {
            const updatedProduct = await Product.findByIdAndUpdate(
              item.productId,
              { $inc: { stockCount: -item.quantity } },
              { new: true }
            )

            if (updatedProduct && updatedProduct.stockCount <= 5) {
              await Notification.create({
                companyId: order.companyId,
                title: "Low Stock Alert",
                message: `${updatedProduct.name} is running low on inventory. Only ${updatedProduct.stockCount} remaining.`,
                type: "STOCK",
                link: `/${order.companyId}/admin/products`
              })
            }
          }

          // Send email to the shopper
          await sendOrderConfirmedEmail(order.customerEmail, order.customerName, order.reference, order.totalAmount)

          // Notify the Company Admin that they made a sale!
          const admin = await User.findOne({ companyId: order.companyId, role: "admin" })
          if (admin) {
            await sendNewSaleEmail(admin.email, order.reference, order.totalAmount)
          }

          // Create an In-App Notification for the Store Admin
          await Notification.create({
            companyId: order.companyId,
            title: "New Order Received",
            message: `Order #${order._id.toString().slice(-6)} for ₦${(order.totalAmount / 100).toLocaleString()} was just paid by ${order.customerEmail}.`,
            type: "ORDER",
            link: `/${order.companyId}/admin/orders`
          })
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
  signature: string | null,
  secretKey: string | undefined
): boolean {
  if (!signature || !secretKey) {
    return false
  }

  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(body)
    .digest("hex")

  return hash === signature
}
