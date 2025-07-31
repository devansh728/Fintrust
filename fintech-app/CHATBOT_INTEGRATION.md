# Chatbot Integration Guide

This guide explains how to integrate and customize the floating chatbot in your FinTech application.

## Overview

The chatbot integration provides three different modes:

1. **Native Mode** - Custom UI with API integration
2. **Iframe Mode** - Embeds your deployed chatbot in an iframe
3. **Hybrid Mode** - Combines both approaches for maximum flexibility

## Quick Setup

### 1. Update Your Chatbot URL

Edit `lib/chatbot-config.ts` and replace the placeholder URLs with your actual chatbot URLs:

```typescript
export const chatbotConfig = {
  url: "https://your-actual-chatbot-url.com", // Your deployed chatbot URL
  // ... other config
}
```

### 2. Choose Your Integration Mode

#### Iframe Mode (Recommended for deployed chatbots)
```typescript
useIframe: true
```

#### Native API Mode (For custom API integration)
```typescript
useIframe: false
```

### 3. Customize the Appearance

Modify the configuration in `lib/chatbot-config.ts`:

```typescript
export const chatbotConfig = {
  title: "Your Custom Title",
  description: "Your custom description",
  placeholder: "Your custom placeholder",
  welcomeMessage: "Your custom welcome message",
  // ... other customizations
}
```

## Features

### ✅ Floating Chat Button
- Positioned in bottom-right corner
- Smooth animations and hover effects
- Responsive design

### ✅ Chat Window
- Minimize/Maximize functionality
- Fullscreen mode (iframe only)
- Auto-scroll to latest messages
- Typing indicators
- Timestamp display

### ✅ Responsive Design
- Works on desktop, tablet, and mobile
- Adaptive sizing
- Touch-friendly interface

### ✅ Integration Options
- Iframe embedding for deployed chatbots
- Native API integration
- Message passing between iframe and parent

## Configuration Options

### Basic Configuration

```typescript
export const chatbotConfig = {
  // Your chatbot URL
  url: "https://your-chatbot-url.com",
  
  // UI Text
  title: "AI Assistant",
  description: "Get help with your questions",
  placeholder: "Type your message...",
  welcomeMessage: "Hello! How can I help you?",
  
  // Mode
  useIframe: true, // true for iframe, false for native API
  
  // Size
  iframeHeight: "400px",
  allowFullscreen: true,
}
```

### Advanced Configuration

```typescript
export const chatbotConfig = {
  // Position
  position: {
    bottom: "1rem",
    right: "1rem",
  },
  
  // Size
  size: {
    width: "320px",
    height: "400px",
    buttonSize: "56px",
  },
  
  // Theme
  theme: {
    primaryColor: "blue",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
    textColor: "text-white",
  },
  
  // Features
  features: {
    minimize: true,
    fullscreen: true,
    refresh: true,
    autoScroll: true,
    typingIndicator: true,
    timestamp: true,
  },
}
```

## Environment-Specific Configuration

The system automatically detects your environment and uses appropriate URLs:

### Development
```typescript
url: "http://localhost:3001"
```

### Production
```typescript
url: "https://your-production-chatbot-url.com"
```

## Integration Methods

### Method 1: Iframe Integration (Recommended)

Best for deployed chatbots that you want to embed seamlessly:

```typescript
// In lib/chatbot-config.ts
export const chatbotConfig = {
  useIframe: true,
  url: "https://your-deployed-chatbot.com",
  // ... other config
}
```

**Advantages:**
- Full control over your chatbot
- No need to modify existing chatbot
- Maintains all chatbot functionality
- Easy to update independently

### Method 2: Native API Integration

Best for custom chatbot APIs:

```typescript
// In lib/chatbot-config.ts
export const chatbotConfig = {
  useIframe: false,
  api: {
    endpoint: "https://your-api.com/chat",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer your-token"
    },
  }
}
```

**Advantages:**
- Complete control over UI
- Better performance
- Custom styling
- Direct API integration

### Method 3: Hybrid Integration

Combines both approaches for maximum flexibility:

```typescript
// The ChatbotHybrid component supports both modes
// You can switch between them dynamically
```

## Customization Examples

### Custom Styling

To customize the chatbot appearance, modify the component styles in `components/chatbot-hybrid.tsx`:

```tsx
// Change button color
<Button className="h-14 w-14 rounded-full shadow-lg bg-green-500 hover:bg-green-600 text-white">

// Change card styling
<Card className="w-80 h-96 shadow-2xl border-2 border-green-200">
```

### Custom Messages

Add custom message handling:

```typescript
// In the component
const handleCustomMessage = (message: string) => {
  // Your custom logic here
  console.log('Custom message:', message)
}
```

### Custom Events

Listen for chatbot events:

```typescript
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'chatbot_event') {
      // Handle custom events
      console.log('Chatbot event:', event.data)
    }
  }
  
  window.addEventListener('message', handleMessage)
  return () => window.removeEventListener('message', handleMessage)
}, [])
```

## Troubleshooting

### Common Issues

1. **Chatbot not loading**
   - Check if the URL is correct
   - Verify CORS settings on your chatbot
   - Check browser console for errors

2. **Iframe not displaying**
   - Ensure your chatbot allows iframe embedding
   - Check sandbox permissions
   - Verify the URL is accessible

3. **API calls failing**
   - Check API endpoint URL
   - Verify authentication headers
   - Check network connectivity

### Debug Mode

Enable debug logging:

```typescript
// Add to your component
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('Chatbot config:', chatbotConfig)
  console.log('Chatbot URL:', chatbotConfig.url)
}
```

## Security Considerations

### Iframe Security
- Uses sandbox attributes for security
- Restricts potentially dangerous features
- Validates message origins

### API Security
- Use HTTPS for all API calls
- Implement proper authentication
- Validate all inputs

### CORS Configuration
Ensure your chatbot server allows requests from your domain:

```
Access-Control-Allow-Origin: https://your-domain.com
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Performance Optimization

### Lazy Loading
The chatbot is loaded only when needed, reducing initial page load time.

### Caching
Consider implementing caching for chatbot responses in native mode.

### Compression
Ensure your chatbot assets are properly compressed.

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify your configuration settings
3. Test with different browsers
4. Check network connectivity

## Updates

To update the chatbot:
1. Modify the configuration in `lib/chatbot-config.ts`
2. Update your chatbot URL if needed
3. Test in development environment
4. Deploy to production

---

**Note:** Replace all placeholder URLs (`https://your-chatbot-url.com`) with your actual chatbot URLs before deploying. 