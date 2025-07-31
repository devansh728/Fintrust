"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MessageCircle, 
  X, 
  Bot, 
  Minimize2, 
  Maximize2,
  ExternalLink
} from 'lucide-react'

interface ChatbotIframeProps {
  chatbotUrl: string
  title?: string
  description?: string
  height?: string
  width?: string
  allowFullscreen?: boolean
}

export default function ChatbotIframe({
  chatbotUrl,
  title = "AI Assistant",
  description = "Ask me anything about your financial data and services",
  height = "400px",
  width = "320px",
  allowFullscreen = true
}: ChatbotIframeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setIsMinimized(false)
      setIsFullscreen(false)
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
    if (isFullscreen) {
      setIsFullscreen(false)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    if (isMinimized) {
      setIsMinimized(false)
    }
  }

  const openInNewTab = () => {
    window.open(chatbotUrl, '_blank', 'noopener,noreferrer')
  }

  // Handle iframe messages for better integration
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Handle messages from the iframe if needed
      if (event.origin !== new URL(chatbotUrl).origin) return
      
      // You can handle specific messages from your chatbot here
      console.log('Message from chatbot:', event.data)
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [chatbotUrl])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      {isOpen && (
        <Card className={`shadow-2xl border-2 transition-all duration-300 ${
          isMinimized ? 'h-16' : isFullscreen ? 'w-screen h-screen' : `w-80 h-96`
        } ${isFullscreen ? 'fixed inset-0 m-0 rounded-none' : ''}`}>
          <CardHeader className={`pb-2 ${isMinimized ? 'cursor-pointer' : ''}`} onClick={isMinimized ? toggleMinimize : undefined}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/bot-avatar.png" alt="AI Assistant" />
                  <AvatarFallback className="bg-blue-500 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                  {!isMinimized && (
                    <p className="text-xs text-gray-500">{description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {allowFullscreen && !isMinimized && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="h-6 w-6 p-0 hover:bg-gray-100"
                    title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMinimize}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleChat}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 flex-1 h-full">
              <div className="relative w-full h-full">
                <iframe
                  ref={iframeRef}
                  src={chatbotUrl}
                  className="w-full h-full border-0 rounded-b-lg"
                  style={{
                    height: isFullscreen ? 'calc(100vh - 80px)' : '320px',
                    minHeight: '320px'
                  }}
                  allow="microphone; camera; geolocation"
                  allowFullScreen={allowFullscreen}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  title={title}
                />
                {/* Optional overlay for better integration */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
} 