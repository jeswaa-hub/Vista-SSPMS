import api from './api';

export const mmService = {
  // Submit M&M exam image
  submitExam: async (examData) => {
    try {
      const formData = new FormData();
      formData.append('examImage', examData.image);
      formData.append('yearLevel', examData.yearLevel);
      formData.append('semester', examData.semester);
      formData.append('examType', examData.examType);

      const response = await api.post('/mm-submissions/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error submitting M&M exam:', error);
      throw error;
    }
  },

  // Get student's M&M submissions
  getMySubmissions: async () => {
    try {
      const response = await api.get('/mm-submissions/my-submissions');
      return response.data;
    } catch (error) {
      console.error('Error fetching M&M submissions:', error);
      throw error;
    }
  },

  // Get student's current year level
  getStudentYear: async () => {
    try {
      const response = await api.get('/mm-submissions/student-year');
      return response.data;
    } catch (error) {
      console.error('Error fetching student year level:', error);
      throw error;
    }
  },

  // Check sessions and send M&M upload notifications
  checkSessionsAndNotify: async (classId) => {
    try {
      const response = await api.post('/mm-submissions/check-sessions-and-notify', {
        classId
      });
      return response.data;
    } catch (error) {
      console.error('Error checking sessions and sending notifications:', error);
      throw error;
    }
  },

  // Get M&M completion status for promotion check
  getCompletionStatus: async (studentId, yearLevel, semester) => {
    try {
      const response = await api.get(`/mm-submissions/completion-status/${studentId}`, {
        params: { yearLevel, semester }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching M&M completion status:', error);
      throw error;
    }
  },

  // Get M&M history for student
  getHistory: async () => {
    try {
      const response = await api.get('/mm-submissions/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching M&M history:', error);
      throw error;
    }
  },

  // For admin/advisers to get all submissions
  getAllSubmissions: async () => {
    try {
      const response = await api.get('/mm-submissions/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching all M&M submissions:', error);
      throw error;
    }
  },

  // Update submission status (approve/reject)
  updateStatus: async (id, status, feedback = '') => {
    try {
      const response = await api.put(`/mm-submissions/${id}/status`, {
        status,
        feedback
      });
      return response.data;
    } catch (error) {
      console.error('Error updating submission status:', error);
      throw error;
    }
  },

  // Get student's current semester based on class categorization
  getCurrentClassSemester: async () => {
    try {
      const response = await api.get('/mm-submissions/current-class-semester');
      return response.data;
    } catch (error) {
      console.error('Error fetching current class semester:', error);
      throw error;
    }
  }
}; 