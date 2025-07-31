// Chatbot Configuration
export const chatbotConfig = {
  // Your deployed chatbot URL
  url: "https://chatbot-fintrust.vercel.app/", // Replace with your actual chatbot URL
  
  // UI Configuration
  title: "FinTech Assistant",
  description: "Get help with your financial data and services",
  placeholder: "Ask me anything...",
  welcomeMessage: "Hello! I'm your FinTech assistant. How can I help you with your financial data and services today?",
  
  // Mode Configuration
  useIframe: true, // Set to true for iframe mode, false for native API mode
  iframeHeight: "400px",
  allowFullscreen: true,
  
  // Position Configuration
  position: {
    bottom: "1rem", // 16px
    right: "1rem",  // 16px
  },
  
  // Size Configuration
  size: {
    width: "320px",
    height: "400px",
    buttonSize: "56px", // 14 * 4 = 56px (h-14)
  },
  
  // Theme Configuration
  theme: {
    primaryColor: "blue",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
    textColor: "text-white",
  },
  
  // Features Configuration
  features: {
    minimize: true,
    fullscreen: true,
    refresh: true,
    autoScroll: true,
    typingIndicator: true,
    timestamp: true,
  },
  
  // API Configuration (for native mode)
  api: {
    endpoint: "https://your-chatbot-api.com/chat", // Replace with your API endpoint
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000, // 30 seconds
  },
  
  // Iframe Configuration
  iframe: {
    sandbox: "allow-scripts allow-same-origin allow-forms allow-popups allow-modals",
    allow: "microphone; camera; geolocation",
  },
}

// Helper function to get chatbot configuration
export function getChatbotConfig() {
  return chatbotConfig
}

// Helper function to update chatbot configuration
export function updateChatbotConfig(updates: Partial<typeof chatbotConfig>) {
  Object.assign(chatbotConfig, updates)
}

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV
  
  switch (env) {
    case 'development':
      return {
        ...chatbotConfig,
        url: "http://localhost:3001", // Local development chatbot URL
        api: {
          ...chatbotConfig.api,
          endpoint: "http://localhost:3001/api/chat",
        }
      }
    case 'production':
      return {
        ...chatbotConfig,
        url: "https://your-production-chatbot-url.com", // Production chatbot URL
        api: {
          ...chatbotConfig.api,
          endpoint: "https://your-production-api.com/chat",
        }
      }
    default:
      return chatbotConfig
  }
} 