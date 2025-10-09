const axios = require('axios');

// Validate Turnstile token
const validateTurnstile = async (req, res, next) => {
  try {
    const { turnstileToken } = req.body;
    
    // Skip validation if no token provided (for development)
    if (!turnstileToken) {
      console.log('No Turnstile token provided, skipping validation');
      return next();
    }
    
    // Get secret key from environment based on NODE_ENV
    const secretKey = process.env.NODE_ENV === 'development' 
      ? process.env.TURNSTILE_LOCAL_SECRET_KEY 
      : process.env.TURNSTILE_PROD_SECRET_KEY;
    
    if (!secretKey) {
      console.log('No Turnstile secret key configured, skipping validation');
      return next();
    }
    
    // Verify token with Cloudflare
    const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      secret: secretKey,
      response: turnstileToken,
      remoteip: req.ip
    });
    
    if (response.data.success) {
      console.log('Turnstile validation successful');
      next();
    } else {
      console.log('Turnstile validation failed:', response.data);
      return res.status(400).json({ 
        message: 'Security verification failed. Please try again.' 
      });
    }
  } catch (error) {
    console.error('Turnstile validation error:', error);
    return res.status(500).json({ 
      message: 'Security verification error. Please try again.' 
    });
  }
};

module.exports = {
  validateTurnstile
};
