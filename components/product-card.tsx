"use client"
import { getStoreUrl } from "@/lib/utils"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { ShoppingCart } from "lucide-react"

export interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  description?: string
}

interface ProductCardProps {
  product: Product
  companySlug?: string
}

export function ProductCard({ product, companySlug }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsAdding(true)
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      })
    } finally {
      setIsAdding(false)
    }
  }

  const productLink = companySlug ? getStoreUrl(companySlug, '/products/${product.id}') : `/products/${product.id}`

  return (
    <Link href={productLink}>
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden bg-secondary mb-4">
          <Image
            src={product.image || "/placeholder.png"}
            alt={product.name}
            width={400}
            height={500}
            className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300"
            priority={false}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground tracking-widest uppercase">
            {product.category}
          </p>
          <h3 className="text-base font-light text-balance">
            {product.name}
          </h3>
          <p className="text-lg font-medium">
            ₦{product.price.toLocaleString()}
          </p>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={isAdding}
          variant="outline"
          className="w-full mt-4"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isAdding ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </Link>
  )
}
