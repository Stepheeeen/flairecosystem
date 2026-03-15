"use client"

import { useEffect, useState } from "react"

interface PreloaderProps {
    text?: string
    fullScreen?: boolean
}

export function Preloader({ text = "FLAIR", fullScreen = true }: PreloaderProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className={`flex flex-col items-center justify-center bg-background z-50 transition-opacity duration-1000 ${fullScreen ? 'fixed inset-0' : 'h-64 w-full'}`}>
            <div className="relative flex flex-col items-center">
                {/* Sleek, thin circular progress */}
                <div className="w-24 h-24 border-[1px] border-primary/10 rounded-full flex items-center justify-center">
                    <div className="w-24 h-24 border-t-[1px] border-primary rounded-full animate-spin absolute inset-0" style={{ animationDuration: '2s' }} />

                    {/* Logo/Text Animation */}
                    <div className="overflow-hidden flex flex-col items-center justify-center gap-1">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="h-8 w-auto object-contain opacity-80"
                        />
                        <h2 className="text-[10px] font-light tracking-[0.4em] animate-pulse text-primary pl-[0.4em]">
                            {text}
                        </h2>
                    </div>
                </div>

                {/* Subtle subtext */}
                <p className="mt-8 text-[10px] tracking-[0.3em] font-light text-muted-foreground uppercase opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500 fill-mode-forwards">
                    Eco System
                </p>
            </div>

            {/* Decorative luxury lines */}
            <div className="absolute top-10 left-10 w-20 h-[1px] bg-primary/5 hidden md:block" />
            <div className="absolute bottom-10 right-10 w-20 h-[1px] bg-primary/5 hidden md:block" />
        </div>
    )
}
