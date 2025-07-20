process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express');
const cors = require('cors');
const path = require('path');
const { blockchainService, initializeBlockchainService } = require('./blockchain-service');
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const FileModel = require('./models/File');
const upload = multer({ dest: 'uploads/' });
const axios = require('axios');
const ThirdParty = require('./models/ThirdParty');
const WebhookSubscription = require('./models/WebhookSubscription');
const AuditLog = require('./models/AuditLog');
const authenticateThirdParty = require('./auth-middleware');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const mongoURI = 'mongodb+srv://yuvraj0121singh:HhDOieHntJbQYerQ@cluster0.p3gmjmy.mongodb.net/mydb?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Setup GridFSBucket after MongoDB connection is open
let gfs;
mongoose.connection.once('open', () => {
  gfs = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
});

const app = express();
const PORT = process.env.PORT || 3001;

(async () => {
  await initializeBlockchainService();
  console.log('>>> BlockchainService fully initialized, starting server...');

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'UP',
      service: 'Node.js Backend',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      blockchain: 'integrated'
    });
  });

  // Blockchain status endpoint
  app.get('/api/blockchain/status', async (req, res) => {
    try {
      const networkInfo = await blockchainService.getNetworkInfo();
      const contractStatus = await blockchainService.getContractStatus();
      const walletInfo = await blockchainService.getWalletInfo();

      // Convert all BigInt values to strings in the response
      function convertBigInt(obj) {
        if (Array.isArray(obj)) return obj.map(convertBigInt);
        if (obj && typeof obj === 'object') {
          return Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [k, typeof v === 'bigint' ? v.toString() : convertBigInt(v)])
          );
        }
        return obj;
      }

      res.json(convertBigInt({
        status: 'connected',
        network: networkInfo,
        contracts: contractStatus,
        wallet: walletInfo,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Wallet info endpoint
  app.get('/api/blockchain/wallet', async (req, res) => {
    try {
      const walletInfo = await blockchainService.getWalletInfo();

      // Convert all BigInt values to strings in the response
      function convertBigInt(obj) {
        if (Array.isArray(obj)) return obj.map(convertBigInt);
        if (obj && typeof obj === 'object') {
          return Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [k, typeof v === 'bigint' ? v.toString() : convertBigInt(v)])
          );
        }
        return obj;
      }

      if (walletInfo) {
        res.json(convertBigInt({
          success: true,
          wallet: walletInfo,
          timestamp: new Date().toISOString()
        }));
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get wallet information',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Token access endpoint
  app.get('/api/blockchain/token/:tokenAddress', async (req, res) => {
    try {
      const { tokenAddress } = req.params;
      const tokenInfo = await blockchainService.checkTokenAccess(tokenAddress);
      
      res.json({
        success: true,
        token: tokenInfo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Grant consent endpoint
  app.post('/api/blockchain/grant-consent', async (req, res) => {
    try {
      console.log('Grant Consent Endpoint: contracts:', blockchainService.contracts);
      const unified = req.body;
      if (!unified.privacy || !unified.blockchain) {
        return res.status(400).json({
          success: false,
          error: 'Missing required sections in unified JSON format'
        });
      }
      const dataHash = unified.blockchain.dataHash;
      const useCase = unified.privacy.useCase;
      const thirdPartyId = unified.privacy.thirdPartyId;
      const dataType = unified.privacy.dataType;
      const duration = unified.privacy.duration || 365 * 24 * 60 * 60;
      if (!dataHash || !useCase || !thirdPartyId || !dataType || !duration) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters in unified JSON'
        });
      }
      const result = await blockchainService.grantConsent(
        dataHash, useCase, thirdPartyId, dataType, duration
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Tokenize data endpoint
  app.post('/api/blockchain/tokenize-data', async (req, res) => {
    try {
      console.log('Tokenize Data Endpoint: contracts:', blockchainService.contracts);
      const unified = req.body;
      if (!unified.blockchain || !unified.privacy) {
        return res.status(400).json({
          success: false,
          error: 'Missing required sections in unified JSON format'
        });
      }
      const originalDataHash = unified.blockchain.dataHash;
      const token = unified.blockchain.token;
      const encryptionKeyHash = unified.blockchain.encryptionKeyHash;
      const dataType = unified.privacy.dataType;
      const duration = unified.privacy.duration || 365 * 24 * 60 * 60;
      if (!originalDataHash || !token || !encryptionKeyHash || !dataType || !duration) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters in unified JSON'
        });
      }
      const result = await blockchainService.tokenizeData(
        originalDataHash, token, encryptionKeyHash, dataType, duration
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Record compliance endpoint
  app.post('/api/blockchain/record-compliance', async (req, res) => {
    try {
      console.log('Record Compliance Endpoint: contracts:', blockchainService.contracts);
      const unified = req.body;
      if (!unified.user || !unified.privacy || !unified.compliance) {
        return res.status(400).json({
          success: false,
          error: 'Missing required sections in unified JSON format'
        });
      }
      const userAddress = unified.user.userAddress;
      const regulation = unified.privacy.regulation;
      const complianceType = unified.compliance.complianceType;
      const isCompliant = unified.compliance.isCompliant;
      const details = unified.compliance.details;
      const region = unified.privacy.region;
      const duration = unified.privacy.duration || 365 * 24 * 60 * 60;
      if (!userAddress || !regulation || !complianceType || !region || !duration) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters in unified JSON'
        });
      }
      const result = await blockchainService.recordCompliance(
        userAddress, regulation, complianceType, isCompliant, details, region, duration
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get contract events endpoint
  app.get('/api/blockchain/events/:contractName/:eventName', async (req, res) => {
    try {
      const { contractName, eventName } = req.params;
      const { fromBlock = 0 } = req.query;

      const events = await blockchainService.getContractEvents(contractName, eventName, parseInt(fromBlock));

      res.json({
        success: true,
        contractName,
        eventName,
        events,
        count: events.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Complete data processing workflow
  app.post('/api/blockchain/process-data', async (req, res) => {
    try {
      // Debug log for contracts object
      console.log('Process Data Endpoint: contracts:', blockchainService.contracts);
      const unified = req.body;

      // Validate presence of required top-level fields
      if (!unified.user || !unified.data || !unified.privacy || !unified.blockchain || !unified.compliance) {
        return res.status(400).json({
          success: false,
          error: 'Missing required sections in unified JSON format'
        });
      }

      // Extract values from unified JSON
      const userAddress = unified.user.userAddress;
      const data = unified.data;
      const regulation = unified.privacy.regulation;
      const region = unified.privacy.region;
      const useCase = unified.privacy.useCase;
      const thirdPartyId = unified.privacy.thirdPartyId;
      const dataType = unified.privacy.dataType;
      const duration = unified.privacy.duration || 365 * 24 * 60 * 60; // fallback to 1 year

      // Step 1: Generate data hash (or use provided)
      let dataHash = unified.blockchain.dataHash;
      if (!dataHash || dataHash === '0xauto_generated' || dataHash === '0x' + 'auto_generated') {
        dataHash = '0x' + Buffer.from(JSON.stringify(data)).toString('hex').substr(0, 64);
      }

      // Step 2: Tokenize data
      const token = unified.blockchain.token && unified.blockchain.token !== '0xtokenauto_generated'
        ? unified.blockchain.token
        : '0xtoken' + Date.now();
      const encryptionKeyHash = unified.blockchain.encryptionKeyHash && unified.blockchain.encryptionKeyHash !== '0xkeyauto_generated'
        ? unified.blockchain.encryptionKeyHash
        : '0xkey' + Date.now();
      const tokenizationResult = await blockchainService.tokenizeData(
        dataHash, token, encryptionKeyHash, dataType, duration
      );

      // Step 3: Grant consent
      const consentResult = await blockchainService.grantConsent(
        dataHash, useCase, thirdPartyId, dataType, duration
      );

      // Step 4: Record compliance
      const complianceResult = await blockchainService.recordCompliance(
        userAddress, regulation, 'data_processing', true, 
        'Data processed with privacy protection', region, duration
      );

      res.json({
        success: true,
        workflow: {
          dataHash,
          tokenization: tokenizationResult,
          consent: consentResult,
          compliance: complianceResult
        },
        message: 'Data processing workflow completed successfully'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Test endpoint for AI engine integration
  app.get('/api/ai/status', (req, res) => {
    res.json({
      status: 'connected',
      models: ['differential-privacy', 'anomaly-detection', 'data-minimization'],
      version: '1.0.0'
    });
  });

  // Test endpoint for Java backend integration
  app.get('/api/java/status', (req, res) => {
    res.json({
      status: 'connected',
      services: ['authentication', 'digilocker', 'encryption'],
      version: '1.0.0'
    });
  });

  // File upload endpoint (user uploads file, backend uploads to IPFS, stores in MongoDB, registers in smart contract)
  app.post('/api/files/upload', upload.single('file'), async (req, res) => {
    try {
      console.log('Received upload request');
      if (!gfs) {
        return res.status(503).json({ success: false, error: 'File storage not initialized. Please try again in a moment.' });
      }
      // 1. Store file in MongoDB GridFS
      const file = req.file;
      const { owner } = req.body;
      if (!owner) return res.status(400).json({ success: false, error: 'Missing owner address' });
      if (!file) return res.status(400).json({ success: false, error: 'No file uploaded' });

      const readStream = fs.createReadStream(file.path);
      const uploadStream = gfs.openUploadStream(file.originalname, {
        contentType: file.mimetype,
        metadata: { owner }
      });
      readStream.pipe(uploadStream)
        .on('error', (err) => {
          fs.unlinkSync(file.path);
          return res.status(500).json({ success: false, error: err.message });
        })
        .on('finish', async (uploadedFile) => {
          fs.unlinkSync(file.path);
          // Store metadata in FileModel for quick lookup
          const fileDoc = await FileModel.create({
            owner,
            fileName: file.originalname,
            gridFsId: uploadedFile._id,
            uploadDate: new Date()
          });
          res.json({ success: true, file: fileDoc });
        });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message, stack: err.stack });
    }
  });

  // Authorize a third party for a file (per-file access control)
  app.post('/api/files/:cid/authorize', async (req, res) => {
    try {
      const { cid } = req.params;
      const { owner, thirdParty } = req.body;
      if (!owner || !thirdParty) return res.status(400).json({ success: false, error: 'Missing owner or thirdParty address' });

      // Optionally, check that the owner matches the file owner in DB
      const fileDoc = await FileModel.findOne({ ipfsCid: cid });
      if (!fileDoc) return res.status(404).json({ success: false, error: 'File not found' });
      if (fileDoc.owner.toLowerCase() !== owner.toLowerCase()) {
        return res.status(403).json({ success: false, error: 'Only the file owner can authorize third parties' });
      }

      // Call smart contract to authorize third party for this file
      const authResult = await blockchainService.authorizeThirdPartyForFile(cid, thirdParty);

      // Optionally, update MongoDB for quick lookup (not required for on-chain enforcement)
      if (authResult.success) {
        await FileModel.updateOne({ ipfsCid: cid }, { $addToSet: { authorizedParties: thirdParty } });
      }

      res.json(authResult);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // File access endpoint for third parties (checks per-file smart contract authorization)
  app.get('/api/files/:cid', async (req, res) => {
    try {
      const { cid } = req.params;
      const { requester } = req.query; // wallet address of third party

      if (!requester) return res.status(400).json({ success: false, error: 'Missing requester address' });

      // 1. Find file in DB
      const fileDoc = await FileModel.findOne({ ipfsCid: cid });
      if (!fileDoc) return res.status(404).json({ success: false, error: 'File not found' });

      // 2. Check per-file authorization via smart contract
      let isAuthorized = false;
      if (requester.toLowerCase() === fileDoc.owner.toLowerCase()) {
        isAuthorized = true;
      } else {
        isAuthorized = await blockchainService.isAuthorizedForFile(cid, requester);
      }
      if (!isAuthorized) return res.status(403).json({ success: false, error: 'Not authorized' });

      // 3. Return file metadata and IPFS link
      res.json({
        success: true,
        file: {
          fileName: fileDoc.fileName,
          owner: fileDoc.owner,
          ipfsCid: fileDoc.ipfsCid,
          ipfsUrl: `https://ipfs.io/ipfs/${fileDoc.ipfsCid}`,
          uploadDate: fileDoc.uploadDate
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // List all files for a user
  app.get('/api/files/user/:owner', async (req, res) => {
    try {
      const files = await FileModel.find({ owner: req.params.owner });
      res.json({ success: true, files });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Third Party Registration
  app.post('/api/third-party/register', async (req, res) => {
    try {
      const { thirdPartyId, name } = req.body;
      if (!thirdPartyId || !name) {
        return res.status(400).json({ success: false, error: 'Missing thirdPartyId or name' });
      }
      // Generate API key
      const apiKey = crypto.randomBytes(24).toString('hex');
      const apiKeyHash = await bcrypt.hash(apiKey, 10);
      const thirdParty = new ThirdParty({ thirdPartyId, name, apiKeyHash });
      await thirdParty.save();
      res.json({ success: true, thirdPartyId, apiKey });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Third Party Webhook Subscription
  app.post('/api/third-party/subscribe', authenticateThirdParty, async (req, res) => {
    try {
      const { webhookUrl, events } = req.body;
      const thirdPartyId = req.thirdParty.thirdPartyId;
      if (!webhookUrl || !Array.isArray(events)) {
        return res.status(400).json({ success: false, error: 'Missing webhookUrl or events' });
      }
      // Upsert subscription
      await WebhookSubscription.findOneAndUpdate(
        { thirdPartyId },
        { webhookUrl, events },
        { upsert: true, new: true }
      );
      // Also update on ThirdParty model for convenience
      await ThirdParty.updateOne({ thirdPartyId }, { webhookUrl, events });
      res.json({ success: true, thirdPartyId, webhookUrl, events });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Token-based Data Access Endpoint
  app.post('/api/third-party/request-data', authenticateThirdParty, async (req, res) => {
    try {
      const { dataHash, token, purpose } = req.body;
      const thirdPartyId = req.thirdParty.thirdPartyId;
      // TODO: Implement your own logic to validate token, consent, and retrieve processed data
      // For demo, assume data is stored in a collection ProcessedData
      const ProcessedData = mongoose.model('ProcessedData', new mongoose.Schema({
        dataHash: String, token: String, thirdPartyId: String, data: Object, purpose: String, expiry: Date
      }));
      const record = await ProcessedData.findOne({ dataHash, token, thirdPartyId, purpose });
      if (!record) {
        await AuditLog.create({ eventType: 'data_access_denied', thirdPartyId, dataHash, token, details: { reason: 'Not found or unauthorized' } });
        return res.status(403).json({ success: false, error: 'Not authorized or data not found' });
      }
      // Check expiry
      if (record.expiry && record.expiry < new Date()) {
        await AuditLog.create({ eventType: 'data_access_denied', thirdPartyId, dataHash, token, details: { reason: 'Token expired' } });
        return res.status(403).json({ success: false, error: 'Token expired' });
      }
      await AuditLog.create({ eventType: 'data_access', thirdPartyId, dataHash, token, details: { purpose } });
      res.json({ success: true, data: record.data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Polling Endpoint for Available Data
  app.get('/api/third-party/available-data', authenticateThirdParty, async (req, res) => {
    try {
      const thirdPartyId = req.thirdParty.thirdPartyId;
      const ProcessedData = mongoose.model('ProcessedData');
      const available = await ProcessedData.find({ thirdPartyId, expiry: { $gt: new Date() } }, { dataHash: 1, token: 1, purpose: 1, _id: 0 });
      res.json({ success: true, available });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Webhook Notification Logic (to be called when data is processed/consent granted)
  async function notifyThirdParty(thirdPartyId, event, payload) {
    try {
      const sub = await WebhookSubscription.findOne({ thirdPartyId });
      if (sub && sub.events.includes(event)) {
        await axios.post(sub.webhookUrl, { event, ...payload });
      }
    } catch (err) {
      // Log but do not throw
      await AuditLog.create({ eventType: 'webhook_failed', thirdPartyId, details: { error: err.message, event, payload } });
    }
  }

  // Example: Call notifyThirdParty after consent is granted in /api/blockchain/grant-consent
  // (Insert this after res.json(result); in that endpoint)
  // if (result.success) {
  //   await notifyThirdParty(thirdPartyId, 'consent_granted', { dataHash, token: null, useCase: useCase, timestamp: new Date().toISOString() });
  // }

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'FinTrust Node.js Backend with Blockchain Integration is running!',
      wallet: '0x6FEA87B2B06204da691d388163E15E56392DB9A8',
      endpoints: {
        health: '/health',
        blockchain: {
          status: '/api/blockchain/status',
          wallet: '/api/blockchain/wallet',
          token: '/api/blockchain/token/:tokenAddress',
          grantConsent: 'POST /api/blockchain/grant-consent',
          tokenizeData: 'POST /api/blockchain/tokenize-data',
          recordCompliance: 'POST /api/blockchain/record-compliance',
          events: 'GET /api/blockchain/events/:contractName/:eventName',
          processData: 'POST /api/blockchain/process-data'
        },
        ai: '/api/ai/status',
        java: '/api/java/status'
      }
    });
  });

  // Start server only after blockchainService is ready
  app.listen(PORT, () => {
    console.log(`🚀 Node.js Backend with Blockchain Integration running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 Blockchain status: http://localhost:${PORT}/api/blockchain/status`);
    console.log(`🤖 AI Engine status: http://localhost:${PORT}/api/ai/status`);
    console.log(`☕ Java Backend status: http://localhost:${PORT}/api/java/status`);
    console.log(`📝 API Documentation: http://localhost:${PORT}/`);
  });
})(); 