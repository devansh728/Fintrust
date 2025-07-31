const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  requestId: { type: String, required: true },
  thirdPartyId: { type: String, required: true },
  userId: { type: String, required: true },
  message: { type: String },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

module.exports = mongoose.model('Notification', NotificationSchema); 