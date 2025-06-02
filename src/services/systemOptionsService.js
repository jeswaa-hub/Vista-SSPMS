import api from './api'

// Default options
const defaultOptions = {
  class: {
    yearLevels: ['2nd', '3rd', '4th'],
    majors: {
      '2nd': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'],
      '3rd': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'],
      '4th': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security']
    },
    defaultSessions: [
      { title: 'INTRODUCTION', count: 0 },
      { title: 'ORIENTATION', count: 0 }
    ],
    sections: {
      '2nd': ['South-1', 'South-2', 'South-3', 'South-4', 'South-5'],
      '3rd': ['South-1', 'South-2', 'South-3'],
      '4th': ['South-1', 'South-2']
    },
    rooms: ['301', '302', '303', '304', '401', '402', '403', '404']
  },
  subject: {
    schoolYear: '2025 - 2026',
    defaultZeroDayTitle: 'INTRODUCTION',
    hoursOptions: [1, 2, 3],
    yearLevels: ['1st', '2nd', '3rd', '4th']
  }
}

/**
 * Service for managing system options
 */
export const systemOptionsService = {
  /**
   * Get all system options
   * @returns {Promise<Object>} System options
   */
  async getAll() {
    try {
      const response = await api.get('/system-options')
      return response.data
    } catch (error) {
      console.error('Error fetching system options:', error)
      throw error
    }
  },

  /**
   * Update system options
   * @param {Object} options - The options to update
   * @returns {Promise<Object>} Updated options
   */
  async update(options) {
    try {
      const response = await api.post('/system-options', options)
      return response.data
    } catch (error) {
      console.error('Error updating system options:', error)
      throw error
    }
  },

  /**
   * Reset system options to defaults
   * @returns {Promise<Object>} Default options
   */
  async resetToDefaults() {
    try {
      const response = await api.post('/system-options/reset')
      return response.data
    } catch (error) {
      console.error('Error resetting system options:', error)
      throw error
    }
  }
} 