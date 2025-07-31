#!/usr/bin/env node

const { spawn } = require('child_process');
const { execSync } = require('child_process');

console.log('🌐 Starting SSPMS with Network Access...\n');

// Get network IP
try {
  const ipConfig = execSync('ipconfig', { encoding: 'utf8' });
  const ipMatch = ipConfig.match(/IPv4 Address[.\s]*:\s*(\d+\.\d+\.\d+\.\d+)/);
  const networkIP = ipMatch ? ipMatch[1] : '192.168.36.46';
  
  console.log(`📍 Network IP: ${networkIP}`);
  console.log(`🌐 Frontend will be available at: http://${networkIP}:5173`);
  console.log(`🔌 Backend will be available at: http://${networkIP}:5000`);
  console.log('');
} catch (error) {
  console.log('⚠️ Could not detect IP, using configured IP: 192.168.36.46\n');
}

// Start backend server
console.log('🚀 Starting backend server...');
const backendProcess = spawn('npm', ['run', 'dev'], {
  cwd: 'backend',
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

backendProcess.stdout.on('data', (data) => {
  console.log(`[Backend] ${data.toString().trim()}`);
});

backendProcess.stderr.on('data', (data) => {
  console.log(`[Backend Error] ${data.toString().trim()}`);
});

// Wait a moment for backend to start
setTimeout(() => {
  console.log('\n🖥️ Starting frontend server...');
  
  // Start frontend server
  const frontendProcess = spawn('npm', ['run', 'dev:network'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  });

  frontendProcess.stdout.on('data', (data) => {
    console.log(`[Frontend] ${data.toString().trim()}`);
  });

  frontendProcess.stderr.on('data', (data) => {
    console.log(`[Frontend Error] ${data.toString().trim()}`);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backendProcess.kill('SIGINT');
    frontendProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down servers...');
    backendProcess.kill('SIGTERM');
    frontendProcess.kill('SIGTERM');
    process.exit(0);
  });

}, 2000);

console.log('\n📱 Access from other devices:');
console.log('   1. Connect device to same WiFi network');
console.log('   2. Open browser and go to: http://192.168.36.46:5173');
console.log('   3. All devices will share the same database!\n');
console.log('💡 Press Ctrl+C to stop both servers\n'); 