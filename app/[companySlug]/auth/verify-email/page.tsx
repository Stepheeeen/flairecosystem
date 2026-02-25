"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import axios from "axios"

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const router = useRouter()

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState("")

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
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            {status === "loading" && (
                <>
                    <h1 className="text-2xl font-light tracking-widest mb-4">VERIFYING EMAIL</h1>
                    <p className="text-muted-foreground">Please wait while we verify your email address...</p>
                </>
            )}

            {status === "success" && (
                <>
                    <h1 className="text-2xl font-light tracking-widest mb-4 text-green-600">VERIFIED</h1>
                    <p className="text-muted-foreground mb-8">{message}</p>
                    <p className="text-sm text-muted-foreground mb-4">Redirecting to sign in...</p>
                    <Button asChild>
                        <Link href="/auth/signin">Sign In Now</Link>
                    </Button>
                </>
            )}

            {status === "error" && (
                <>
                    <h1 className="text-2xl font-light tracking-widest mb-4 text-red-600">VERIFICATION FAILED</h1>
                    <p className="text-muted-foreground mb-8">{message}</p>
                    <Button asChild variant="outline">
                        <Link href="/auth/signin">Back to Sign In</Link>
                    </Button>
                </>
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
