"use client"
import { getStoreUrl } from "@/lib/utils"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { ShoppingCart, ArrowLeft, Star } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import axios from "axios"
import { useSession } from "next-auth/react"

interface Review {
  _id: string
  rating: number
  text: string
  createdAt: string
  userId: { name: string }
}

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
  const { data: session } = useSession()

  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [productRes, reviewsRes] = await Promise.all([
          axios.get(`/api/products/${params.id}`),
          axios.get(`/api/products/${params.id}/reviews`)
        ])

        const data = productRes.data
        setProduct(data)
        setReviews(reviewsRes.data)
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return toast.error("Please sign in to leave a review")
    if (!reviewText) return

    setIsSubmittingReview(true)
    try {
      const paramsId = params.id as string
      const res = await axios.post(`/api/products/${paramsId}/reviews`, {
        rating,
        text: reviewText
      })

      // Re-fetch reviews to get the populated user name
      const reviewsRes = await axios.get(`/api/products/${paramsId}/reviews`)
      setReviews(reviewsRes.data)

      setReviewText("")
      setRating(5)
      toast.success("Review submitted successfully!")
    } catch (error: any) {
      console.error("Failed to submit review", error)
      toast.error(error.response?.data?.error || "Failed to submit review")
    } finally {
      setIsSubmittingReview(false)
    }
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

          {/* Reviews Section */}
          <div className="mt-24 border-t border-border pt-16">
            <h2 className="text-2xl font-light tracking-widest uppercase mb-12">Customer Reviews</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Review Form */}
              <div className="col-span-1 space-y-6">
                <h3 className="text-lg font-medium">Write a Review</h3>
                {session ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 transition-colors ${star <= rating ? 'fill-primary text-primary' : 'text-muted stroke-border'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">Your Thought</label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="What did you like or dislike?"
                        className="w-full border border-border bg-background p-3 text-sm min-h-[120px] focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmittingReview}>
                      {isSubmittingReview ? "Submitting..." : "Submit Review"}
                    </Button>
                  </form>
                ) : (
                  <div className="bg-secondary/30 border border-border p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-4">Please log in to share your thoughts.</p>
                    <Link href={`/auth/signin?callbackUrl=/products/${params.id}`}>
                      <Button variant="outline" className="w-full text-xs uppercase tracking-widest">Sign In</Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Reviews List */}
              <div className="col-span-1 md:col-span-2 space-y-8">
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review._id} className="border-b border-border pb-6">
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating ? 'fill-primary text-primary' : 'text-muted stroke-border'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm font-medium mb-1">{review.userId?.name || "Verified Customer"}</p>
                      <p className="text-xs text-muted-foreground mb-3">{new Date(review.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm leading-relaxed">{review.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
