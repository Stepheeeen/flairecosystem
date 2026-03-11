"use client"

import Image, { ImageProps } from "next/image"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SafeImageProps extends ImageProps {
    fallbackSrc?: string
}

export function SafeImage({ src, fallbackSrc, alt, className, ...props }: SafeImageProps) {
    const [imgSrc, setImgSrc] = useState(src)
    const [error, setError] = useState(false)

    // Update internal src if prop changes
    useEffect(() => {
        setImgSrc(src)
        setError(false)
    }, [src])

    const defaultFallback = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" font-family="sans-serif" font-size="10" text-anchor="middle" alignment-baseline="middle" fill="%239ca3af">Image Not Found</text></svg>`

    return (
        <Image
            {...props}
            alt={alt}
            src={error ? (fallbackSrc || defaultFallback) : imgSrc}
            className={cn(className, error && "object-contain p-4 bg-muted/20")}
            onError={() => {
                setError(true)
            }}
            unoptimized={error ? true : props.unoptimized}
        />
    )
}
