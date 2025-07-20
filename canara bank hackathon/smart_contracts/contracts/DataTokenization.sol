// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DataTokenization
 * @dev Smart contract for managing data tokenization and encryption keys
 * 
 * Features:
 * - Token generation for sensitive data
 * - Encryption key management
 * - Token-to-data mapping
 * - Secure key storage
 * - Token validation
 */
contract DataTokenization is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Structs
    struct TokenizedData {
        string originalDataHash;
        string token;
        string encryptionKeyHash;
        uint256 timestamp;
        address owner;
        bool isActive;
        string dataType;
        uint256 expiryTime;
    }

    struct EncryptionKey {
        string keyHash;
        string algorithm;
        uint256 timestamp;
        bool isActive;
        address createdBy;
    }

    // State Variables
    Counters.Counter private _tokenIds;
    Counters.Counter private _keyIds;

    // Mappings
    mapping(uint256 => TokenizedData) public tokenizedData;
    mapping(uint256 => EncryptionKey) public encryptionKeys;
    mapping(string => uint256) public tokenToDataId;
    mapping(address => uint256[]) public userTokens;
    mapping(string => bool) public usedTokens;
    mapping(string => uint256) public hashToTokenId;

    // Events
    event DataTokenized(
        uint256 indexed tokenId,
        address indexed owner,
        string originalDataHash,
        string token,
        string dataType,
        uint256 timestamp
    );

    event TokenRevoked(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 timestamp
    );

    event EncryptionKeyCreated(
        uint256 indexed keyId,
        string keyHash,
        string algorithm,
        address indexed createdBy,
        uint256 timestamp
    );

    event EncryptionKeyRevoked(
        uint256 indexed keyId,
        address indexed revokedBy,
        uint256 timestamp
    );

    event TokenValidated(
        string token,
        bool isValid,
        uint256 timestamp
    );

    // Modifiers
    modifier onlyTokenOwner(uint256 tokenId) {
        require(tokenId > 0 && tokenId <= _tokenIds.current(), "Invalid token ID");
        require(tokenizedData[tokenId].owner == msg.sender, "Not token owner");
        _;
    }

    modifier onlyValidToken(string memory token) {
        require(usedTokens[token], "Token does not exist");
        _;
    }

    // Constructor
    constructor() {
        _tokenIds.increment();
        _keyIds.increment();
    }

    /**
     * @dev Tokenize sensitive data
     * @param originalDataHash Hash of the original data
     * @param token Generated token for the data
     * @param encryptionKeyHash Hash of the encryption key
     * @param dataType Type of data being tokenized
     * @param durationInSeconds How long the token is valid
     */
    function tokenizeData(
        string memory originalDataHash,
        string memory token,
        string memory encryptionKeyHash,
        string memory dataType,
        uint256 durationInSeconds
    ) external nonReentrant {
        require(bytes(originalDataHash).length > 0, "Data hash cannot be empty");
        require(bytes(token).length > 0, "Token cannot be empty");
        require(bytes(encryptionKeyHash).length > 0, "Encryption key hash cannot be empty");
        require(!usedTokens[token], "Token already exists");
        require(durationInSeconds > 0, "Duration must be positive");

        uint256 tokenId = _tokenIds.current();
        
        tokenizedData[tokenId] = TokenizedData({
            originalDataHash: originalDataHash,
            token: token,
            encryptionKeyHash: encryptionKeyHash,
            timestamp: block.timestamp,
            owner: msg.sender,
            isActive: true,
            dataType: dataType,
            expiryTime: block.timestamp + durationInSeconds
        });

        tokenToDataId[token] = tokenId;
        userTokens[msg.sender].push(tokenId);
        usedTokens[token] = true;
        hashToTokenId[originalDataHash] = tokenId;

        _tokenIds.increment();

        emit DataTokenized(
            tokenId,
            msg.sender,
            originalDataHash,
            token,
            dataType,
            block.timestamp
        );
    }

    /**
     * @dev Revoke a token
     * @param tokenId ID of the token to revoke
     */
    function revokeToken(uint256 tokenId) external onlyTokenOwner(tokenId) {
        TokenizedData storage data = tokenizedData[tokenId];
        require(data.isActive, "Token already revoked");
        
        data.isActive = false;
        usedTokens[data.token] = false;

        emit TokenRevoked(
            tokenId,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Create encryption key
     * @param keyHash Hash of the encryption key
     * @param algorithm Encryption algorithm used
     */
    function createEncryptionKey(
        string memory keyHash,
        string memory algorithm
    ) external onlyOwner {
        require(bytes(keyHash).length > 0, "Key hash cannot be empty");
        require(bytes(algorithm).length > 0, "Algorithm cannot be empty");

        uint256 keyId = _keyIds.current();
        
        encryptionKeys[keyId] = EncryptionKey({
            keyHash: keyHash,
            algorithm: algorithm,
            timestamp: block.timestamp,
            isActive: true,
            createdBy: msg.sender
        });

        _keyIds.increment();

        emit EncryptionKeyCreated(
            keyId,
            keyHash,
            algorithm,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Revoke encryption key
     * @param keyId ID of the key to revoke
     */
    function revokeEncryptionKey(uint256 keyId) external onlyOwner {
        require(keyId > 0 && keyId < _keyIds.current(), "Invalid key ID");
        require(encryptionKeys[keyId].isActive, "Key already revoked");
        
        encryptionKeys[keyId].isActive = false;

        emit EncryptionKeyRevoked(
            keyId,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Validate a token
     * @param token Token to validate
     * @return isValid Whether the token is valid
     * @return tokenId ID of the token if valid
     */
    function validateToken(string memory token) external view returns (bool isValid, uint256 tokenId) {
        if (!usedTokens[token]) {
            return (false, 0);
        }

        tokenId = tokenToDataId[token];
        TokenizedData storage data = tokenizedData[tokenId];
        
        isValid = data.isActive && data.expiryTime > block.timestamp;

        return (isValid, tokenId);
    }

    /**
     * @dev Get tokenized data by token
     * @param token Token to look up
     */
    function getTokenizedDataByToken(string memory token) external view onlyValidToken(token) returns (TokenizedData memory) {
        uint256 tokenId = tokenToDataId[token];
        return tokenizedData[tokenId];
    }

    /**
     * @dev Get tokenized data by original hash
     * @param originalDataHash Hash of the original data
     */
    function getTokenizedDataByHash(string memory originalDataHash) external view returns (TokenizedData memory) {
        uint256 tokenId = hashToTokenId[originalDataHash];
        require(tokenId > 0, "No token found for this hash");
        return tokenizedData[tokenId];
    }

    /**
     * @dev Get user's tokens
     * @param userAddress Address of the user
     */
    function getUserTokens(address userAddress) external view returns (uint256[] memory) {
        return userTokens[userAddress];
    }

    /**
     * @dev Get encryption key details
     * @param keyId ID of the encryption key
     */
    function getEncryptionKey(uint256 keyId) external view returns (EncryptionKey memory) {
        require(keyId > 0 && keyId < _keyIds.current(), "Invalid key ID");
        return encryptionKeys[keyId];
    }

    /**
     * @dev Check if token exists and is active
     * @param token Token to check
     */
    function isTokenActive(string memory token) external view returns (bool) {
        if (!usedTokens[token]) {
            return false;
        }
        
        uint256 tokenId = tokenToDataId[token];
        TokenizedData storage data = tokenizedData[tokenId];
        
        return data.isActive && data.expiryTime > block.timestamp;
    }

    /**
     * @dev Get contract statistics
     */
    function getContractStats() external view returns (
        uint256 totalTokens,
        uint256 totalKeys
    ) {
        return (
            _tokenIds.current() - 1,
            _keyIds.current() - 1
        );
    }

    /**
     * @dev Get active tokens count
     */
    function getActiveTokensCount() external view returns (uint256) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i < _tokenIds.current(); i++) {
            if (tokenizedData[i].isActive && tokenizedData[i].expiryTime > block.timestamp) {
                activeCount++;
            }
        }
        return activeCount;
    }
} 