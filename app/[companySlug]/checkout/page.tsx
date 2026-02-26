"use client"
import { getStoreUrl } from "@/lib/utils"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"
import { useSession } from "next-auth/react"

export default function CheckoutPage({ params }: { params: Promise<{ companySlug: string }> }) {
  const unwrappedParams = use(params)
  const { companySlug } = unwrappedParams

  const { data: session } = useSession()

  const router = useRouter()
  const { cart, subtotal, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [companyContext, setCompanyContext] = useState<{ id: string, name: string, logo?: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  })

  useEffect(() => {
    setIsMounted(true)
    const fetchCompany = async () => {
      try {
        const res = await axios.get(`/api/companies/${companySlug}`)
        const data = res.data
        setCompanyContext({ id: data._id || data.id, name: data.name, logo: data.logo })
      } catch (error) {
        console.error("Failed to fetch company details")
      }
    }
    fetchCompany()
  }, [companySlug])

  if (!isMounted || cart.length === 0 || !companyContext) {
    return (
      <>
        <Navbar companySlug={companySlug} companyName={companyContext?.name} companyLogo={companyContext?.logo} />
        <div className="min-h-screen flex items-center justify-center">
          {!cart.length && isMounted ? (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Cart is empty</p>
              <Link href={getStoreUrl(companySlug, '/products')}>
                <Button>Back to Shop</Button>
              </Link>
            </div>
          ) : (
            <p className="text-muted-foreground">Loading...</p>
          )}
        </div>
      </>
    )
  }

  const shipping = subtotal > 100000 ? 0 : 5000
  const total = subtotal + shipping

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.address
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      // Initialize payment with Paystack
      const response = await axios.post("/api/checkout", {
        email: formData.email,
        amount: total * 100, // Convert to kobo
        cart,
        customer: formData,
        companyId: companyContext.id, // Explicitly linking the order to the tenant
        userId: session?.user?.id, // Optional: Link order to the customer account if logged in
      })

      const data = response.data

      if (data.paymentUrl) {
        // Redirect to Paystack
        window.location.href = data.paymentUrl
      } else {
        throw new Error(data.error || "Payment initialization failed")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error("Failed to process payment. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar companySlug={companySlug} companyName={companyContext?.name} companyLogo={companyContext?.logo} />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Link
            href={getStoreUrl(companySlug, '/cart')}
            className="inline-flex items-center gap-2 mb-8 text-sm hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>

          <h1 className="text-4xl font-light tracking-widest mb-12">
            CHECKOUT
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Shipping Information */}
                <div>
                  <h2 className="text-lg font-light mb-6">Shipping Address</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="First Name*"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="bg-secondary border-border"
                    />
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Last Name*"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="bg-secondary border-border"
                    />
                  </div>

                  <Input
                    type="email"
                    name="email"
                    placeholder="Email*"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-4 bg-secondary border-border"
                  />

                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Phone*"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-4 bg-secondary border-border"
                  />

                  <Input
                    type="text"
                    name="address"
                    placeholder="Street Address*"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="mt-4 bg-secondary border-border"
                  />

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="bg-secondary border-border"
                    />
                    <Input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="bg-secondary border-border"
                    />
                  </div>

                  <Input
                    type="text"
                    name="zip"
                    placeholder="Postal Code"
                    value={formData.zip}
                    onChange={handleInputChange}
                    className="mt-4 bg-secondary border-border"
                  />
                </div>

                {/* Payment Section */}
                <div>
                  <h2 className="text-lg font-light mb-6">Payment Method</h2>
                  <div className="border border-border p-6 bg-secondary">
                    <p className="text-sm mb-2">
                      Secure payment powered by Paystack
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You will be redirected to Paystack to complete your payment securely.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-6 text-base"
                >
                  {isLoading ? "Processing..." : `Complete Purchase - ₦${total.toLocaleString()}`}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="h-fit">
              <div className="border border-border p-8 space-y-6">
                <h2 className="text-lg font-light tracking-widest">
                  ORDER SUMMARY
                </h2>

                {/* Items */}
                <div className="space-y-3 max-h-96 overflow-y-auto text-sm">
                  {cart.map((item) => (
                    <div
                      key={`${item.id}-${item.size}-${item.color}`}
                      className="flex justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-medium">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-border pt-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? "Free" : `₦${shipping.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span>₦{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
