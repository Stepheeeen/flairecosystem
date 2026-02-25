"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet"
import Image from "next/image"
import Link from "next/link"
import { getStoreUrl } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    image?: string
    size?: string
}

export function CartSheet({ companySlug }: { companySlug?: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [items, setItems] = useState<CartItem[]>([])
    const router = useRouter()

    useEffect(() => {
        const loadCart = () => {
            try {
                const cart = JSON.parse(localStorage.getItem("cart") || "[]")
                setItems(cart)
            } catch {
                setItems([])
            }
        }

        if (isOpen) {
            loadCart()
        }

        // Still need to listen for count updates for the trigger badge
        window.addEventListener("storage", loadCart)
        window.addEventListener("cartUpdated", loadCart)
        return () => {
            window.removeEventListener("storage", loadCart)
            window.removeEventListener("cartUpdated", loadCart)
        }
    }, [isOpen])

    const saveCart = (newItems: CartItem[]) => {
        setItems(newItems)
        localStorage.setItem("cart", JSON.stringify(newItems))
        window.dispatchEvent(new Event("cartUpdated"))
    }

    const updateQuantity = (id: string, delta: number) => {
        const newItems = items.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + delta)
                return { ...item, quantity: newQuantity }
            }
            return item
        })
        saveCart(newItems)
    }

    const removeItem = (id: string, size?: string) => {
        // If size is involved in uniqueness, handle it. Basic implementation assumes id is enough or size is part of id.
        const newItems = items.filter(item => !(item.id === id && item.size === size))
        saveCart(newItems)
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

    const basePath = companySlug ? `/${companySlug}` : ""
    const checkoutPath = `${basePath}/checkout`

    const handleCheckout = () => {
        setIsOpen(false)
        router.push(checkoutPath)
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group hover:bg-background/50">
                    <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-sm animate-zoom-in">
                            {cartCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent className="w-full sm:max-w-md flex flex-col border-l border-border/50 bg-background/95 backdrop-blur-xl">
                <SheetHeader className="pb-4 border-b border-border/50">
                    <SheetTitle className="text-xl font-light tracking-widest uppercase flex items-center gap-2">
                        Your Cart
                        <span className="text-sm font-normal text-muted-foreground tracking-normal bg-secondary px-2 py-0.5 rounded-sm">
                            {cartCount} {cartCount === 1 ? 'item' : 'items'}
                        </span>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-fade-in opacity-70">
                            <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
                            <p className="text-lg font-light text-muted-foreground">Your cart is empty</p>
                            <Button
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="mt-4 uppercase tracking-widest text-xs"
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        items.map((item, i) => (
                            <div key={`${item.id}-${item.size || i}`} className="flex gap-4 animate-slide-up group" style={{ animationDelay: `${i * 100}ms` }}>
                                {/* Image */}
                                <div className="relative h-24 w-20 bg-muted rounded-sm overflow-hidden flex-shrink-0 border border-border/30">
                                    {item.image ? (
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                                            <ShoppingCart className="h-6 w-6 text-muted-foreground/50" />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex flex-col flex-1 justify-between">
                                    <div>
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className="font-medium text-sm line-clamp-2 leading-tight pr-4">{item.name}</h4>
                                            <button onClick={() => removeItem(item.id, item.size)} className="text-muted-foreground hover:text-destructive transition-colors opacity-50 group-hover:opacity-100 p-1 -m-1">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {item.size && <p className="text-xs text-muted-foreground mt-1">Size: {item.size}</p>}
                                    </div>

                                    {/* Quantity & Price */}
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center border border-border rounded-sm bg-background">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <p className="font-medium">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="border-t border-border/50 pt-6 space-y-6 bg-background/50 backdrop-blur-md pb-6 mt-auto">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-xs">Calculated at checkout</span>
                            </div>
                            <div className="flex justify-between font-medium text-lg pt-4 border-t border-border/30">
                                <span>Total</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <Button
                            onClick={handleCheckout}
                            className="w-full py-6 text-sm uppercase tracking-widest rounded-sm"
                        >
                            Checkout
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
