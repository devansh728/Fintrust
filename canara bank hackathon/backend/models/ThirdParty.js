const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ThirdPartySchema = new mongoose.Schema({
  thirdPartyId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  apiKeyHash: { type: String, required: true },
  webhookUrl: { type: String },
  events: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

ThirdPartySchema.methods.compareApiKey = function(apiKey) {
  return bcrypt.compare(apiKey, this.apiKeyHash);
};

module.exports = mongoose.model('ThirdParty', ThirdPartySchema); 