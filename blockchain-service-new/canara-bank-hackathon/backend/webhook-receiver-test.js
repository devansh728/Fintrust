const express = require('express');
const app = express();
const PORT = 3002;

// Store received webhooks
let receivedWebhooks = [];

app.use(express.json());

// Webhook receiver endpoint
app.post('/webhook', (req, res) => {
  const webhook = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    headers: req.headers,
    body: req.body
  };
  
  receivedWebhooks.push(webhook);
  
  console.log('🔔 WEBHOOK RECEIVED:', {
    event: req.body.event,
    timestamp: webhook.timestamp,
    data: req.body
  });
  
  res.status(200).json({ 
    success: true, 
    message: 'Webhook received',
    webhookId: webhook.id 
  });
});

// View all received webhooks
app.get('/webhooks', (req, res) => {
  res.json({
    count: receivedWebhooks.length,
    webhooks: receivedWebhooks
  });
});

// Clear all webhooks
app.delete('/webhooks', (req, res) => {
  receivedWebhooks = [];
  res.json({ 
    success: true, 
    message: 'All webhooks cleared' 
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'Webhook Receiver Test',
    port: PORT,
    webhooksReceived: receivedWebhooks.length,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🔔 Webhook Receiver Test running on port ${PORT}`);
  console.log(`📥 Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`📋 View webhooks: http://localhost:${PORT}/webhooks`);
  console.log(`🧹 Clear webhooks: DELETE http://localhost:${PORT}/webhooks`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
}); 