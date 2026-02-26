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
 * @param secretKey - The localized Paystack secret key for the specific merchant
 */
export async function initializePayment(
  email: string,
  amount: number,
  reference: string,
  metadata?: Record<string, any>,
  secretKey?: string
): Promise<PaystackInitializeResponse> {
  // Optionally extract a predetermined flat fee or percentage to the Platform Super Admin
  const subaccount = process.env.PAYSTACK_PLATFORM_SUBACCOUNT
  const transactionCharge = process.env.PAYSTACK_PLATFORM_FEE ? parseInt(process.env.PAYSTACK_PLATFORM_FEE, 10) : undefined

  const payload: any = {
    email,
    amount,
    reference,
    metadata,
  }

  if (subaccount) {
    payload.subaccount = subaccount
    if (transactionCharge) payload.transaction_charge = transactionCharge
    payload.bearer = "subaccount" // The merchant bears the Paystack processing fees
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey || process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Paystack initialization failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Verify a Paystack payment
 * @param reference - Transaction reference
 * @param secretKey - The localized Paystack secret key for the specific merchant
 */
export async function verifyPayment(
  reference: string,
  secretKey?: string
): Promise<PaystackVerifyResponse> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey || process.env.PAYSTACK_SECRET_KEY}`,
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
