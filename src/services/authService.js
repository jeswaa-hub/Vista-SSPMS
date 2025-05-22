import api from './api';

/**
 * Authentication and user management service
 */
export const authService = {
  /**
   * Request a password reset with OTP
   * @param {string} email - The user's email
   * @returns {Promise<Object>} - The response
   */
  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/auth/request-otp', { email });
      return response.data;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  },

  /**
   * Verify OTP and reset password
   * @param {Object} resetData - The reset data
   * @param {string} resetData.email - The user's email
   * @param {string} resetData.otp - The OTP code
   * @param {string} resetData.newPassword - The new password
   * @returns {Promise<Object>} - The response
   */
  verifyOtpAndResetPassword: async (resetData) => {
    try {
      const response = await api.post('/auth/verify-otp', resetData);
      return response.data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} - The response
   */
  login: (credentials) => api.post('/auth/login', credentials),

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - The response
   */
  register: (userData) => api.post('/auth/register', userData),

  /**
   * Get the current user's data
   * @returns {Promise<Object>} - The response
   */
  getCurrentUser: () => api.get('/auth/me')
}; 