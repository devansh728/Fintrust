const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  owner: { type: String, required: true }, // wallet address
  fileName: { type: String, required: true },
  ipfsCid: { type: String },
  uploadDate: { type: Date, default: Date.now },
  authorizedParties: [{ type: String }]
});

module.exports = mongoose.model('File', FileSchema); 