import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ChatbotHybrid from "@/components/chatbot-hybrid"
import { getEnvironmentConfig } from "@/lib/chatbot-config"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FinTech Pro - Secure Financial Management",
  description: "Professional fintech application for secure financial data management and third-party integrations",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const chatbotConfig = getEnvironmentConfig()

  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ChatbotHybrid
          chatbotUrl={chatbotConfig.url}
          title={chatbotConfig.title}
          description={chatbotConfig.description}
          placeholder={chatbotConfig.placeholder}
          welcomeMessage={chatbotConfig.welcomeMessage}
          useIframe={chatbotConfig.useIframe}
          iframeHeight={chatbotConfig.iframeHeight}
          allowFullscreen={chatbotConfig.allowFullscreen}
        />
      </body>
    </html>
  )
}
