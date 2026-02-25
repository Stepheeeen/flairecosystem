"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import axios from "axios"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [message, setMessage] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus("loading")

        try {
            const response = await axios.post("/api/auth/forgot-password", { email })

            setStatus("success")
            setMessage(response.data.message || "If an account with that email exists, a reset link has been sent.")
        } catch (error: any) {
            setStatus("error")
            setMessage(error.response?.data?.error || "Failed to process request.")
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-light tracking-widest text-[#1d1d1f]">Reset Password</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your email to receive a password reset link
                    </p>
                </div>

                {status === "success" ? (
                    <div className="text-center space-y-4">
                        <p className="text-green-600 mb-6">{message}</p>
                        <Button asChild className="w-full bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white py-6">
                            <Link href="/auth/signin">Back to Sign In</Link>
                        </Button>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="sr-only">Email address</label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border-gray-200 focus:border-[#1d1d1f] focus:ring-[#1d1d1f] transition-colors"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={status === "loading"}
                                />
                            </div>
                        </div>

                        {status === "error" && (
                            <p className="text-red-500 text-sm text-center">{message}</p>
                        )}

                        <div>
                            <Button
                                type="submit"
                                className="w-full bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white py-6 text-sm tracking-widest transition-colors"
                                disabled={status === "loading"}
                            >
                                {status === "loading" ? "SENDING..." : "SEND RESET LINK"}
                            </Button>
                        </div>
                    </form>
                )}

                <div className="text-center mt-6">
                    <Link href="/auth/signin" className="text-sm font-medium text-gray-600 hover:text-[#1d1d1f] flex items-center justify-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    )
}
