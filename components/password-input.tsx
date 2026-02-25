"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordInputProps extends Omit<React.ComponentProps<"input">, "type"> {
    showValidations?: boolean
    onValidChange?: (isValid: boolean) => void
}

export function PasswordInput({
    className,
    showValidations = false,
    onValidChange,
    value,
    onChange,
    ...props
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false)
    const password = (value as string) || ""

    const validations = [
        { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
        { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
        { label: "Contains lowercase letter", test: (p: string) => /[a-z]/.test(p) },
        { label: "Contains a number", test: (p: string) => /[0-9]/.test(p) },
        { label: "Contains special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
    ]

    const isValid = validations.every((v) => v.test(password))

    useEffect(() => {
        if (onValidChange) {
            onValidChange(isValid)
        }
    }, [isValid, onValidChange])

    return (
        <div className="w-full space-y-3">
            <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    className={cn("pr-10", className)}
                    value={value}
                    onChange={onChange}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>

            {showValidations && (
                <div className="space-y-2 mt-2">
                    {validations.map((v, i) => {
                        const passed = v.test(password)
                        return (
                            <div
                                key={i}
                                className={cn(
                                    "flex items-center gap-2 text-xs transition-colors",
                                    passed ? "text-green-600" : "text-muted-foreground"
                                )}
                            >
                                {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                <span>{v.label}</span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
