import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Authentication Emails

export async function sendVerificationEmail(
  email: string,
  token: string,
  companyName: string = "Flair Eco System"
) {
  const verifyLink = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: email,
    subject: `Verify your email for ${companyName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333;">Welcome to ${companyName}!</h1>
        <p>Please click the link below to verify your email address and activate your account:</p>
        <a href="${verifyLink}" style="display:inline-block;padding:12px 24px;background-color:#000;color:#fff;text-decoration:none;border-radius:4px;">
          Verify Email
        </a>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p><small style="color: #666;">Link expires in 24 hours.</small></p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  companyName: string = "Flair Eco System"
) {
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: email,
    subject: `Reset your password for ${companyName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>We received a request to reset your password for ${companyName}. Click the link below to set a new password:</p>
        <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background-color:#000;color:#fff;text-decoration:none;border-radius:4px;">
          Reset Password
        </a>
        <p>If you didn't request this, you can safely ignore this email. Your password will not change.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p><small style="color: #666;">This link expires in 1 hour.</small></p>
      </div>
    `,
  })
}

// Order & Commerce Emails

export const sendOrderConfirmedEmail = async (
  customerEmail: string,
  customerName: string,
  orderRef: string,
  totalAmount: number
) => {
  if (!process.env.RESEND_API_KEY) return

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "orders@flairecosystem.com",
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
          <p>Best regards,<br/>The Flair Eco System Team</p>
        </div>
      `
    })
  } catch (error) {
    console.error("Failed to send Order Confirmed Email", error)
  }
}

export const sendNewSaleEmail = async (
  adminEmail: string,
  orderRef: string,
  totalAmount: number
) => {
  if (!process.env.RESEND_API_KEY) return

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "sales@flairecosystem.com",
      to: [adminEmail],
      subject: `New Sale Recorded - ${orderRef}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4CAF50;">You made a new sale!</h2>
          <p>Great job! A new order has been placed on your storefront.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 4px solid #4CAF50; margin: 20px 0;">
            <p style="margin: 0;"><strong>Order Reference:</strong> ${orderRef}</p>
            <p style="margin: 5px 0 0 0;"><strong>Total Revenue:</strong> ₦${(totalAmount / 100).toLocaleString()}</p>
          </div>
          <p>Log into your Admin Dashboard to fulfill this order.</p>
        </div>
      `
    })
  } catch (error) {
    console.error("Failed to send New Sale Email", error)
  }
}

export const sendOrderShippedEmail = async (
  customerEmail: string,
  customerName: string,
  orderRef: string
) => {
  if (!process.env.RESEND_API_KEY) return

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "orders@flairecosystem.com",
      to: [customerEmail],
      subject: `Your Order is on the way! - ${orderRef}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-transform: uppercase;">Order Shipped</h2>
          <p>Hi ${customerName},</p>
          <p>Great news! Your recent order (<strong>${orderRef}</strong>) has been shipped and is on its way to you.</p>
          <p>Log into your account to view your order history and track the delivery status.</p>
          <p style="margin-top: 30px;">Best regards,<br/>The Flair Eco System Team</p>
        </div>
      `
    })
  } catch (error) {
    console.error("Failed to send Order Shipped Email", error)
  }
}
