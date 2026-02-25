"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/password-input"

function SuperAdminSignInForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl") || "/super-admin"
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setError("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.email || !formData.password) {
            setError("Please fill in all fields")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            })

            if (result?.error) {
                setError("Invalid email or password")
            } else {
                router.push(callbackUrl)
                router.refresh()
            }
        } catch {
            setError("An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-light tracking-widest mb-2">
                    SUPER ADMIN
                </h1>
                <p className="text-muted-foreground">
                    Sign in to the system management console
                </p>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="bg-secondary border-border"
                />

                <div>
                    <PasswordInput
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        className="bg-secondary border-border"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? "Signing in..." : "Sign In to Console"}
                </Button>
            </form>

            <div className="space-y-4 text-sm text-center mt-8 pt-6 border-t border-border">
                <p>
                    <Link href="/" className="hover:text-primary text-muted-foreground">
                        Back to main site
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default function SuperAdminSignInPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    <Suspense fallback={<div>Loading...</div>}>
                        <SuperAdminSignInForm />
                    </Suspense>
                </div>
            </main>
        </>
    )
}
