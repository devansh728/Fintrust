const ThirdParty = require('./models/ThirdParty');
const bcrypt = require('bcryptjs');

// Middleware to authenticate third party using API key
async function authenticateThirdParty(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing or invalid Authorization header' });
  }
  const apiKey = authHeader.split(' ')[1];
  if (!apiKey) {
    return res.status(401).json({ success: false, error: 'Missing API key' });
  }
  // Find third party by apiKey
  const thirdParties = await ThirdParty.find();
  for (const thirdParty of thirdParties) {
    const match = await bcrypt.compare(apiKey, thirdParty.apiKeyHash);
    if (match) {
      req.thirdParty = thirdParty;
      return next();
    }
  }
  return res.status(401).json({ success: false, error: 'Invalid API key' });
}

module.exports = authenticateThirdParty; 