# Cloudflare Turnstile Setup Guide

This guide will help you set up Cloudflare Turnstile for both local development and production deployment.

## 🚀 What is Turnstile?

Cloudflare Turnstile is a privacy-first, free CAPTCHA alternative that provides bot protection without requiring users to solve puzzles. It's designed to be invisible to legitimate users while blocking bots.

## 📋 Prerequisites

1. **Cloudflare Account**: You need a Cloudflare account
2. **Domain**: A domain managed by Cloudflare (for production)
3. **Node.js**: Version 18+ (you have v20.17.0 ✅)

## 🔧 Step 1: Get Turnstile Keys

### For Local Development (Testing)
1. Go to [Cloudflare Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Click "Add Site"
3. Choose "Invisible" or "Managed" challenge
4. Set domain to `localhost` or `127.0.0.1`
5. Copy the **Site Key** and **Secret Key**

### For Production
1. Go to [Cloudflare Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Click "Add Site"
3. Choose "Invisible" or "Managed" challenge
4. Set domain to your production domain (e.g., `sspms-frontend.onrender.com`)
5. Copy the **Site Key** and **Secret Key**

## ⚙️ Step 2: Configure Environment Variables

### Local Development
Update `turnstile-config.env` with your actual keys:

```env
# Local Development
VITE_TURNSTILE_LOCAL_SITE_KEY=your-actual-local-site-key
TURNSTILE_LOCAL_SECRET_KEY=your-actual-local-secret-key

# Production
VITE_TURNSTILE_PROD_SITE_KEY=your-actual-production-site-key
TURNSTILE_PROD_SECRET_KEY=your-actual-production-secret-key
```

### Production Deployment
Add these to your Render environment variables:

```env
VITE_TURNSTILE_PROD_SITE_KEY=your-production-site-key
TURNSTILE_PROD_SECRET_KEY=your-production-secret-key
```

## 🧪 Step 3: Test Local Setup

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   npm run dev
   ```

3. **Test Login**:
   - Go to `http://localhost:5173`
   - Try to log in
   - You should see the Turnstile widget
   - Complete the verification
   - Login should proceed normally

## 🔍 Step 4: Verify Backend Integration

The backend will automatically validate Turnstile tokens. You can test this:

```bash
# Test Turnstile config endpoint
curl http://localhost:5000/api/turnstile/config

# Test token validation (replace with actual token)
curl -X POST http://localhost:5000/api/turnstile/validate \
  -H "Content-Type: application/json" \
  -d '{"token":"your-token-here"}'
```

## 🚀 Step 5: Deploy to Production

1. **Update Environment Variables** in Render dashboard
2. **Redeploy** your application
3. **Test** the production login flow

## 📱 How It Works

### Frontend (Login.vue)
1. **Turnstile Component**: Renders the security widget
2. **Token Collection**: Captures verification token
3. **Form Submission**: Includes token with login request

### Backend (auth.js)
1. **Middleware**: `validateTurnstile` checks the token
2. **Validation**: Verifies token with Cloudflare
3. **Proceed**: Only allows login if validation passes

### Security Features
- ✅ **Bot Protection**: Blocks automated attacks
- ✅ **Privacy First**: No user tracking
- ✅ **Invisible**: Legitimate users don't see challenges
- ✅ **Rate Limiting**: Prevents brute force attacks

## 🛠️ Customization Options

### Turnstile Widget Appearance
```vue
<Turnstile
  :site-key="turnstileConfig.siteKey"
  theme="light"           <!-- light | dark -->
  size="normal"           <!-- normal | compact | invisible -->
  action="login"          <!-- Custom action name -->
  @success="onSuccess"    <!-- Success callback -->
  @error="onError"        <!-- Error callback -->
  @expired="onExpired"    <!-- Expired callback -->
  @timeout="onTimeout"    <!-- Timeout callback -->
/>
```

### Backend Validation Options
```javascript
// Strict validation (blocks if fails)
app.use('/api/auth/login', validateTurnstile, authRoutes)

// Optional validation (logs but doesn't block)
app.use('/api/auth/login', optionalTurnstileValidation, authRoutes)
```

## 🔧 Troubleshooting

### Common Issues

1. **"Site key not found"**
   - Check your site key in environment variables
   - Verify domain settings in Cloudflare dashboard

2. **"Secret key invalid"**
   - Check your secret key in environment variables
   - Ensure keys match between frontend and backend

3. **Widget not loading**
   - Check browser console for errors
   - Verify Turnstile script is loading
   - Check network connectivity to Cloudflare

4. **Validation always fails**
   - Check backend logs for validation errors
   - Verify IP address handling
   - Check secret key configuration

### Debug Mode
Enable debug logging in development:

```javascript
// In backend/middleware/turnstile.js
console.log('Turnstile validation:', {
  token: token?.substring(0, 20) + '...',
  clientIP,
  result
})
```

## 📊 Monitoring & Analytics

### Cloudflare Dashboard
- View challenge success rates
- Monitor bot detection accuracy
- Analyze traffic patterns

### Backend Logs
- Track validation success/failure rates
- Monitor IP addresses
- Log suspicious activity

## 🔒 Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Use HTTPS** in production
3. **Validate tokens server-side** (already implemented)
4. **Monitor validation failures** for potential attacks
5. **Rotate keys** periodically

## 📚 Additional Resources

- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Turnstile API Reference](https://developers.cloudflare.com/turnstile/reference/)
- [Best Practices Guide](https://developers.cloudflare.com/turnstile/best-practices/)

## ✅ Next Steps

1. **Get your Turnstile keys** from Cloudflare dashboard
2. **Update environment variables** with your keys
3. **Test locally** to ensure everything works
4. **Deploy to production** and test there
5. **Monitor** the system for any issues

Your Turnstile integration is now ready! The system will automatically protect your login form from bots while providing a seamless experience for legitimate users.
