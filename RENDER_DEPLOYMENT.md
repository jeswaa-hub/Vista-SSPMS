# 🚀 Render Deployment Guide for SSPMS

## Prerequisites
- GitHub account with your project pushed
- Render account (free tier available)

## Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended)
3. Verify your email

## Step 2: Deploy the Application
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. **Service Settings:**
   - **Name**: `sspms-sspms`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build:frontend`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`

4. **Environment Variables:**
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: (we'll add this after MongoDB Atlas setup)

5. Click "Create Web Service"

## Step 3: Test the Deployment
- Visit your service URL to see the frontend
- Test the API at `/api/health` endpoint
- Test login and basic functionality

## Next: MongoDB Atlas Setup
We'll set up MongoDB Atlas after successful deployment to Render.

## Troubleshooting
- Check build logs for errors
- Verify environment variables
- Ensure MongoDB connection string is correct
- Check health check endpoint
