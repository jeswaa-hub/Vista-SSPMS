const express = require('express')
const { getTurnstileConfig } = require('../middleware/turnstile')

const router = express.Router()

/**
 * GET /api/turnstile/config
 * Get Turnstile configuration for frontend
 */
router.get('/config', getTurnstileConfig)

/**
 * POST /api/turnstile/validate
 * Validate a Turnstile token (for testing purposes)
 */
router.post('/validate', async (req, res) => {
  try {
    const { token } = req.body
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      })
    }

    // Basic validation for now
    const secret = process.env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_PROD_SECRET_KEY || process.env.TURNSTILE_LOCAL_SECRET_KEY
    
    if (!secret || secret === 'your-secret-key-here') {
      return res.status(200).json({
        success: true,
        validation: { success: true, message: 'Validation skipped - secret not configured' },
        clientIP: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'],
        timestamp: new Date().toISOString()
      })
    }

    // Simple token validation
    if (token && token.length > 10) {
      res.json({
        success: true,
        validation: { success: true, message: 'Token validated' },
        clientIP: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'],
        timestamp: new Date().toISOString()
      })
    } else {
      res.status(400).json({
        success: false,
        validation: { success: false, message: 'Invalid token format' },
        clientIP: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'],
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Turnstile validation error:', error)
    
    res.status(500).json({
      success: false,
      message: 'Validation failed',
      error: error.message
    })
  }
})

module.exports = router
