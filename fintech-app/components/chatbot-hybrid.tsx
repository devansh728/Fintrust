"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  Minimize2, 
  Maximize2,
  ExternalLink,
  Loader2,
  Settings,
  RefreshCw
} from 'lucide-react'

interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  isLoading?: boolean
}

interface ChatbotHybridProps {
  chatbotUrl: string
  title?: string
  description?: string
  placeholder?: string
  welcomeMessage?: string
  useIframe?: boolean
  iframeHeight?: string
  allowFullscreen?: boolean
}

export default function ChatbotHybrid({
  chatbotUrl,
  title = "AI Assistant",
  description = "Ask me anything about your financial data and services",
  placeholder = "Type your message...",
  welcomeMessage = "Hello! I'm your AI assistant. How can I help you today?",
  useIframe = false,
  iframeHeight = "320px",
  allowFullscreen = true
}: ChatbotHybridProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: welcomeMessage,
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [iframeKey, setIframeKey] = useState(0) // For iframe refresh
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && !useIframe) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, isMinimized, useIframe])

  // Handle iframe messages for better integration
  useEffect(() => {
    if (!useIframe) return

    const handleMessage = (event: MessageEvent) => {
      // Handle messages from the iframe if needed
      if (event.origin !== new URL(chatbotUrl).origin) return
      
      // You can handle specific messages from your chatbot here
      console.log('Message from chatbot:', event.data)
      
      // Example: Handle chatbot responses
      if (event.data.type === 'chatbot_response') {
        const botMessage: ChatMessage = {
          id: Date.now().toString(),
          content: event.data.message,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [chatbotUrl, useIframe])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    if (useIframe) {
      // Send message to iframe
      if (iframeRef.current) {
        iframeRef.current.contentWindow?.postMessage({
          type: 'user_message',
          message: userMessage.content,
          timestamp: userMessage.timestamp.toISOString()
        }, '*')
      }
      setIsLoading(false)
    } else {
      // Native API call
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: '',
        sender: 'bot',
        timestamp: new Date(),
        isLoading: true
      }

      setMessages(prev => [...prev, botMessage])

      try {
        const response = await fetch(chatbotUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage.content,
            userId: 'user-' + Date.now(),
            timestamp: userMessage.timestamp.toISOString()
          })
        })

        if (!response.ok) {
          throw new Error('Failed to get response from chatbot')
        }

        const data = await response.json()
        
        setMessages(prev => prev.map(msg => 
          msg.id === botMessage.id 
            ? { ...msg, content: data.response || 'Sorry, I couldn\'t process your request.', isLoading: false }
            : msg
        ))
      } catch (error) {
        console.error('Chatbot error:', error)
        setMessages(prev => prev.map(msg => 
          msg.id === botMessage.id 
            ? { ...msg, content: 'Sorry, I\'m having trouble connecting right now. Please try again later.', isLoading: false }
            : msg
        ))
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

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

  const refreshIframe = () => {
    setIframeKey(prev => prev + 1)
  }

  const openInNewTab = () => {
    window.open(chatbotUrl, '_blank', 'noopener,noreferrer')
  }

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
                {useIframe && !isMinimized && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshIframe}
                      className="h-6 w-6 p-0 hover:bg-gray-100"
                      title="Refresh chatbot"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    {allowFullscreen && (
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
                  </>
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
            <>
              {useIframe ? (
                // Iframe Mode
                <CardContent className="p-0 flex-1 h-full">
                  <div className="relative w-full h-full">
                    <iframe
                      key={iframeKey}
                      ref={iframeRef}
                      src={chatbotUrl}
                      className="w-full h-full border-0 rounded-b-lg"
                      style={{
                        height: isFullscreen ? 'calc(100vh - 80px)' : iframeHeight,
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
              ) : (
                // Native Mode
                <>
                  {/* Messages Area */}
                  <CardContent className="p-0 flex-1">
                    <ScrollArea className="h-64 px-4">
                      <div className="space-y-3 py-2">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                                message.sender === 'user'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              {message.isLoading ? (
                                <div className="flex items-center space-x-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="text-sm">Typing...</span>
                                </div>
                              ) : (
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              )}
                              <span className="text-xs opacity-70 mt-1 block">
                                {message.timestamp.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </CardContent>

                  {/* Input Area */}
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholder}
                        disabled={isLoading}
                        className="flex-1 text-sm"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        size="sm"
                        className="px-3"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
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