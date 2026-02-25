// Paystack Integration Utilities
// Add your Paystack public and secret keys to environment variables:
// NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
// PAYSTACK_SECRET_KEY

const PAYSTACK_BASE_URL = "https://api.paystack.co"

export interface PaystackInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    id: number
    reference: string
    amount: number
    paid_at: string
    customer: {
      id: number
      email: string
      first_name: string
      last_name: string
    }
    status: "success" | "failed" | "pending"
  }
}

/**
 * Initialize a payment with Paystack
 * @param email - Customer email
 * @param amount - Amount in kobo (multiply naira by 100)
 * @param reference - Unique transaction reference
 * @param metadata - Additional metadata
 */
export async function initializePayment(
  email: string,
  amount: number,
  reference: string,
  metadata?: Record<string, any>
): Promise<PaystackInitializeResponse> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount,
      reference,
      metadata,
    }),
  })

  if (!response.ok) {
    throw new Error(`Paystack initialization failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Verify a Paystack payment
 * @param reference - Transaction reference
 */
export async function verifyPayment(
  reference: string
): Promise<PaystackVerifyResponse> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Paystack verification failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Create a unique reference for a transaction
 */
export function generateReference(): string {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
