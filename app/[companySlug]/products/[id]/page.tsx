"use client"
import { getStoreUrl } from "@/lib/utils"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { ShoppingCart, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import axios from "axios"

interface Product {
  id: string
  _id: string
  name: string
  price: number
  image: string
  category: string
  description?: string
  sizes?: string[]
  colors?: string[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${params.id}`)
        const data = response.data
        setProduct(data)
        if (data.colors?.length) setSelectedColor(data.colors[0])
        if (data.sizes?.length) setSelectedSize(data.sizes[0])
      } catch (error) {
        console.error("Failed to load product:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const handleAddToCart = () => {
    if (!product) return

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize,
        color: selectedColor,
      })
    }

    toast.success("Added to cart", {
      description: `${product.name} x${quantity}`,
    })
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Product not found</p>
            <Link href="/products">
              <Button>Back to Shop</Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Link href="/products" className="inline-flex items-center gap-2 mb-8 text-sm hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="bg-secondary flex items-center justify-center aspect-square">
              <Image
                src={product.image}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              {/* Header */}
              <div>
                <p className="text-xs text-muted-foreground tracking-widest uppercase mb-2">
                  {product.category}
                </p>
                <h1 className="text-4xl font-light mb-4">
                  {product.name}
                </h1>
                <p className="text-2xl font-medium">
                  ₦{product.price.toLocaleString()}
                </p>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3 tracking-widest uppercase">
                    Color
                  </h3>
                  <div className="flex gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 text-sm border transition-all ${selectedColor === color
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-foreground"
                          }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3 tracking-widest uppercase">
                    Size
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 text-sm border transition-all ${selectedSize === size
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-foreground"
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-medium mb-3 tracking-widest uppercase">
                  Quantity
                </h3>
                <div className="flex items-center gap-4 border border-border w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-muted"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-muted"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>

              {/* Additional Info */}
              <div className="border-t border-border pt-8 space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2 tracking-widest uppercase">
                    Shipping & Returns
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Free shipping on orders over ₦100,000. Returns accepted within 30 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
