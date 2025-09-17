import api from './api'

// Analytics data service for SSP Management System
export const analyticsService = {
  // Overall Progress Overview - REAL DATABASE DATA
  async getProgressOverviewData() {
    try {
      const [studentsResponse, sessionsResponse, odysseyResponse] = await Promise.all([
        api.get('/students'),
        api.get('/students/analytics/data'),
        api.get('/odyssey-plans')
      ])
      
      return {
        students: studentsResponse.data || [],
        analytics: sessionsResponse.data || {},
        odysseyPlans: odysseyResponse.data || []
      }
    } catch (error) {
      console.error('Error fetching progress overview data:', error)
      return {
        students: [],
        analytics: { odysseyCompletion: { rate: 0 } },
        odysseyPlans: []
      }
    }
  },

  // Enrollment Risk Prediction
  async getEnrollmentRiskData() {
    try {
      const [riskResponse, studentsResponse] = await Promise.all([
        api.get('/admin/dashboard/student-risk-analysis'),
        api.get('/students')
      ])
      return {
        summary: riskResponse.data.summary || {},
        students: studentsResponse.data || []
      }
    } catch (error) {
      console.error('Error fetching enrollment risk data:', error)
      // Return fallback data instead of throwing
      return {
        summary: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
        students: []
      }
    }
  },

  // Monthly Progress Trends - REAL DATABASE DATA
  async getMonthlyTrendsData() {
    try {
      const [studentsResponse, sessionsResponse, odysseyResponse, mmResponse] = await Promise.all([
        api.get('/students'),
        api.get('/sessions'),
        api.get('/odyssey-plans'),
        api.get('/midterm-finals')
      ])
      return {
        students: studentsResponse.data || [],
        sessions: sessionsResponse.data || [],
        odysseyPlans: odysseyResponse.data || [],
        mmSubmissions: mmResponse.data || []
      }
    } catch (error) {
      console.error('Error fetching monthly trends data:', error)
      return {
        students: [],
        sessions: [],
        odysseyPlans: [],
        mmSubmissions: []
      }
    }
  },

  // Class Performance Comparison - REAL DATABASE DATA
  async getClassPerformanceData() {
    try {
      const [classesResponse, studentsResponse, sessionsResponse] = await Promise.all([
        api.get('/admin/dashboard/classes'),
        api.get('/students'),
        api.get('/sessions')
      ])
      return {
        classes: classesResponse.data || [],
        students: studentsResponse.data || [],
        sessions: sessionsResponse.data || []
      }
    } catch (error) {
      console.error('Error fetching class performance data:', error)
      return {
        classes: [],
        students: [],
        sessions: []
      }
    }
  },

  // Student Activity and Engagement - REAL DATABASE DATA
  async getStudentActivityData() {
    try {
      const [studentsResponse, sessionsResponse, consultationsResponse] = await Promise.all([
        api.get('/students'),
        api.get('/sessions'),
        api.get('/consultations')
      ])
      return {
        students: studentsResponse.data || [],
        sessions: sessionsResponse.data || [],
        consultations: consultationsResponse.data || []
      }
    } catch (error) {
      console.error('Error fetching student activity data:', error)
      return {
        students: [],
        sessions: [],
        consultations: []
      }
    }
  },

  /**
   * Track an event with optional properties (Legacy analytics tracking)
   * @param {string} eventName - The name of the event to track
   * @param {Object} properties - Optional properties to include with the event
   */
  trackEvent: (eventName, properties = {}) => {
    try {
      console.log(`[Analytics] Event: ${eventName}`, properties);
      return true;
    } catch (error) {
      console.error(`[Analytics] Failed to track event ${eventName}:`, error);
      return false;
    }
  },
  
  /**
   * Track a page view (Legacy analytics tracking)
   * @param {string} pageName - The name of the page
   * @param {Object} properties - Optional additional properties
   */
  trackPageView: (pageName, properties = {}) => {
    try {
      console.log(`[Analytics] Page View: ${pageName}`, properties);
      return true;
    } catch (error) {
      console.error(`[Analytics] Failed to track page view ${pageName}:`, error);
      return false;
    }
  }
};

export default analyticsService;