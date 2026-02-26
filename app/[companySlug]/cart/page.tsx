"use client"
import { getStoreUrl } from "@/lib/utils"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { Trash2, ArrowRight } from "lucide-react"
import axios from "axios"

export default function CartPage({ params }: { params: Promise<{ companySlug: string }> }) {
  const unwrappedParams = use(params)
  const { companySlug } = unwrappedParams

  const { cart, removeItem, updateQuantity, subtotal, isLoading } = useCart()
  const [isMounted, setIsMounted] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")

  useEffect(() => {
    setIsMounted(true)
    // Fetch company name for the Navbar
    const fetchCompany = async () => {
      try {
        const res = await axios.get(`/api/companies/${companySlug}`)
        const data = res.data
        setCompanyName(data.name)
        setCompanyLogo(data.logo)
      } catch (error) {
        console.error("Failed to fetch company details")
      }
    }
    fetchCompany()
  }, [companySlug])

  if (!isMounted || isLoading) {
    return (
      <>
        <Navbar companySlug={companySlug} companyName={companyName} companyLogo={companyLogo} />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading cart...</p>
        </div>
      </>
    )
  }

  if (cart.length === 0) {
    return (
      <>
        <Navbar companySlug={companySlug} companyName={companyName} companyLogo={companyLogo} />
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-light tracking-widest mb-12">
              SHOPPING CART
            </h1>

            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground mb-8">
                Your cart is empty
              </p>
              <Link href={getStoreUrl(companySlug, '/products')}>
                <Button>Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  const shipping = subtotal > 100000 ? 0 : 5000
  const total = subtotal + shipping

  return (
    <>
      <Navbar companySlug={companySlug} companyName={companyName} companyLogo={companyLogo} />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-light tracking-widest mb-12">
            SHOPPING CART
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="flex gap-6 border-b border-border pb-8"
                >
                  <div className="w-24 h-32 flex-shrink-0 bg-secondary">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={96}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <Link href={getStoreUrl(companySlug, '/products/${item.id}')}>
                      <h3 className="text-sm font-medium hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                    </Link>

                    {(item.color || item.size) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.color && `Color: ${item.color}`}
                        {item.color && item.size && " • "}
                        {item.size && `Size: ${item.size}`}
                      </p>
                    )}

                    <p className="text-sm font-medium mt-2">
                      ₦{item.price.toLocaleString()}
                    </p>

                    <div className="flex items-center gap-3 border border-border w-fit mt-4">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="px-3 py-1 hover:bg-muted"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 text-sm">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-3 py-1 hover:bg-muted"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-destructive hover:underline mt-4"
                    >
                      <Trash2 className="h-4 w-4 inline mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-fit">
              <div className="border border-border p-8 space-y-6">
                <h2 className="text-lg font-light tracking-widest">
                  ORDER SUMMARY
                </h2>

                <div className="space-y-4 text-sm">
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
                  {shipping === 0 && (
                    <p className="text-xs text-green-600">
                      Free shipping applied!
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-6">
                  <div className="flex justify-between text-lg font-medium mb-6">
                    <span>Total</span>
                    <span>₦{total.toLocaleString()}</span>
                  </div>

                  <Link href={getStoreUrl(companySlug, '/checkout')}>
                    <Button className="w-full mb-3">
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>

                  <Link href={getStoreUrl(companySlug, '/products')}>
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>

              {shipping > 0 && (
                <div className="mt-6 p-4 bg-muted border border-border text-sm">
                  <p className="text-muted-foreground">
                    Free shipping on orders over ₦100,000
                  </p>
                  <p className="text-xs mt-2">
                    Add ₦{(100000 - subtotal).toLocaleString()} more to qualify
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
