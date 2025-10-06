#!/usr/bin/env node

import os from 'os';

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          interface: name,
          address: iface.address
        });
      }
    }
  }

  return addresses;
}

console.log('🌐 Local Network IP Addresses:');
console.log('================================');

const addresses = getLocalIPAddress();

if (addresses.length === 0) {
  console.log('❌ No network interfaces found');
  process.exit(1);
}

addresses.forEach((addr, index) => {
  console.log(`${index + 1}. Interface: ${addr.interface}`);
  console.log(`   IP Address: ${addr.address}`);
  console.log(`   Frontend URL: http://${addr.address}:5173`);
  console.log('');
});

console.log('📱 To access your frontend from other devices:');
console.log('1. Make sure your devices are on the same network');
console.log('2. Use one of the URLs above');
console.log('3. Run: npm run dev:network');
console.log('');
console.log('🔧 Backend Configuration:');
console.log('Make sure your backend is also accessible on the network');
console.log('Update your backend CORS settings if needed');
