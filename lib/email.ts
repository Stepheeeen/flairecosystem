import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder")

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
      <div>
        <h1>Welcome to ${companyName}!</h1>
        <p>Please click the link below to verify your email address and activate your account:</p>
        <a href="${verifyLink}" style="display:inline-block;padding:12px 24px;background-color:#000;color:#fff;text-decoration:none;border-radius:4px;">
          Verify Email
        </a>
        <p>If you didn't request this, please ignore this email.</p>
        <hr />
        <p><small>Link expires in 24 hours.</small></p>
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
      <div>
        <h1>Password Reset Request</h1>
        <p>We received a request to reset your password for ${companyName}. Click the link below to set a new password:</p>
        <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background-color:#000;color:#fff;text-decoration:none;border-radius:4px;">
          Reset Password
        </a>
        <p>If you didn't request this, you can safely ignore this email. Your password will not change.</p>
        <hr />
        <p><small>This link expires in 1 hour.</small></p>
      </div>
    `,
  })
}
