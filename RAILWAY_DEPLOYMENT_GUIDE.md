# 🚀 Railway Deployment Guide for SSPMS

This guide walks you through deploying your SSPMS (Student Support Portal Management System) to Railway.

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **MongoDB Atlas**: Set up a MongoDB cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
3. **GitHub Repository**: Your project should be in a GitHub repository
4. **Node.js 18+**: Ensure your project uses Node.js 18 or higher

## 🗂️ Project Structure Changes Made

### 1. **Updated `package.json`**
- Added deployment scripts
- Added start script that points to backend
- Added build process for frontend

### 2. **Updated `backend/server.js`**
- Added static file serving for production
- Added SPA routing support
- Updated CORS configuration for production
- Added proper health check endpoint

### 3. **Updated `vite.config.js`**
- Added API proxy for development
- Optimized build configuration
- Added chunk splitting for better performance

### 4. **Created Railway Configuration**
- `railway.toml`: Railway-specific configuration
- `Procfile`: Alternative process configuration
- `env.example`: Environment variables template

## 🚀 Deployment Steps

### Step 1: Prepare MongoDB Atlas Database

1. **Create MongoDB Atlas Cluster**:
   - Go to [MongoDB Atlas](https://mongodb.com/cloud/atlas)
   - Create a new cluster (free tier is fine for testing)
   - Create a database user with read/write permissions
   - Add your IP address to IP whitelist (or use 0.0.0.0/0 for Railway)

2. **Get Connection String**:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
   ```

### Step 2: Set Up Railway Project

1. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your SSPMS repository

2. **Configure Environment Variables**:
   In Railway dashboard, go to your project → Variables, and add:

   ```bash
   # Required Variables
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sspms?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
   NODE_ENV=production
   PORT=5000

   # Optional Variables
   FRONTEND_URL=https://your-app-name.railway.app
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   MAX_FILE_SIZE=10485760
   ```

### Step 3: Configure Domain (Optional)

1. **Custom Domain**:
   - In Railway dashboard, go to Settings → Domains
   - Add your custom domain or use the generated Railway domain
   - Update FRONTEND_URL environment variable with your domain

### Step 4: Deploy

1. **Automatic Deployment**:
   - Railway will automatically deploy when you push to your main branch
   - Monitor the deployment in the Railway dashboard
   - Check the deployment logs for any errors

2. **Manual Deployment**:
   - In Railway dashboard, click "Deploy Latest"
   - Or trigger via CLI: `railway up`

## 🔧 Build Process

Railway will execute these commands in order:

1. **Install Dependencies**: `npm install`
2. **Install Backend Dependencies**: `npm run install:backend`
3. **Build Frontend**: `npm run build:frontend` (creates `dist/` folder)
4. **Start Server**: `npm start` (runs backend server)

The backend server will:
- Serve API routes at `/api/*`
- Serve static frontend files from `/dist`
- Handle SPA routing for React/Vue router

## 📊 Monitoring & Health Checks

### Health Check Endpoint
Your app includes a health check at `/api/health` that returns:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "production",
  "database": {
    "status": "connected"
  }
}
```

### Monitoring in Railway
- **Logs**: View real-time logs in Railway dashboard
- **Metrics**: Monitor CPU, memory, and network usage
- **Health Checks**: Railway automatically monitors your health check endpoint

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check if all dependencies are listed in package.json
   npm install
   npm run build:frontend
   ```

2. **Database Connection Issues**:
   - Verify MongoDB URI is correct
   - Check if IP whitelist includes Railway's IPs (use 0.0.0.0/0)
   - Ensure database user has proper permissions

3. **Environment Variables**:
   - Double-check all required variables are set
   - Ensure JWT_SECRET is at least 32 characters
   - Verify no typos in variable names

4. **Frontend Not Loading**:
   - Check if `dist/` folder is created during build
   - Verify static file serving is working
   - Check browser console for errors

### Debugging Commands

```bash
# Local testing before deployment
npm run build:frontend  # Test frontend build
npm run start:backend   # Test backend server

# Check health endpoint locally
curl http://localhost:5000/api/health

# Test production build locally
NODE_ENV=production npm start
```

## 🔄 Continuous Deployment

### Automatic Deployments
- Every push to main branch triggers deployment
- Railway pulls latest code, builds, and deploys
- Zero-downtime deployments

### Manual Control
- Use Railway CLI for manual deployments
- Control deployment timing
- Deploy specific commits

## 📈 Performance Optimization

### Implemented Optimizations

1. **Code Splitting**: Vendor and chart libraries separated
2. **Asset Optimization**: Vite build optimizations
3. **Compression**: Express.js with compression middleware
4. **Static File Caching**: Proper cache headers for assets

### Scaling Options

- **Vertical Scaling**: Increase RAM/CPU in Railway settings
- **Database Optimization**: Use MongoDB Atlas auto-scaling
- **CDN**: Use Railway's edge caching for static assets

## 🔒 Security Considerations

1. **Environment Variables**: Never commit secrets to repository
2. **CORS Configuration**: Properly configured for production domain
3. **Database Security**: Use MongoDB Atlas security features
4. **HTTPS**: Railway provides SSL certificates automatically

## 💰 Cost Estimation

### Railway Pricing (as of 2024)
- **Hobby Plan**: $5/month - Good for small projects
- **Pro Plan**: $20/month - Production applications
- **Usage-based**: Additional charges for high usage

### MongoDB Atlas
- **Free Tier**: 512MB storage - Good for development
- **Paid Plans**: Start at $9/month for production

## 📞 Support & Resources

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **MongoDB Atlas Support**: [support.mongodb.com](https://support.mongodb.com)

## ✅ Post-Deployment Checklist

- [ ] Health check endpoint returns 200 OK
- [ ] Database connection is working
- [ ] Frontend loads correctly
- [ ] API endpoints are accessible
- [ ] Authentication flow works
- [ ] File uploads work (if applicable)
- [ ] Email functionality works (if configured)
- [ ] All environment variables are set
- [ ] Custom domain is configured (if using)
- [ ] SSL certificate is active
- [ ] Monitoring is set up

## 🚀 Going Live

1. **Test Everything**: Use Railway's preview deployments for testing
2. **Data Migration**: If needed, migrate data to production database
3. **DNS Setup**: Point your domain to Railway
4. **Monitoring**: Set up alerts for critical issues
5. **Backup Strategy**: Configure database backups
6. **Documentation**: Update any API documentation with new URLs

---

**Your SSPMS application should now be successfully deployed on Railway!** 🎉

Access your application at: `https://your-app-name.railway.app` 