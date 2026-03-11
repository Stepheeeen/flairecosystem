"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import axios from "axios"

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const params = useParams()
    const companySlug = params.companySlug as string
    const token = searchParams.get("token")
    const router = useRouter()

    const [isResending, setIsResending] = useState(false)
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState("")

    const handleResend = async () => {
        if (isResending) return
        setIsResending(true)
        try {
            await axios.post("/api/auth/resend-verification", {
                email: localStorage.getItem("pending_verification_email") || "",
                companySlug
            })
            alert("A new verification link has been sent to your email.")
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to resend verification email.")
        } finally {
            setIsResending(false)
        }
    }

    useEffect(() => {
        if (!token) {
            setStatus("error")
            setMessage("No verification token provided.")
            return
        }

        const verifyToken = async () => {
            try {
                await axios.post("/api/auth/verify-email", { token })

                setStatus("success")
                setMessage("Your email has been successfully verified!")
                // Clean up pending email
                localStorage.removeItem("pending_verification_email")
                setTimeout(() => {
                    router.push("/auth/signin")
                }, 3000)
            } catch (error: any) {
                setStatus("error")
                setMessage(error.response?.data?.error || "Verification failed. The token may be invalid or expired.")
            }
        }

        verifyToken()
    }, [token, router])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 max-w-md mx-auto">
            {status === "loading" && (
                <div className="space-y-4">
                    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <h1 className="text-2xl font-light tracking-widest mb-4 uppercase">Verifying Email</h1>
                    <p className="text-muted-foreground">Please wait while we validate your credentials...</p>
                </div>
            )}

            {status === "success" && (
                <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h1 className="text-3xl font-light tracking-widest mb-4 uppercase">Verified</h1>
                    <p className="text-muted-foreground mb-8">{message}</p>
                    <p className="text-sm text-muted-foreground mb-4">Redirecting you to sign in shortly...</p>
                    <Button asChild className="w-full">
                        <Link href="/auth/signin">Sign In Now</Link>
                    </Button>
                </div>
            )}

            {status === "error" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                    <h1 className="text-3xl font-light tracking-widest mb-4 uppercase text-red-600">Failed</h1>
                    <p className="text-muted-foreground mb-8">{message}</p>
                    <div className="flex flex-col gap-3 w-full">
                        <Button onClick={handleResend} disabled={isResending} variant="default">
                            {isResending ? "Sending..." : "Resend Verification Email"}
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/auth/signin">Back to Sign In</Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-background pt-20">
            <Suspense fallback={
                <div className="flex justify-center mt-20">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            }>
                <VerifyEmailContent />
            </Suspense>
        </div>
    )
}
