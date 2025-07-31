"use client"

import { useState, useEffect } from "react"
import { Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ContractTimerProps {
  title: string
  expiryTimestamp: number
  onExpiry?: () => void
  onRenew?: () => void
  showRenewButton?: boolean
  criticalThreshold?: number // days
  warningThreshold?: number // days
}

export function ContractTimer({
  title,
  expiryTimestamp,
  onExpiry,
  onRenew,
  showRenewButton = false,
  criticalThreshold = 7,
  warningThreshold = 30,
}: ContractTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    total: number
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 })

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Date.now()
      const expiry = expiryTimestamp * 1000 // Convert to milliseconds
      const diff = expiry - now

      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 })
        onExpiry?.()
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining({ days, hours, minutes, seconds, total: diff })
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [expiryTimestamp, onExpiry])

  const getStatusColor = () => {
    const daysRemaining = timeRemaining.days
    if (daysRemaining <= criticalThreshold) return "text-red-600"
    if (daysRemaining <= warningThreshold) return "text-yellow-600"
    return "text-green-600"
  }

  const getStatusIcon = () => {
    const daysRemaining = timeRemaining.days
    if (daysRemaining <= criticalThreshold) return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (daysRemaining <= warningThreshold) return <Clock className="h-4 w-4 text-yellow-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusBadge = () => {
    const daysRemaining = timeRemaining.days
    if (timeRemaining.total <= 0) return <Badge className="bg-red-600 text-white">Expired</Badge>
    if (daysRemaining <= criticalThreshold) return <Badge className="bg-red-100 text-red-800">Critical</Badge>
    if (daysRemaining <= warningThreshold) return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
    return <Badge className="bg-green-100 text-green-800">Active</Badge>
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center">
            {getStatusIcon()}
            <span className="ml-2">{title}</span>
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        {timeRemaining.total > 0 ? (
          <div className="space-y-3">
            <div className={`text-2xl font-bold ${getStatusColor()}`}>
              {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
            </div>
            <div className="text-xs text-gray-500">Expires: {new Date(expiryTimestamp * 1000).toLocaleString()}</div>
            {showRenewButton && timeRemaining.days <= warningThreshold && (
              <Button size="sm" onClick={onRenew} className="w-full">
                Renew Now
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-2xl font-bold text-red-600">EXPIRED</div>
            {showRenewButton && (
              <Button size="sm" onClick={onRenew} className="w-full bg-red-600 hover:bg-red-700">
                Renew Required
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
