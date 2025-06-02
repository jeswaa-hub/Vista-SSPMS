#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting SSPMS in Production Mode...\n');

// Set environment variables for testing
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

// Check if dist folder exists
if (!fs.existsSync('dist')) {
  console.log('📦 Building frontend first...');
  try {
    execSync('npm run build:frontend', { stdio: 'inherit' });
    console.log('✅ Frontend build completed\n');
  } catch (error) {
    console.error('❌ Frontend build failed:', error.message);
    process.exit(1);
  }
}

// Check if backend dependencies are installed
if (!fs.existsSync('backend/node_modules')) {
  console.log('📦 Installing backend dependencies...');
  try {
    execSync('npm run install:backend', { stdio: 'inherit' });
    console.log('✅ Backend dependencies installed\n');
  } catch (error) {
    console.error('❌ Backend dependency installation failed:', error.message);
    process.exit(1);
  }
}

console.log('🔧 Environment Variables:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   PORT: ${process.env.PORT}`);
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? 'configured' : 'NOT SET'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'configured' : 'NOT SET'}`);
console.log('');

if (!process.env.MONGODB_URI) {
  console.log('⚠️  Warning: MONGODB_URI not set. Server may fail to start.');
  console.log('   Create a .env file in the backend directory with your MongoDB connection string.');
  console.log('');
}

if (!process.env.JWT_SECRET) {
  console.log('⚠️  Warning: JWT_SECRET not set. Authentication may not work.');
  console.log('   Create a .env file in the backend directory with a secure JWT secret.');
  console.log('');
}

console.log('🎯 Starting server...');
console.log(`📊 Health check will be available at: http://localhost:${process.env.PORT}/api/health`);
console.log(`🌐 Application will be available at: http://localhost:${process.env.PORT}`);
console.log('');

// Start the server
try {
  const serverProcess = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill('SIGTERM');
    process.exit(0);
  });

  serverProcess.on('exit', (code) => {
    console.log(`\n📤 Server exited with code: ${code}`);
    process.exit(code);
  });

} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
} 