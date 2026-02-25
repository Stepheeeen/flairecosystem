"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/password-input"
import { getStoreUrl } from "@/lib/utils"
import axios from "axios"

export default function SignUpPage() {
  const router = useRouter()
  const params = useParams()
  const companySlug = params.companySlug as string
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await axios.post("/api/auth/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        companySlug,
      })

      router.push(getStoreUrl(companySlug, "/auth/signin"))
    } catch (error: any) {
      setError(error.response?.data?.error || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar companySlug={companySlug} companyName="STOREFRONT" />
      <main className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-light tracking-widest mb-2 uppercase">
                CREATE ACCOUNT
              </h1>
              <p className="text-muted-foreground">
                Join our store for a premium shopping experience
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="bg-secondary border-border"
              />

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

              <PasswordInput
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                showValidations={true}
                className="bg-secondary border-border"
              />

              <PasswordInput
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="bg-secondary border-border"
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="space-y-4 text-sm text-center">
              <p>
                Already have an account?{" "}
                <Link href={getStoreUrl(companySlug, "/auth/signin")} className="font-medium hover:text-primary">
                  Sign in
                </Link>
              </p>
              <p>
                <Link href={getStoreUrl(companySlug, "/")} className="hover:text-primary">
                  Back to home
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
