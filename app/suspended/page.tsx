import Link from "next/link"
import { ShieldAlert } from "lucide-react"

export default function SuspendedPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-secondary text-center p-12 rounded-lg border border-border shadow-2xl">
                <ShieldAlert className="w-16 h-16 mx-auto mb-6 text-destructive opacity-80" />
                <h1 className="text-3xl font-light tracking-widest uppercase mb-4 text-foreground">
                    Store Suspended
                </h1>
                <p className="text-muted-foreground mb-8 text-lg">
                    This storefront is currently unavailable.
                </p>
                <Link
                    href="/"
                    className="inline-block px-8 py-3 bg-primary text-primary-foreground text-sm tracking-widest uppercase hover:opacity-90 transition-opacity"
                >
                    Return to Platform
                </Link>
            </div>
        </div>
    )
}
