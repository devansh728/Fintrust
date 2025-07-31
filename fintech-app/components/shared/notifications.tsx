"use client"

import { useState, useEffect } from "react"
import { Bell, X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import io from "socket.io-client"

interface EventNotification {
  _id: string
  eventType: string
  requestId: string
  thirdPartyId: string
  userId: string
  message: string
  timestamp: string
  read: boolean
}

export function NotificationSystem({ onNotificationClick }: { onNotificationClick?: (requestId: string) => void }) {
  const [notifications, setNotifications] = useState<EventNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Fetch unread notifications from backend on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      const apiKey = localStorage.getItem("tpp_api_key")
      if (!apiKey) return
      const res = await fetch("http://localhost:3001/api/third-party/notifications", {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications)
        localStorage.setItem("tpp_notifications", JSON.stringify(data.notifications))
      }
    }
    fetchNotifications()
  }, [])

  // Websocket real-time notifications
  useEffect(() => {
    const apiKey = localStorage.getItem("tpp_api_key")
    if (!apiKey) return
    const socket = io("http://localhost:3001", { query: { apiKey } })
    socket.on("notification", (notification: EventNotification) => {
      setNotifications((prev) => [notification, ...prev])
      localStorage.setItem("tpp_notifications", JSON.stringify([notification, ...notifications]))
    })
    return () => { socket.disconnect() }
  }, [notifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)))
    // Mark as read in backend
    const apiKey = localStorage.getItem("tpp_api_key")
    await fetch("http://localhost:3001/api/third-party/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ notificationIds: [id] }),
    })
  }

  const markAllAsRead = async () => {
    const ids = notifications.filter((n) => !n.read).map((n) => n._id)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    const apiKey = localStorage.getItem("tpp_api_key")
    await fetch("http://localhost:3001/api/third-party/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ notificationIds: ids }),
    })
  }

  // Navigation logic: go to correct tab (e.g., hashes/data access)
  const handleNotificationClick = (notification: EventNotification) => {
    markAsRead(notification._id)
    if (onNotificationClick) {
      onNotificationClick(notification.requestId)
    }
    window.location.hash = "#webhook"
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
          <SheetDescription>Stay updated with important system events and actions</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification._id}
                className={`relative ${!notification.read ? "border-blue-200 bg-blue-50/50" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-blue-500" />
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium">{notification.eventType}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className="bg-blue-100 text-blue-800">Event</Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification._id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                  <div className="flex space-x-2">
                    {!notification.read && (
                      <Button size="sm" variant="outline" onClick={() => markAsRead(notification._id)}>
                        Mark as read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      Go to Data Access
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
