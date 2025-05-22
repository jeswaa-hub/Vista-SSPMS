import api from './api';

/**
 * Service for managing notifications through API calls
 */
export const notificationApiService = {
  /**
   * Get all notifications for the current user
   * @returns {Promise<Array>} Array of notification objects
   */
  async getAll() {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get count of unread notifications
   * @returns {Promise<Number>} Count of unread notifications
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  /**
   * Mark a notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(id) {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Result with count of updated notifications
   */
  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Create a new notification
   * @param {Object} notification - Notification object with recipient, title, message, and optional type and link
   * @returns {Promise<Object>} Created notification
   */
  async create(notification) {
    try {
      const response = await api.post('/notifications/create', notification);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  /**
   * Delete a notification
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} Result object
   */
  async delete(id) {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}; 