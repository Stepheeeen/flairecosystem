"use client"

import { useEffect, useState } from "react"
import { Bell, Check, Package, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"
import axios from "axios"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
    id: string
    title: string
    message: string
    type: string
    read: boolean
    link?: string
    createdAt: string
}

export function AdminHeader({ title, backLink, backLabel }: { title: string, backLink?: string, backLabel?: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)

    const fetchNotifications = async () => {
        try {
            const res = await axios.get("/api/admin/notifications")
            setNotifications(res.data.notifications)
            setUnreadCount(res.data.unreadCount)
        } catch (error: any) {
            if (error?.response?.status !== 401) {
                console.error("Failed to fetch notifications", error)
            }
        }
    }

    const { status } = useSession()

    useEffect(() => {
        if (status !== "authenticated") return

        fetchNotifications()
        // Poll every 30 seconds for new orders/alerts
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [status])

    const markAsRead = async (id: string) => {
        try {
            await axios.patch("/api/admin/notifications", { id })
            // Optimistically update UI
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Failed to mark notification as read", error)
        }
    }

    return (
        <div className="border-b border-border bg-secondary">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center">

                    <div className="flex items-center gap-4">
                        {backLink && (
                            <Link
                                href={backLink}
                                className="flex items-center gap-2 text-sm hover:text-primary mr-4"
                            >
                                <span className="text-xl">&larr;</span> {backLabel || "Back"}
                            </Link>
                        )}
                        <h1 className="text-3xl font-light tracking-widest uppercase">{title}</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-destructive" />
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[380px] p-0">
                                <DropdownMenuLabel className="p-4 border-b border-border flex justify-between items-center">
                                    <span className="font-medium">Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </DropdownMenuLabel>

                                <ScrollArea className="h-[300px]">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-sm text-muted-foreground">
                                            No notifications yet
                                        </div>
                                    ) : (
                                        <div className="flex flex-col">
                                            {notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={`p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-secondary/20' : ''}`}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className={`text-sm ${!notification.read ? 'font-medium' : 'text-muted-foreground'}`}>
                                                            {notification.title}
                                                        </h4>
                                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>

                                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                        {notification.message}
                                                    </p>

                                                    <div className="flex justify-between items-center mt-2">
                                                        {notification.link ? (
                                                            <Link
                                                                href={notification.link}
                                                                onClick={() => {
                                                                    if (!notification.read) markAsRead(notification.id)
                                                                    setIsOpen(false)
                                                                }}
                                                                className="text-xs text-primary hover:underline"
                                                            >
                                                                View Details
                                                            </Link>
                                                        ) : <div />}

                                                        {!notification.read && (
                                                            <button
                                                                onClick={() => markAsRead(notification.id)}
                                                                className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                                                            >
                                                                <Check className="h-3 w-3" /> Mark read
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
                            Sign Out
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    )
}
