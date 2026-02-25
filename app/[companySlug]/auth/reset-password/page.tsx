"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/password-input"
import axios from "axios"

function ResetPasswordContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const router = useRouter()

    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [message, setMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token) {
            setStatus("error")
            setMessage("Invalid or missing reset token.")
            return
        }

        if (newPassword !== confirmPassword) {
            setStatus("error")
            setMessage("Passwords do not match.")
            return
        }

        if (newPassword.length < 8) {
            setStatus("error")
            setMessage("Password must be at least 8 characters.")
            return
        }

        setStatus("loading")

        try {
            await axios.post("/api/auth/reset-password", { token, newPassword })

            setStatus("success")
            setMessage("Your password has been reset successfully.")
            setTimeout(() => {
                router.push("/auth/signin")
            }, 3000)
        } catch (error: any) {
            setStatus("error")
            setMessage(error.response?.data?.error || "Failed to reset password. The token may be invalid or expired.")
        }
    }

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-light tracking-widest text-red-600">INVALID LINK</h1>
                <p className="text-muted-foreground mb-8">No reset token was provided in the URL.</p>
                <Button asChild variant="outline">
                    <Link href="/auth/forgot-password">Request New Link</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-light tracking-widest text-[#1d1d1f]">Set New Password</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Enter your new password below.
                </p>
            </div>

            {status === "success" ? (
                <div className="text-center space-y-4">
                    <p className="text-green-600 mb-6">{message}</p>
                    <p className="text-sm text-muted-foreground mb-4">Redirecting to sign in...</p>
                    <Button asChild className="w-full bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white py-6">
                        <Link href="/auth/signin">Sign In Now</Link>
                    </Button>
                </div>
            ) : (
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="newPassword" className="sr-only">New Password</label>
                            <PasswordInput
                                id="newPassword"
                                name="newPassword"
                                showValidations={true}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border-gray-200 focus:border-[#1d1d1f] focus:ring-[#1d1d1f] transition-colors"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={status === "loading"}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Confirm New Password</label>
                            <PasswordInput
                                id="confirmPassword"
                                name="confirmPassword"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border-gray-200 focus:border-[#1d1d1f] focus:ring-[#1d1d1f] transition-colors"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {status === "loading" ? "RESETTING..." : "RESET PASSWORD"}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <Suspense fallback={
                <div className="flex justify-center mt-20">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            }>
                <ResetPasswordContent />
            </Suspense>
        </div>
    )
}
