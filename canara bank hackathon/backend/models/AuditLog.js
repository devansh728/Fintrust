const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  eventType: { type: String, required: true }, // e.g., 'data_access', 'consent_granted'
  thirdPartyId: { type: String },
  userAddress: { type: String },
  dataHash: { type: String },
  token: { type: String },
  details: { type: Object },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema); 