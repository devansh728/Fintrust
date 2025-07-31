const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const ThirdParty = require('./models/ThirdParty');
const AuditLog = require('./models/AuditLog');

class ApiKeyManager {
  /**
   * Generate a new API key for a third party
   * @param {string} thirdPartyId - The third party identifier
   * @param {string} name - The third party name
   * @returns {Object} - Object containing apiKey and apiKeyHash
   */
  static async generateApiKey(thirdPartyId, name) {
    try {
      // Generate a secure API key (48 characters)
      const apiKey = crypto.randomBytes(24).toString('hex');
      const apiKeyHash = await bcrypt.hash(apiKey, 12); // Higher salt rounds for security
      
      return {
        apiKey,
        apiKeyHash,
        thirdPartyId,
        name
      };
    } catch (error) {
      throw new Error(`Failed to generate API key: ${error.message}`);
    }
  }

  /**
   * Register a new third party with API key
   * @param {string} thirdPartyId - The third party identifier
   * @param {string} name - The third party name
   * @param {string} description - Optional description
   * @param {Array} permissions - Optional permissions array
   * @returns {Object} - Registration result with API key
   */
  static async registerThirdParty(thirdPartyId, name, description = '', permissions = []) {
    try {
      // Check if third party already exists
      const existing = await ThirdParty.findOne({ thirdPartyId });
      if (existing) {
        throw new Error('Third party already exists');
      }

      // Generate API key
      const { apiKey, apiKeyHash } = await this.generateApiKey(thirdPartyId, name);

      // Create third party record
      const thirdParty = new ThirdParty({
        thirdPartyId,
        name,
        apiKeyHash,
        description,
        permissions,
        status: 'active',
        createdAt: new Date()
      });

      await thirdParty.save();

      // Log the registration
      await AuditLog.create({
        eventType: 'third_party_registered',
        thirdPartyId,
        details: {
          name,
          description,
          permissions,
          apiKeyGenerated: true
        }
      });

      return {
        success: true,
        thirdPartyId,
        name,
        apiKey, // Only returned once during registration
        description,
        permissions,
        message: 'Third party registered successfully. Please save your API key securely.'
      };
    } catch (error) {
      throw new Error(`Failed to register third party: ${error.message}`);
    }
  }

  /**
   * Regenerate API key for existing third party
   * @param {string} thirdPartyId - The third party identifier
   * @param {string} currentApiKey - Current API key for verification
   * @returns {Object} - New API key
   */
  static async regenerateApiKey(thirdPartyId, currentApiKey) {
    try {
      // Find and verify third party
      const thirdParty = await ThirdParty.findOne({ thirdPartyId });
      if (!thirdParty) {
        throw new Error('Third party not found');
      }

      // Verify current API key
      const isValid = await bcrypt.compare(currentApiKey, thirdParty.apiKeyHash);
      if (!isValid) {
        throw new Error('Invalid current API key');
      }

      // Generate new API key
      const { apiKey, apiKeyHash } = await this.generateApiKey(thirdPartyId, thirdParty.name);

      // Update the third party
      thirdParty.apiKeyHash = apiKeyHash;
      thirdParty.updatedAt = new Date();
      await thirdParty.save();

      // Log the regeneration
      await AuditLog.create({
        eventType: 'api_key_regenerated',
        thirdPartyId,
        details: {
          reason: 'manual_regeneration',
          timestamp: new Date()
        }
      });

      return {
        success: true,
        thirdPartyId,
        apiKey, // New API key
        message: 'API key regenerated successfully. Please update your applications with the new key.'
      };
    } catch (error) {
      throw new Error(`Failed to regenerate API key: ${error.message}`);
    }
  }

  /**
   * Validate API key
   * @param {string} apiKey - The API key to validate
   * @returns {Object} - Validation result with third party info
   */
  static async validateApiKey(apiKey) {
    try {
      const thirdParties = await ThirdParty.find({ status: 'active' });
      
      for (const thirdParty of thirdParties) {
        const isValid = await bcrypt.compare(apiKey, thirdParty.apiKeyHash);
        if (isValid) {
          return {
            valid: true,
            thirdParty: {
              thirdPartyId: thirdParty.thirdPartyId,
              name: thirdParty.name,
              permissions: thirdParty.permissions,
              status: thirdParty.status
            }
          };
        }
      }

      return { valid: false, reason: 'Invalid API key' };
    } catch (error) {
      throw new Error(`Failed to validate API key: ${error.message}`);
    }
  }

  /**
   * Get third party information (without sensitive data)
   * @param {string} thirdPartyId - The third party identifier
   * @returns {Object} - Third party information
   */
  static async getThirdPartyInfo(thirdPartyId) {
    try {
      const thirdParty = await ThirdParty.findOne({ thirdPartyId });
      if (!thirdParty) {
        throw new Error('Third party not found');
      }

      return {
        thirdPartyId: thirdParty.thirdPartyId,
        name: thirdParty.name,
        description: thirdParty.description,
        permissions: thirdParty.permissions,
        status: thirdParty.status,
        createdAt: thirdParty.createdAt,
        updatedAt: thirdParty.updatedAt,
        webhookUrl: thirdParty.webhookUrl,
        events: thirdParty.events
      };
    } catch (error) {
      throw new Error(`Failed to get third party info: ${error.message}`);
    }
  }

  /**
   * List all third parties (admin function)
   * @returns {Array} - List of third parties
   */
  static async listThirdParties() {
    try {
      const thirdParties = await ThirdParty.find({}, {
        apiKeyHash: 0 // Exclude sensitive data
      });

      return thirdParties.map(tp => ({
        thirdPartyId: tp.thirdPartyId,
        name: tp.name,
        description: tp.description,
        status: tp.status,
        createdAt: tp.createdAt,
        webhookUrl: tp.webhookUrl,
        events: tp.events
      }));
    } catch (error) {
      throw new Error(`Failed to list third parties: ${error.message}`);
    }
  }

  /**
   * Deactivate a third party
   * @param {string} thirdPartyId - The third party identifier
   * @returns {Object} - Deactivation result
   */
  static async deactivateThirdParty(thirdPartyId) {
    try {
      const thirdParty = await ThirdParty.findOne({ thirdPartyId });
      if (!thirdParty) {
        throw new Error('Third party not found');
      }

      thirdParty.status = 'inactive';
      thirdParty.updatedAt = new Date();
      await thirdParty.save();

      // Log the deactivation
      await AuditLog.create({
        eventType: 'third_party_deactivated',
        thirdPartyId,
        details: {
          reason: 'manual_deactivation',
          timestamp: new Date()
        }
      });

      return {
        success: true,
        thirdPartyId,
        message: 'Third party deactivated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to deactivate third party: ${error.message}`);
    }
  }
}

module.exports = ApiKeyManager; 