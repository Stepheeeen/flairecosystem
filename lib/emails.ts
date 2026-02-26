import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendOrderConfirmedEmail = async (customerEmail: string, customerName: string, orderRef: string, totalAmount: number) => {
    if (!process.env.RESEND_API_KEY) return

    try {
        await resend.emails.send({
            from: "Storefront <orders@storefront.com>",
            to: [customerEmail],
            subject: `Order Confirmed - ${orderRef}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; text-transform: uppercase;">Order Confirmed</h2>
                    <p>Hi ${customerName},</p>
                    <p>Thank you for your purchase! We've received your order and are getting it ready to be shipped.</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Order Reference:</strong> ${orderRef}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Total Amount:</strong> ₦${(totalAmount / 100).toLocaleString()}</p>
                    </div>
                    <p>We'll send you another email as soon as your order ships.</p>
                    <p>Best regards,<br/>The Storefront Team</p>
                </div>
            `
        })
    } catch (error) {
        console.error("Failed to send Order Confirmed Email", error)
    }
}

export const sendNewSaleEmail = async (adminEmail: string, orderRef: string, totalAmount: number) => {
    if (!process.env.RESEND_API_KEY) return

    try {
        await resend.emails.send({
            from: "Platform <sales@platform.com>",
            to: [adminEmail],
            subject: `Cha-ching! New Sale - ${orderRef}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #4CAF50;">You made a new sale!</h2>
                    <p>Great job! A new order has been placed on your storefront.</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Order Reference:</strong> ${orderRef}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Total Revenue:</strong> ₦${(totalAmount / 100).toLocaleString()}</p>
                    </div>
                    <p>Log into your Storefront Admin Dashboard to fulfill this order.</p>
                </div>
            `
        })
    } catch (error) {
        console.error("Failed to send New Sale Email", error)
    }
}

export const sendOrderShippedEmail = async (customerEmail: string, customerName: string, orderRef: string) => {
    if (!process.env.RESEND_API_KEY) return

    try {
        await resend.emails.send({
            from: "Storefront <orders@storefront.com>",
            to: [customerEmail],
            subject: `Your Order is on the way! - ${orderRef}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; text-transform: uppercase;">Order Shipped</h2>
                    <p>Hi ${customerName},</p>
                    <p>Great news! Your recent order (<strong>${orderRef}</strong>) has been shipped and is on its way to you.</p>
                    <p>Log into your customer account to view your order history and track the delivery status.</p>
                    <p style="margin-top: 30px;">Best regards,<br/>The Storefront Team</p>
                </div>
            `
        })
    } catch (error) {
        console.error("Failed to send Order Shipped Email", error)
    }
}
