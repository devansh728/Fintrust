
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
const Notification = require('./models/Notification');
const http = require('http');
const socketIo = require('socket.io');

const mongoURI = 'mongodb+srv://yuvraj0121singh:yuvrajsingh2005@cluster0.p3gmjmy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

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

// Define ProcessedData model once
const ProcessedDataSchema = new mongoose.Schema({
  dataHash: String, 
  token: String, 
  thirdPartyId: String, 
  data: Object, 
  purpose: String, 
  expiry: Date,
  requestId: String,
  createdAt: { type: Date, default: Date.now }
});

const ProcessedData = mongoose.model('ProcessedData', ProcessedDataSchema);

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
      const requestId = unified.metadata.requestId;
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

      // Step 5: Store data and send webhook notification
      const expiryDate = new Date(Date.now() + duration * 1000);
      await storeProcessedDataAndNotify(dataHash, token, thirdPartyId, data, useCase, expiryDate, requestId, userAddress);

      res.json({
        success: true,
        workflow: {
          dataHash,
          tokenization: tokenizationResult,
          consent: consentResult,
          compliance: complianceResult
        },
        message: 'Data processing workflow completed successfully. Webhook notification sent to third party.'
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

  // Enhanced Third Party Registration (with webhook URL required)
  app.post('/api/third-party/register', async (req, res) => {
    try {
      const { thirdPartyId, name, webhookUrl, events } = req.body;
      if (!thirdPartyId || !name || !webhookUrl) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: thirdPartyId, name, webhookUrl' 
        });
      }
      
      // Validate webhook URL format
      try {
        new URL(webhookUrl);
      } catch (e) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid webhook URL format' 
        });
      }
      
      // Check if third party already exists
      const existingThirdParty = await ThirdParty.findOne({ thirdPartyId });
      if (existingThirdParty) {
        return res.status(409).json({ success: false, error: 'Third party already exists' });
      }
      
      // Generate unique API key for data access
      const apiKey = 'tp_' + crypto.randomBytes(32).toString('hex');
      const apiKeyHash = await bcrypt.hash(apiKey, 12);
      
      // Create third party with webhook subscription
      const thirdParty = new ThirdParty({ 
        thirdPartyId, 
        name, 
        apiKeyHash,
        webhookUrl: webhookUrl,
        events: events || ['data_ready', 'consent_granted']
      });
      await thirdParty.save();
      
      // Create webhook subscription
      await WebhookSubscription.findOneAndUpdate(
        { thirdPartyId },
        { webhookUrl, events: events || ['data_ready', 'consent_granted'] },
        { upsert: true, new: true }
      );
      
      console.log(`✅ Third party registered: ${thirdPartyId} with webhook URL: ${webhookUrl}`);
      res.json({ 
        success: true, 
        thirdPartyId, 
        name,
        apiKey,
        webhookUrl,
        events: events || ['data_ready', 'consent_granted'],
        message: 'Third party registered successfully. You will receive webhook notifications at your URL. Keep your API key secure for data access!'
      });
    } catch (error) {
      console.error('❌ Third party registration error:', error);
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

  // Enhanced Token-based Data Access Endpoint
  app.post('/api/third-party/request-data', authenticateThirdParty, async (req, res) => {
    try {
      const { dataHash, token, purpose } = req.body;
      const thirdPartyId = req.thirdParty.thirdPartyId;
      
      if (!dataHash || !token || !purpose) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: dataHash, token, purpose' 
        });
      }
      
      // Find the data record
      const record = await ProcessedData.findOne({ 
        dataHash, 
        token, 
        thirdPartyId, 
        purpose 
      });
      
      if (!record) {
        await AuditLog.create({ 
          eventType: 'data_access_denied', 
          thirdPartyId, 
          dataHash, 
          token, 
          details: { reason: 'Not found or unauthorized', purpose } 
        });
        return res.status(403).json({ 
          success: false, 
          error: 'Data not found or unauthorized for this purpose' 
        });
      }
      
      // Check expiry
      if (record.expiry && record.expiry < new Date()) {
        await AuditLog.create({ 
          eventType: 'data_access_denied', 
          thirdPartyId, 
          dataHash, 
          token, 
          details: { reason: 'Token expired', purpose } 
        });
        return res.status(403).json({ 
          success: false, 
          error: 'Access token has expired' 
        });
      }
      
      // Log successful access
      await AuditLog.create({ 
        eventType: 'data_access', 
        thirdPartyId, 
        dataHash, 
        token, 
        details: { purpose, timestamp: new Date().toISOString() } 
      });
      
      console.log(`✅ Data accessed by ${thirdPartyId} for purpose: ${purpose}`);
      
      res.json({ 
        success: true, 
        data: record.data,
        metadata: {
          dataHash: record.dataHash,
          token: record.token,
          purpose: record.purpose,
          createdAt: record.createdAt,
          expiresAt: record.expiry,
          accessedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Data access error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Enhanced Polling Endpoint for Available Data
  app.get('/api/third-party/available-data', authenticateThirdParty, async (req, res) => {
    try {
      const thirdPartyId = req.thirdParty.thirdPartyId;
      const available = await ProcessedData.find(
        { thirdPartyId, expiry: { $gt: new Date() } }, 
        { dataHash: 1, token: 1, purpose: 1, createdAt: 1, expiry: 1, _id: 0 }
      );
      
      console.log(`📋 Available data for ${thirdPartyId}: ${available.length} records`);
      res.json({ 
        success: true, 
        available,
        count: available.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error fetching available data:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // New: Process Data and Send Webhook Notification
  app.post('/api/process-data-and-notify', async (req, res) => {
    try {
      const { dataHash, token, thirdPartyId, data, purpose, expiry } = req.body;
      
      if (!dataHash || !token || !thirdPartyId || !data || !purpose) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: dataHash, token, thirdPartyId, data, purpose'
        });
      }
      
      // Set default expiry to 1 year if not provided
      const expiryDate = expiry ? new Date(expiry) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      
      // Store data and send notification
      await storeProcessedDataAndNotify(dataHash, token, thirdPartyId, data, purpose, expiryDate);
      
      console.log(`✅ Data processed and notification sent to ${thirdPartyId}`);
      res.json({
        success: true,
        message: 'Data processed and notification sent successfully',
        dataHash,
        thirdPartyId,
        purpose,
        expiry: expiryDate.toISOString()
      });
      
    } catch (error) {
      console.error('❌ Error processing data and sending notification:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // New: Get Third Party Info
  app.get('/api/third-party/info', authenticateThirdParty, async (req, res) => {
    try {
      const thirdPartyId = req.thirdParty.thirdPartyId;
      const thirdParty = await ThirdParty.findOne({ thirdPartyId });
      
      if (!thirdParty) {
        return res.status(404).json({ success: false, error: 'Third party not found' });
      }
      
      res.json({
        success: true,
        thirdParty: {
          thirdPartyId: thirdParty.thirdPartyId,
          name: thirdParty.name,
          webhookUrl: thirdParty.webhookUrl,
          events: thirdParty.events,
          createdAt: thirdParty.createdAt
        }
      });
    } catch (error) {
      console.error('❌ Error fetching third party info:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // New: Retrieve Hashes using Access Key
  app.post('/api/third-party/retrieve-hashes', async (req, res) => {
    try {
      const { accessKey, thirdPartyId, requestId } = req.body;

      if (!accessKey || !thirdPartyId || !requestId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: accessKey, thirdPartyId, requestId'
        });
      }
      
      // Find third party and validate access key
      const thirdParty = await ThirdParty.findOne({ thirdPartyId, requestId });
      if (!thirdParty) {
        return res.status(404).json({
          success: false,
          error: 'Third party not found'
        });
      }
      
      // Validate access key
      const isValidKey = await bcrypt.compare(accessKey, thirdParty.apiKeyHash);
      if (!isValidKey) {
        await AuditLog.create({
          eventType: 'hash_retrieval_failed',
          thirdPartyId,
          details: { reason: 'Invalid access key', timestamp: new Date().toISOString() }
        });
        return res.status(401).json({
          success: false,
          error: 'Invalid access key'
        });
      }
      
      // Get available data hashes for this third party
      const availableData = await ProcessedData.find(
        { 
          thirdPartyId, 
          requestId,
          expiry: { $gt: new Date() } 
        },
        { 
          dataHash: 1, 
          token: 1, 
          purpose: 1, 
          createdAt: 1, 
          expiry: 1, 
          _id: 0 
        }
      );
      
      // Log successful hash retrieval
      await AuditLog.create({
        eventType: 'hash_retrieval_success',
        thirdPartyId,
        details: { 
          hashesCount: availableData.length, 
          timestamp: new Date().toISOString() 
        }
      });
      
      console.log(`✅ Hashes retrieved for ${thirdPartyId}: ${availableData.length} records`);
      
      res.json({
        success: true,
        thirdPartyId,
        thirdPartyName: thirdParty.name,
        availableHashes: availableData,
        requestId: requestId,
        count: availableData.length,
        timestamp: new Date().toISOString(),
        message: 'Use these hashes with the data access endpoint to retrieve actual data'
      });
      
    } catch (error) {
      console.error('❌ Error retrieving hashes:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // New: Test Webhook URL
  app.post('/api/third-party/test-webhook', authenticateThirdParty, async (req, res) => {
    try {
      const thirdPartyId = req.thirdParty.thirdPartyId;
      const thirdParty = await ThirdParty.findOne({ thirdPartyId });
      
      if (!thirdParty || !thirdParty.webhookUrl) {
        return res.status(404).json({ success: false, error: 'Webhook URL not found' });
      }
      
      // Send test webhook
      const testPayload = {
        event: 'webhook_test',
        thirdPartyId,
        timestamp: new Date().toISOString(),
        message: 'This is a test webhook to verify your endpoint is working',
        data: {
          test: true,
          thirdPartyName: thirdParty.name
        }
      };
      
      await notifyThirdParty(thirdPartyId, 'webhook_test', testPayload);
      
      res.json({
        success: true,
        message: 'Test webhook sent successfully',
        webhookUrl: thirdParty.webhookUrl,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error testing webhook:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- Development-only demo webhook endpoint ---
  app.post('/tpp/demo-webhook-url', (req, res) => {
    const event = req.body && req.body.event;
    if (event) {
      console.log('Demo webhook received event:', event);
      return res.status(200).json({ success: true, message: 'Webhook received', event });
    } else {
      return res.status(400).json({ success: false, error: 'Missing event in body' });
    }
  });

  // Enhanced Webhook Notification Logic
  async function notifyThirdParty(thirdPartyId, event, payload) {
    try {
      const sub = await WebhookSubscription.findOne({ thirdPartyId });
      if (sub && sub.events.includes(event)) {
        // Only event info, no hashes/tokens
        const webhookPayload = {
          event,
          thirdPartyId,
          timestamp: new Date().toISOString(),
          ...payload
        };
        
        console.log(`📡 Sending webhook to ${thirdPartyId} for event ${event}`);
        const response = await axios.post(sub.webhookUrl, webhookPayload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Event': event,
            'X-Third-Party-ID': thirdPartyId,
            'X-Request-ID': payload.requestId,
            'X-Timestamp': new Date().toISOString()
          },
          timeout: 10000
        });
        
        console.log(`✅ Webhook sent successfully to ${thirdPartyId}`);
        await AuditLog.create({ 
          eventType: 'webhook_sent', 
          thirdPartyId, 
          details: { event, status: response.status, timestamp: new Date().toISOString() } 
        });
      }
    } catch (err) {
      console.error(`❌ Webhook failed for ${thirdPartyId}:`, err.message);
      await AuditLog.create({ 
        eventType: 'webhook_failed', 
        thirdPartyId, 
        details: { error: err.message, event, payload, timestamp: new Date().toISOString() } 
      });
    }
  }

  // Enhanced Data Storage and Notification
  async function storeProcessedDataAndNotify(dataHash, token, thirdPartyId, data, purpose, expiry, requestId, userId) {
    try {
      // Store processed data
      await ProcessedData.findOneAndUpdate(
        { dataHash, thirdPartyId , requestId},
        { token, data, purpose, expiry },
        { upsert: true, new: true }
      );

      // --- Store event-only notification (no hashes/tokens) ---
      const notification = await Notification.create({
        eventType: 'data_ready',
        requestId,
        thirdPartyId,
        userId,
        message: 'Data is ready for access. Use your access key to retrieve hashes.',
      });

      // --- Notify third party with event info only (no hashes/tokens) ---
      await notifyThirdParty(thirdPartyId, 'data_ready', {
        requestId,
        userId,
        message: 'Data is ready for access. Use your access key to retrieve hashes.'
      });

      // --- Emit websocket notification ---
      emitNotificationToTPP(thirdPartyId, notification);

      console.log(`✅ Data stored and event-only notification sent to ${thirdPartyId} for request ID: ${requestId}`);
    } catch (error) {
      console.error(`❌ Error storing data for ${thirdPartyId}:`, error.message);
      throw error;
    }
  }


  // API endpoint to add a third party name to authorize-multiple-thirdparties.js
  app.post('/api/third-party/authorize-local', async (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Missing or invalid third party name' });
    }
    const filePath = path.join(__dirname, 'authorize-multiple-thirdparties.js');
    try {
      let fileContent = fs.readFileSync(filePath, 'utf8');
      // Find the thirdParties array
      const arrayRegex = /const thirdParties = (\[[^\]]*\])/m;
      const match = fileContent.match(arrayRegex);
      if (!match) {
        return res.status(500).json({ success: false, error: 'thirdParties array not found in file' });
      }
      let thirdPartiesArr = eval(match[1]);
      if (thirdPartiesArr.includes(name)) {
        return res.json({ success: true, message: 'Third party already exists', name });
      }
      thirdPartiesArr.push(name);
      // Replace the array in the file
      const newArrayStr = JSON.stringify(thirdPartiesArr, null, 2);
      fileContent = fileContent.replace(arrayRegex, `const thirdParties = ${newArrayStr}`);
      fs.writeFileSync(filePath, fileContent, 'utf8');
      res.json({ success: true, message: 'Third party added', name });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'FinTrust Node.js Backend with Blockchain Integration and Webhook Service is running!',
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
        webhook: {
          register: 'POST /api/third-party/register',
          subscribe: 'POST /api/third-party/subscribe',
          testWebhook: 'POST /api/third-party/test-webhook',
          processAndNotify: 'POST /api/process-data-and-notify',
          retrieveHashes: 'POST /api/third-party/retrieve-hashes',
          requestData: 'POST /api/third-party/request-data',
          availableData: 'GET /api/third-party/available-data',
          thirdPartyInfo: 'GET /api/third-party/info'
        },
        ai: '/api/ai/status',
        java: '/api/java/status'
      }
    });
  });

  // --- Notification Retrieval Endpoints ---
  app.get('/api/third-party/notifications', authenticateThirdParty, async (req, res) => {
    const thirdPartyId = req.thirdParty.thirdPartyId;
    const notifications = await Notification.find({ thirdPartyId, read: false }).sort({ timestamp: -1 });
    res.json({ success: true, notifications });
  });

  app.post('/api/third-party/notifications/mark-read', authenticateThirdParty, async (req, res) => {
    const { notificationIds } = req.body;
    await Notification.updateMany({ _id: { $in: notificationIds } }, { $set: { read: true } });
    res.json({ success: true });
  });

  const server = http.createServer(app);
  const io = socketIo(server, { cors: { origin: '*' } });

  // Simple API key authentication for demo (should be improved for production)
  io.use(async (socket, next) => {
    const apiKey = socket.handshake.query.apiKey;
    if (!apiKey) return next(new Error('Authentication error'));
    const ThirdParty = require('./models/ThirdParty');
    const tpp = await ThirdParty.findOne({ /* TODO: match apiKey hash */ });
    if (!tpp) return next(new Error('Authentication error'));
    socket.thirdPartyId = tpp.thirdPartyId;
    next();
  });

  io.on('connection', (socket) => {
    const tppId = socket.thirdPartyId;
    socket.join(tppId);
    // Optionally, send unread notifications on connect
  });

  function emitNotificationToTPP(thirdPartyId, notification) {
    io.to(thirdPartyId).emit('notification', notification);
  }

  // Start server only after blockchainService is ready
  server.listen(PORT, () => {
    console.log(`🚀 Node.js Backend with Blockchain Integration running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 Blockchain status: http://localhost:${PORT}/api/blockchain/status`);
    console.log(`🤖 AI Engine status: http://localhost:${PORT}/api/ai/status`);
    console.log(`☕ Java Backend status: http://localhost:${PORT}/api/java/status`);
    console.log(`📝 API Documentation: http://localhost:${PORT}/`);
    console.log(`🔔 Websocket server running for notifications`);
  });
})(); 