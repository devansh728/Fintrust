const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testBlockchainConnection() {
  console.log('🔗 Testing Blockchain Connection...\n');
  
  try {
    // Test health endpoint
    console.log('📊 Step 1: Testing Health Endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health:', healthResponse.data);
    
    // Test blockchain status
    console.log('\n🔗 Step 2: Testing Blockchain Status...');
    const statusResponse = await axios.get(`${BASE_URL}/api/blockchain/status`);
    console.log('✅ Blockchain Status:', JSON.stringify(statusResponse.data, null, 2));
    
    // Test AI status
    console.log('\n🤖 Step 3: Testing AI Integration...');
    const aiResponse = await axios.get(`${BASE_URL}/api/ai/status`);
    console.log('✅ AI Status:', aiResponse.data);
    
    console.log('\n🎉 All blockchain tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testBlockchainConnection(); 