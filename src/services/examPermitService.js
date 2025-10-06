import api from './api';

/**
 * Exam Permit Service
 * Handles all exam permit related operations
 */
export const examPermitService = {
  /**
   * Student upload exam permit
   * @param {Object} permitData - Permit data including file and metadata
   * @returns {Promise<Object>} - Upload result
   */
  async studentUploadPermit(permitData) {
    try {
      const formData = new FormData();
      formData.append('permitFile', permitData.file);
      formData.append('period', permitData.period);
      formData.append('semester', permitData.semester || '1st Semester');

      const response = await api.post('/exam-permits/student/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading permit:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload permit');
    }
  },

  /**
   * Get adviser's permit submissions
   * @returns {Promise<Object>} - Adviser's permit submissions with filter options
   */
  async getAdviserPermitSubmissions() {
    try {
      const response = await api.get('/exam-permits/adviser/my');
      return response.data;
    } catch (error) {
      console.error('Error fetching adviser permit submissions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch permit submissions');
    }
  },

  /**
   * Upload and process exam permit (adviser)
   * @param {Object} permitData - Permit data including file and metadata
   * @returns {Promise<Object>} - Upload result
   */
  async uploadPermit(permitData) {
    try {
      const formData = new FormData();
      formData.append('permitFile', permitData.file);
      formData.append('studentId', permitData.studentId);
      formData.append('classId', permitData.classId);
      formData.append('semester', permitData.semester || '1st Semester');

      const response = await api.post('/exam-permits/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading permit:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload permit');
    }
  },

  /**
   * Get permits for a specific class
   * @param {string} classId - Class ID
   * @param {Object} filters - Optional filters (period, status)
   * @returns {Promise<Array>} - List of permits
   */
  async getPermitsForClass(classId, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.period) params.append('period', filters.period);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/exam-permits/class/${classId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching permits:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch permits');
    }
  },

  /**
   * Student: get my permits
   * @param {Object} options - Optional filters (semester, period)
   */
  async getMyPermits(options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.semester) params.append('semester', options.semester);
      if (options.period) params.append('period', options.period);
      const response = await api.get(`/exam-permits/student/my?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my permits:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch permits');
    }
  },

  /**
   * Student: get my permits for a class
   */
  async getMyClassPermits(classId, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.semester) params.append('semester', options.semester);
      if (options.period) params.append('period', options.period);
      const response = await api.get(`/exam-permits/student/class/${classId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my class permits:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch permits');
    }
  },

  /**
   * Get specific permit by ID
   * @param {string} permitId - Permit ID
   * @returns {Promise<Object>} - Permit details
   */
  async getPermitById(permitId) {
    try {
      const response = await api.get(`/exam-permits/${permitId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching permit:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch permit');
    }
  },

  /**
   * Validate permit
   * @param {string} permitId - Permit ID
   * @param {boolean} isValid - Whether permit is valid
   * @param {string} notes - Validation notes
   * @returns {Promise<Object>} - Validation result
   */
  async validatePermit(permitId, isValid, notes = '') {
    try {
      const response = await api.put(`/exam-permits/validate/${permitId}`, {
        isValid,
        validationNotes: notes
      });
      return response.data;
    } catch (error) {
      console.error('Error validating permit:', error);
      throw new Error(error.response?.data?.message || 'Failed to validate permit');
    }
  },

  /**
   * Export permits data
   * @param {string} classId - Class ID
   * @param {string} format - Export format (csv, json)
   * @param {string} period - Optional period filter
   * @returns {Promise<Blob>} - Exported file
   */
  async exportPermits(classId, format = 'csv', period = null) {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (period) params.append('period', period);

      const response = await api.get(`/exam-permits/export/${classId}?${params.toString()}`, {
        responseType: 'blob'
      });

      return response.data;
    } catch (error) {
      console.error('Error exporting permits:', error);
      throw new Error(error.response?.data?.message || 'Failed to export permits');
    }
  },

  /**
   * Delete permit
   * @param {string} permitId - Permit ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deletePermit(permitId) {
    try {
      const response = await api.delete(`/exam-permits/${permitId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting permit:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete permit');
    }
  },

  /**
   * Download permit attachment
   * @param {string} permitId - Permit ID
   * @returns {Promise<string>} - File URL
   */
  async getPermitAttachment(permitId) {
    try {
      const permit = await this.getPermitById(permitId);
      if (permit.permit && permit.permit.permitAttachment) {
        return `/uploads/exam-permits/${permit.permit.permitAttachment.filename}`;
      }
      throw new Error('Permit attachment not found');
    } catch (error) {
      console.error('Error getting permit attachment:', error);
      throw new Error('Failed to get permit attachment');
    }
  },

  /**
   * Get permit statistics for a class
   * @param {string} classId - Class ID
   * @returns {Promise<Object>} - Statistics
   */
  async getPermitStatistics(classId) {
    try {
      const response = await api.get(`/exam-permits/class/${classId}`);
      const permits = response.data.permits || [];

      const stats = {
        total: permits.length,
        pending: permits.filter(p => p.status === 'pending').length,
        validated: permits.filter(p => p.status === 'validated').length,
        rejected: permits.filter(p => p.status === 'rejected').length,
        byPeriod: {}
      };

      // Group by period
      permits.forEach(permit => {
        const period = permit.period || 'Unknown';
        if (!stats.byPeriod[period]) {
          stats.byPeriod[period] = {
            total: 0,
            pending: 0,
            validated: 0,
            rejected: 0
          };
        }
        stats.byPeriod[period].total++;
        stats.byPeriod[period][permit.status]++;
      });

      return stats;
    } catch (error) {
      console.error('Error getting permit statistics:', error);
      throw new Error('Failed to get permit statistics');
    }
  }
};

export default examPermitService;
