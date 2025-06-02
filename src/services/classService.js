import api from './api';
import { useAuthStore } from '../stores/authStore';

export const classService = {
  getAll: async () => {
    const response = await api.get('/classes');
    return response.data;
  },
  getById: async (id) => {
    try {
      console.log(`Fetching class by ID: ${id}`);
      const response = await api.get(`/classes/${id}`);
      
      // Sanity check the response structure for debugging
      if (response.data && response.data.students) {
        console.log(`Class has ${response.data.students.length} students`);
        // Check the format of students
        if (response.data.students.length > 0) {
          const firstStudent = response.data.students[0];
          console.log('First student structure:', 
            firstStudent.user ? 
            `User object found: ${firstStudent.user.firstName} ${firstStudent.user.lastName}` : 
            'No user object');
        }
      } else {
        console.log('No students in class data or unexpected data structure');
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching class:', error);
      throw error;
    }
  },
  create: async (classData) => {
    const response = await api.post('/classes', classData);
    return response.data;
  },
  update: async (id, classData) => {
    try {
      console.log(`Updating class ${id} with data:`, classData);
      
      // Force a full reload from the server after the update
      const response = await api.put(`/classes/${id}`, classData);
      console.log(`Class update response:`, response.data);
      
      // Handle different response formats
      if (response.data && response.data.class) {
        return response.data.class;
      } else if (response.data && response.data._id) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Fallback for other response formats
        console.warn('Unexpected response format from class update, returning data as is:', response.data);
        return response.data;
      } else {
        console.error('Invalid response from server:', response);
        throw new Error('Invalid response received from server');
      }
    } catch (error) {
      console.error(`Error updating class ${id}:`, error);
      if (error.response) {
        console.error('Server error response:', error.response.data);
        
        // Add more details to the error
        const serverMessage = error.response.data?.message || 'Unknown server error';
        error.message = `Server error: ${serverMessage}`;
      }
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/classes/${id}`);
      return response.data.class || response.data;
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  },
  getAdvisoryClasses: async () => {
    try {
      console.log('Fetching advisory classes for adviser');
      
      const authStore = useAuthStore();
      const userId = authStore.user?.id || localStorage.getItem('userId');
      
      if (!userId) {
        console.error('No user ID found. Auth state:', 
          authStore.isAuthenticated ? 'Authenticated' : 'Not authenticated',
          'User object:', authStore.user ? 'Present' : 'Missing');
        
        throw new Error('User not authenticated');
      }
      
      console.log(`Authenticated as user ${userId}, fetching advisory classes`);
      
      // Fetch advisory classes using the authenticated user's info
      const response = await api.get(`/advisers/my/classes`);
      
      // Log detailed info about classes received
      if (response.data && Array.isArray(response.data)) {
        console.log(`Retrieved ${response.data.length} advisory classes`);
        
        response.data.forEach((classItem, index) => {
          console.log(`Class ${index + 1}: ${classItem.yearLevel} Year - ${classItem.section}, Major: ${classItem.major}`);
          console.log(`- Students: ${classItem.students?.length || 0}`);
          console.log(`- SSP Subject: ${classItem.sspSubject?.name || 'None'}`);
        });
      } else {
        console.warn('No advisory classes data received or invalid format');
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching advisory classes:', error);
      throw error;
    }
  },
  getArchivedClasses: async () => {
    try {
      const response = await api.get('/classes', { params: { status: 'inactive' } });
      return response.data;
    } catch (error) {
      console.error('Error fetching archived classes:', error);
      throw error;
    }
  },
  reactivateClass: async (classId) => {
    try {
      const response = await api.put(`/classes/reactivate/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Error reactivating class:', error);
      throw error;
    }
  }
}; 