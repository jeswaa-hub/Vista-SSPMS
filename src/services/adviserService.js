import api from './api';

/**
 * Loads a specific class by ID
 * @param {string} classId - The ID of the class to load
 * @returns {Promise<Object>} - The class data
 */
async function loadClassById(classId) {
  try {
    if (!classId) {
      console.error('No class ID provided to loadClassById')
      return null
    }
    
    console.log(`Loading class with ID: ${classId}`)
    
    // Try the new endpoint first
    try {
      const response = await api.get(`/classes/by-id/${classId}`)
      
      if (!response || !response.data) {
        console.error('No data received from new class API endpoint')
        throw new Error('No data received')
      }
      
      console.log('Class loaded successfully from new endpoint:', response.data)
      return response.data
    } catch (newEndpointError) {
      console.warn('Error using new endpoint:', newEndpointError.message)
      
      // Fall back to the old endpoint
      const response = await api.get(`/adviser/classes/${classId}`)
      
      if (!response || !response.data) {
        console.error('No data received from fallback class API endpoint')
        return null
      }
      
      console.log('Class loaded successfully from fallback endpoint:', response.data)
      return response.data
    }
  } catch (error) {
    console.error('Error loading class by ID:', error)
    throw new Error(`Failed to load class: ${error.message}`)
  }
}

export const adviserService = {
  getAll: async () => {
    try {
      console.log('Calling API: GET /advisers');
      const response = await api.get('/advisers');
      console.log('API response:', response);
      return response;
    } catch (error) {
      console.error('Error in adviserService.getAll:', error);
      throw error;
    }
  },
  getById: async (id) => {
    return await api.get(`/advisers/${id}`);
  },
  getByDepartment: async (department) => {
    return await api.get(`/advisers/department/${department}`);
  },
  getAvailability: async (adviserId, date) => {
    return await api.get(`/advisers/${adviserId}/availability`, { 
      params: { date } 
    });
  },
  create: async (adviser) => {
    const response = await api.post('/advisers', adviser);
    return response.data;
  },
  update: async (id, adviser) => {
    const response = await api.put(`/advisers/${id}`, adviser);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/advisers/${id}`);
    return response.data;
  },
  /**
   * Get all classes advised by the current user
   * @returns {Promise<Array>} - The list of classes advised by the current user
   */
  getAdvisedClasses: async () => {
    try {
      console.log('Fetching advised classes');
      
      // Try the primary endpoint first
      try {
        console.log('Trying primary endpoint: /advisers/my/classes');
        const response = await api.get('/advisers/my/classes');
        
        // Check if we got a proper response with class data
        if (response && Array.isArray(response.data) && response.data.length > 0) {
          console.log(`Retrieved ${response.data.length} advisory classes`);
          
          // Map to expected format - each advisory class has a 'class' property
          return response.data.map(advisoryClass => {
            if (advisoryClass.class) {
              // Directly copy properties needed for display
              const classObj = {
                _id: advisoryClass.class._id,
                yearLevel: advisoryClass.class.yearLevel,
                section: advisoryClass.class.section,
                major: advisoryClass.class.major,
                status: advisoryClass.class.status,
                room: advisoryClass.class.room,
                daySchedule: advisoryClass.class.daySchedule,
                timeSchedule: advisoryClass.class.timeSchedule,
                students: advisoryClass.class.students || [],
                schoolYear: advisoryClass.class.schoolYear || 
                  (advisoryClass.class.sspSubject?.schoolYear) || 
                  (advisoryClass.class.firstSemester?.sspSubject?.schoolYear) || 
                  (advisoryClass.class.secondSemester?.sspSubject?.schoolYear) || 
                  '2025-2026',
                
                // Handle semester data
                hasFirstSemester: advisoryClass.hasFirstSemester,
                hasSecondSemester: advisoryClass.hasSecondSemester
              };
              
              // Add semester subjects
              if (advisoryClass.class.firstSemester && advisoryClass.class.firstSemester.sspSubject) {
                classObj.firstSemester = advisoryClass.class.firstSemester;
                classObj.firstSemesterSubject = advisoryClass.class.firstSemester.sspSubject;
              }
              
              if (advisoryClass.class.secondSemester && advisoryClass.class.secondSemester.sspSubject) {
                classObj.secondSemester = advisoryClass.class.secondSemester;
                classObj.secondSemesterSubject = advisoryClass.class.secondSemester.sspSubject;
              }
              
              // For backwards compatibility
              if (advisoryClass.class.sspSubject) {
                classObj.sspSubject = advisoryClass.class.sspSubject;
              } else if (classObj.firstSemesterSubject) {
                classObj.sspSubject = classObj.firstSemesterSubject;
              }
              
              return classObj;
            }
            return advisoryClass; // Return as is if structure is different
          }).filter(Boolean); // Remove any null/undefined entries
        }
        console.log('No classes found in response from primary endpoint');
      } catch (primaryError) {
        console.warn('Primary endpoint failed:', primaryError.message);
      }
      
      // Try the fallback endpoint
      try {
        console.log('Trying fallback endpoint: /classes/advised');
        const response = await api.get('/classes/advised');
        
        if (response && Array.isArray(response.data) && response.data.length > 0) {
          console.log(`Retrieved ${response.data.length} classes from fallback endpoint`);
          return response.data;
        }
        console.log('No classes found in response from fallback endpoint');
      } catch (fallbackError) {
        console.warn('Fallback endpoint failed:', fallbackError.message);
      }
      
      // If we've tried everything and nothing worked, log detailed debugging info
      console.warn('All class loading attempts failed, returning empty array');
      
      // Return empty array instead of throwing to avoid crashing the UI
      return [];
    } catch (error) {
      console.error('Error fetching advised classes:', error);
      // Return empty array instead of throwing
      return [];
    }
  },
  loadClassById,
  // Check if a student has completed their Odyssey Plan for a specific semester
  checkStudentOdysseyPlan: async (studentId, semester) => {
    try {
      const response = await api.get(`/advisers/student/${studentId}/odyssey-plan?semester=${semester}`);
      return response.data;
    } catch (error) {
      console.error('Error checking student Odyssey Plan:', error);
      throw error;
    }
  },
  
  // Send Odyssey Plan reminder notification to student
  sendOdysseyPlanReminder: async (studentId, message) => {
    try {
      const response = await api.post('/advisers/student/notify-odyssey-plan', {
        studentId,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending Odyssey Plan reminder:', error);
      throw error;
    }
  }
}; 