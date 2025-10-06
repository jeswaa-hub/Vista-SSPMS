import api from './api';

export const odysseyPlanService = {
  // Get all plans for the current student
  getAllPlans: async () => {
    try {
      const response = await api.get('/odyssey-plans/my-plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching odyssey plans:', error);
      throw error;
    }
  },

  // Get a specific plan by year and semester
  getPlan: async (year, semester) => {
    try {
      const response = await api.get(`/odyssey-plans/year/${year}/semester/${semester}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching odyssey plan for year ${year}, semester ${semester}:`, error);
      throw error;
    }
  },

  // Create or update a plan
  savePlan: async (planData) => {
    try {
      const response = await api.post('/odyssey-plans', planData);
      return response.data;
    } catch (error) {
      console.error('Error saving odyssey plan:', error);
      throw error;
    }
  },

  // Get completed plans
  getCompletedPlans: async () => {
    try {
      const response = await api.get('/odyssey-plans/completed');
      return response.data;
    } catch (error) {
      console.error('Error fetching completed odyssey plans:', error);
      throw error;
    }
  },

  // Get student's current year level
  getStudentYear: async () => {
    try {
      const response = await api.get('/odyssey-plans/student-year');
      return {
        yearLevel: response.data.yearLevel || 1,
        canAccess4thYearOdysseyPlan: response.data.canAccess4thYearOdysseyPlan || false,
        hasClassAssignment: response.data.hasClassAssignment !== false,
        firstSemesterCompleted: response.data.firstSemesterCompleted || false
      };
    } catch (error) {
      console.error('Error fetching student year level:', error);
      throw error;
    }
  },
  
  // Check plans by student ID (for advisers)
  getStudentPlans: async (studentId) => {
    try {
      const response = await api.get(`/odyssey-plans/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching odyssey plans for student ${studentId}:`, error);
      throw error;
    }
  }
  ,
  // Adviser consolidated plans, tagged by class info
  getAdviserPlans: async () => {
    try {
      const response = await api.get('/odyssey-plans/adviser/my');
      return response.data?.plans || response.data;
    } catch (error) {
      console.error('Error fetching adviser odyssey plans:', error);
      throw error;
    }
  },
  addNote: async (planId, note) => {
    try {
      const response = await api.post(`/odyssey-plans/${planId}/notes`, { note });
      return response.data;
    } catch (error) {
      console.error('Error adding odyssey plan note:', error);
      throw error;
    }
  }
}; 