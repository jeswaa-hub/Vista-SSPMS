# 🚀 Render Deployment Guide for SSPMS

## Prerequisites
- GitHub account with your project pushed
- Render account (free tier available)

## Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended)
3. Verify your email

## Step 2: Deploy Backend Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. **Service Settings:**
   - **Name**: `sspms-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm run build:frontend && npm run install:backend`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`

4. **Environment Variables:**
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: (we'll add this after MongoDB Atlas setup)

5. Click "Create Web Service"

## Step 3: Deploy Frontend Service
1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. **Service Settings:**
   - **Name**: `sspms-frontend`
   - **Build Command**: `npm run build:frontend`
   - **Publish Directory**: `dist`

4. **Environment Variables:**
   - `VITE_API_URL`: `https://your-backend-service-name.onrender.com`

5. Click "Create Static Site"

## Step 4: Update API Base URL
After both services are deployed, update the frontend's `VITE_API_URL` to point to your backend service URL.

## Step 5: Test Deployment
- Backend: Visit `/api/health` endpoint
- Frontend: Visit the static site URL
- Test login and basic functionality

## Next: MongoDB Atlas Setup
We'll set up MongoDB Atlas after successful deployment to Render.

## Troubleshooting
- Check build logs for errors
- Verify environment variables
- Ensure MongoDB connection string is correct
- Check health check endpoint
