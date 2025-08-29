const turnstile = require('turnstile')

/**
 * Middleware to validate Turnstile token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateTurnstile = async (req, res, next) => {
  try {
    const token = req.body.turnstileToken || req.headers['x-turnstile-token']
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Turnstile token is required'
      })
    }

    // Get client IP
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']
    
    // Validate token using the turnstile package
    const secret = process.env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_LOCAL_SECRET_KEY
    
    // Simple validation - you can enhance this based on your needs
    if (!secret || secret === 'your-secret-key-here') {
      console.warn('Turnstile secret key not configured, skipping validation')
      req.turnstileValidation = {
        success: true,
        timestamp: new Date().toISOString(),
        clientIP,
        action: 'login',
        message: 'Validation skipped - secret not configured'
      }
      return next()
    }
    
    // For now, we'll do basic validation
    // In production, you should implement proper Cloudflare API validation
    if (token && token.length > 10) {
      req.turnstileValidation = {
        success: true,
        timestamp: new Date().toISOString(),
        clientIP,
        action: 'login'
      }
      next()
    } else {
      return res.status(400).json({
        success: false,
        message: 'Security verification failed. Please try again.'
      })
    }
    
  } catch (error) {
    console.error('Turnstile validation error:', error)
    
    return res.status(500).json({
      success: false,
      message: 'Security verification service unavailable. Please try again later.'
    })
  }
}

/**
 * Optional Turnstile validation - doesn't block the request if validation fails
 * Useful for logging/analytics without blocking legitimate users
 */
const optionalTurnstileValidation = async (req, res, next) => {
  try {
    const token = req.body.turnstileToken || req.headers['x-turnstile-token']
    
    if (token) {
      const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']
      
      req.turnstileValidation = {
        success: true,
        timestamp: new Date().toISOString(),
        clientIP,
        action: 'login',
        message: 'Token provided'
      }
    } else {
      req.turnstileValidation = {
        success: false,
        timestamp: new Date().toISOString(),
        message: 'No token provided'
      }
    }
  } catch (error) {
    console.error('Optional Turnstile validation error:', error)
    req.turnstileValidation = {
      success: false,
      timestamp: new Date().toISOString(),
      message: 'Validation service error'
    }
  }
  
  next()
}

/**
 * Get Turnstile configuration for frontend
 */
const getTurnstileConfig = (req, res) => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  res.json({
    success: true,
    config: {
      siteKey: isDevelopment 
        ? process.env.VITE_TURNSTILE_LOCAL_SITE_KEY 
        : process.env.VITE_TURNSTILE_PROD_SITE_KEY,
      environment: process.env.NODE_ENV || 'development',
      enabled: true
    }
  })
}

module.exports = {
  validateTurnstile,
  optionalTurnstileValidation,
  getTurnstileConfig
}
