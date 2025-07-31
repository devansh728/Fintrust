const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://yuvraj0121singh:yuvrajsingh2005@cluster0.p3gmjmy.mongodb.net/mydb?retryWrites=true&w=majority&appName=Cluster0';

console.log('🔌 Testing MongoDB Connection...');
console.log('📡 Connection String:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  ssl: true,
  sslValidate: false,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  retryWrites: true,
  w: 'majority'
}).then(() => {
  console.log('✅ MongoDB connection successful!');
  console.log('📊 Database:', mongoose.connection.db.databaseName);
  console.log('🔗 Host:', mongoose.connection.host);
  console.log('🚪 Port:', mongoose.connection.port);
  
  // Test a simple operation
  return mongoose.connection.db.admin().ping();
}).then(() => {
  console.log('🏓 Ping successful - MongoDB is responsive');
  process.exit(0);
}).catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  console.error('🔍 Error details:', err);
  process.exit(1);
}); 