"use client"

import { useState, Suspense, useEffect } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/password-input"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
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
          SIGN IN
        </h1>
        <p className="text-muted-foreground">
          Welcome back to your account
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
          <div className="flex justify-end mt-2">
            <Link href="/auth/forgot-password" className="text-sm font-medium hover:text-primary text-muted-foreground">
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="space-y-4 text-sm text-center">
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium hover:text-primary">
            Create one
          </Link>
        </p>
        <p>
          <Link href="/" className="hover:text-primary">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  const params = useParams()
  const companySlug = params?.companySlug as string
  const [companyContext, setCompanyContext] = useState<{ id: string, name: string, logo?: string } | null>(null)

  useEffect(() => {
    if (companySlug) {
      axios.get(`/api/companies/${companySlug}`)
        .then(res => setCompanyContext({ id: res.data._id || res.data.id, name: res.data.name, logo: res.data.logo }))
        .catch(err => console.error(err))
    }
  }, [companySlug])

  return (
    <>
      <Navbar companySlug={companySlug} companyName={companyContext?.name || "STOREFRONT"} companyLogo={companyContext?.logo} />
      <main className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Suspense fallback={<div>Loading...</div>}>
            <SignInForm />
          </Suspense>
        </div>
      </main>
    </>
  )
}
