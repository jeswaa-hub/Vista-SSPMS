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
   * Verify OTP only (without resetting password)
   * @param {Object} otpData - The OTP data
   * @param {string} otpData.email - The user's email
   * @param {string} otpData.otp - The OTP code
   * @returns {Promise<Object>} - The response
   */
  verifyOtpOnly: async (otpData) => {
    try {
      const response = await api.post('/auth/verify-otp-only', otpData);
      return response.data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  /**
   * Verify OTP only
   * @param {Object} otpData - The OTP data
   * @param {string} otpData.email - The user's email
   * @param {string} otpData.otp - The OTP code
   * @returns {Promise<Object>} - The response
   */
  verifyOtp: async (otpData) => {
    try {
      const response = await api.post('/auth/verify-otp', otpData);
      return response.data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  /**
   * Reset password with verified OTP
   * @param {Object} resetData - The reset data
   * @param {string} resetData.email - The user's email
   * @param {string} resetData.otp - The OTP code
   * @param {string} resetData.newPassword - The new password
   * @returns {Promise<Object>} - The response
   */
  resetPasswordWithOtp: async (resetData) => {
    try {
      const response = await api.post('/auth/reset-password-with-otp', resetData);
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
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