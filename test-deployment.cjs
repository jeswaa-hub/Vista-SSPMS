#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing SSPMS Deployment Setup...\n');

// Test 1: Check if all required files exist
console.log('📁 Checking required files...');
const requiredFiles = [
  'package.json',
  'backend/package.json',
  'backend/server.js',
  'vite.config.js',
  'railway.toml',
  'Procfile',
  'env.example'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing!`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please check the deployment guide.');
  process.exit(1);
}

// Test 2: Check package.json scripts
console.log('\n📜 Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['start', 'build:frontend', 'install:backend'];

requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`✅ ${script}: ${packageJson.scripts[script]}`);
  } else {
    console.log(`❌ ${script} - Missing!`);
  }
});

// Test 3: Try building frontend
console.log('\n🏗️  Testing frontend build...');
try {
  console.log('Running: npm run build:frontend');
  execSync('npm run build:frontend', { stdio: 'pipe' });
  
  if (fs.existsSync('dist')) {
    console.log('✅ Frontend build successful - dist/ folder created');
    
    // Check if index.html exists
    if (fs.existsSync('dist/index.html')) {
      console.log('✅ dist/index.html exists');
    } else {
      console.log('❌ dist/index.html missing');
    }
  } else {
    console.log('❌ Frontend build failed - dist/ folder not created');
  }
} catch (error) {
  console.log('❌ Frontend build failed:');
  console.log(error.message);
}

// Test 4: Check backend dependencies
console.log('\n📦 Checking backend dependencies...');
try {
  const backendPackageJson = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  const criticalDeps = ['express', 'mongoose', 'cors', 'dotenv'];
  
  criticalDeps.forEach(dep => {
    if (backendPackageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${backendPackageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - Missing from backend dependencies!`);
    }
  });
} catch (error) {
  console.log('❌ Could not read backend/package.json');
}

// Test 5: Check environment variables template
console.log('\n🔧 Checking environment variables template...');
try {
  const envExample = fs.readFileSync('env.example', 'utf8');
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'NODE_ENV', 'PORT'];
  
  requiredEnvVars.forEach(envVar => {
    if (envExample.includes(envVar)) {
      console.log(`✅ ${envVar} documented`);
    } else {
      console.log(`❌ ${envVar} - Not documented in env.example`);
    }
  });
} catch (error) {
  console.log('❌ Could not read env.example');
}

console.log('\n🎉 Deployment setup test completed!');
console.log('\n📚 Next steps:');
console.log('1. Push your code to GitHub');
console.log('2. Create a Railway project');
console.log('3. Set up MongoDB Atlas');
console.log('4. Configure environment variables in Railway');
console.log('5. Deploy!');
console.log('\nSee RAILWAY_DEPLOYMENT_GUIDE.md for detailed instructions.'); 