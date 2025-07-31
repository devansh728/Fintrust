const mongoose = require('mongoose');

const WebhookSubscriptionSchema = new mongoose.Schema({
  thirdPartyId: { type: String, required: true },
  webhookUrl: { type: String, required: true },
  events: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WebhookSubscription', WebhookSubscriptionSchema); 