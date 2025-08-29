#!/usr/bin/env node

/**
 * Simple Turnstile Configuration Test
 * Run this to verify your Turnstile setup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Testing Turnstile Configuration...\n');

// Check if turnstile-config.env exists
const configPath = path.join(__dirname, 'turnstile-config.env');
if (!fs.existsSync(configPath)) {
  console.log('❌ turnstile-config.env not found');
  console.log('📝 Please create it with your Turnstile keys');
  process.exit(1);
}

// Check environment variables
const requiredEnvVars = [
  'VITE_TURNSTILE_LOCAL_SITE_KEY',
  'TURNSTILE_LOCAL_SECRET_KEY',
  'VITE_TURNSTILE_PROD_SITE_KEY',
  'TURNSTILE_PROD_SECRET_KEY'
];

console.log('📋 Checking Environment Variables:');
let allGood = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value !== 'your-site-key-here' && value !== 'your-secret-key-here') {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: Not set or using placeholder`);
    allGood = false;
  }
});

console.log('\n📁 Checking Required Files:');
const requiredFiles = [
  'src/components/ui/Turnstile.vue',
  'src/composables/useTurnstile.js',
  'backend/middleware/turnstile.js',
  'backend/routes/turnstile.js'
];

requiredFiles.forEach(filePath => {
  if (fs.existsSync(path.join(__dirname, filePath))) {
    console.log(`✅ ${filePath}`);
  } else {
    console.log(`❌ ${filePath} - Missing`);
    allGood = false;
  }
});

console.log('\n📦 Checking Dependencies:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['@gaviti/vue-turnstile', 'turnstile'];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} - Not installed`);
    allGood = false;
  }
});

console.log('\n🔧 Configuration Summary:');
if (allGood) {
  console.log('🎉 All checks passed! Your Turnstile setup is ready.');
  console.log('\n📝 Next steps:');
  console.log('1. Get your actual Turnstile keys from Cloudflare dashboard');
  console.log('2. Update turnstile-config.env with real keys');
  console.log('3. Test locally with npm run dev');
  console.log('4. Deploy to production');
} else {
  console.log('⚠️  Some issues found. Please fix them before proceeding.');
  console.log('\n📚 See TURNSTILE_SETUP.md for detailed instructions.');
}

console.log('\n🔗 Useful Links:');
console.log('- Cloudflare Turnstile Dashboard: https://dash.cloudflare.com/?to=/:account/turnstile');
console.log('- Turnstile Documentation: https://developers.cloudflare.com/turnstile/');
console.log('- Setup Guide: TURNSTILE_SETUP.md');
