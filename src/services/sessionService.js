import api from './api';

export const sessionService = {
  /**
   * Archive the current semester sessions for a specific student
   * @param {string} classId - The class ID
   * @param {string} studentId - The student ID
   * @returns {Promise<Object>} - The response data
   */
  archiveStudentSessions,
  
  /**
   * Load sessions for a specific student and semester
   * @param {string} classId - The class ID
   * @param {string} studentId - The student ID
   * @param {string} semester - The semester ('1st Semester' or '2nd Semester')
   * @returns {Promise<Object>} - The response data
   */
  loadStudentSessions,
  
  /**
   * Send a notification to a student about missing sessions
   * @param {string} classId - The class ID
   * @param {string} studentId - The student ID
   * @param {string} message - The notification message
   * @returns {Promise<Object>} - The response data
   */
  notifyStudent: async (classId, studentId, message) => {
    try {
      console.log(`Sending notification to student ${studentId} in class ${classId}`);
      const response = await api.post('/sessions/notify-student', {
        classId,
        studentId,
        message
      });
      
      console.log('Notification response:', response.data);
      
      if (response.data && response.data.success === true) {
        return response.data;
      } else {
        const errorMsg = (response.data && response.data.message) ? 
          response.data.message : 'Unknown error sending notification';
        console.error('Notification failed:', errorMsg);
        
        const error = new Error(errorMsg);
        error.response = response;
        throw error;
      }
    } catch (error) {
      console.error(`Error notifying student ${studentId}:`, error);
      if (error.response && error.response.data) {
        error.message = error.response.data.message || error.message;
      }
      throw error;
    }
  },
  
  /**
   * Initialize session records for a student in a class
   * This creates session completion records based on the class's SSP subject
   * @param {string} studentId - The student ID
   * @param {string} classId - The class ID
   * @param {string} semester - Optional: The semester to initialize ('1st Semester' or '2nd Semester')
   * @returns {Promise<Object>} - The response data
   */
  initSessionsForStudent: async (studentId, classId, semester) => {
    try {
      console.log(`Initializing ${semester || 'default'} sessions for student ${studentId} in class ${classId}`);
      const response = await api.post(`/sessions/init/${studentId}/${classId}`, { 
        semester: semester 
      });
      console.log('Session initialization successful');
      return response;
    } catch (error) {
      // If error is due to sessions already being initialized, don't throw
      if (error.response && error.response.status === 400 && 
          error.response.data && error.response.data.message && 
          (error.response.data.message.includes('already initialized') || 
           error.response.data.message.includes('already exist'))) {
        console.log('Sessions already initialized for this student - this is normal behavior');
        return { 
          data: { 
            message: 'Sessions already initialized',
            count: error.response.data.count || 0
          } 
        };
      }
      
      // For other errors, log them but don't throw in student view to prevent UI disruption
      if (window.location.pathname.includes('/student/')) {
        console.warn(`Non-critical error initializing sessions: ${error.message}`);
        return { 
          data: { 
            message: 'Error initializing sessions, will try again later',
            error: error.message
          } 
        };
      }
      
      console.error(`Error initializing sessions for student ${studentId} in class ${classId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get all sessions for a student in a class
   * @param {string} studentId - The student ID
   * @param {string} classId - The class ID
   * @returns {Promise<Object>} - The response data
   */
  getSessionsForStudent: async (studentId, classId) => {
    try {
      console.log(`Fetching sessions for student ${studentId} in class ${classId}`);
      const response = await api.get(`/sessions/student/${studentId}/class/${classId}`);
      console.log(`Retrieved ${response.data?.length || 0} sessions for student`);
      return response;
    } catch (error) {
      console.error(`Error fetching sessions for student ${studentId} in class ${classId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get all sessions for a class (for advisers)
   * @param {string} classId - The class ID
   * @returns {Promise<Object>} - The response data
   */
  getSessionsForClass: async (classId) => {
    try {
      console.log(`Fetching sessions for class ${classId}`);
      const response = await api.get(`/sessions/class/${classId}`);
      console.log(`Retrieved class sessions data with ${response.data?.length || 0} records`);
      return response;
    } catch (error) {
      console.error(`Error fetching sessions for class ${classId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get session matrix for a class (for advisers)
   * @param {string} classId - The class ID
   * @returns {Promise<Object>} - The response data containing sessions matrix
   */
  getSessionMatrix: async (classId) => {
    try {
      console.log(`Fetching session matrix for class ${classId}`);
      
      // First try the standard endpoint
      try {
        console.log('Trying the standard matrix endpoint with includeBothSemesters=true');
        const response = await api.get(`/sessions/matrix/${classId}?includeBothSemesters=true`);
        
        const matrixData = response.data;
        console.log(`Matrix data retrieved with ${matrixData?.sessions?.length || 0} sessions and ${matrixData?.students?.length || 0} students`);
        
        if (!matrixData || !matrixData.sessions || !matrixData.students) {
          console.warn('Incomplete matrix data received, will try manual loading');
          throw new Error('Incomplete matrix data');
        }
        
        return response;
      } catch (matrixError) {
        console.warn('Standard matrix endpoint failed, trying manual loading', matrixError);
        
        // If the standard endpoint fails, try constructing the matrix manually
        const manualMatrix = await loadSessionMatrix(classId);
        
        if (manualMatrix.sessions.length === 0 || manualMatrix.students.length === 0) {
          console.warn('Manual loading returned empty data');
        }
        
        return { data: manualMatrix };
      }
    } catch (error) {
      console.error('Failed to get session matrix:', error);
      throw error;
    }
  },
  
  /**
   * Update the status of a session
   * @param {string} sessionId - The session completion ID
   * @param {boolean} completed - Whether the session is completed
   * @returns {Promise<Object>} - The response data
   */
  updateSessionStatus: async (sessionId, completed) => {
    try {
      console.log(`Updating session ${sessionId} to completed=${completed}`);
      const response = await api.put(`/sessions/${sessionId}`, { completed });
      console.log('Session update successful:', response.data);
      return response;
    } catch (error) {
      console.error(`Error updating session ${sessionId}:`, error);
      throw error;
    }
  },
  
  /**
   * Bulk update session statuses for a class
   * @param {string} classId - The class ID
   * @param {Array} updates - Array of updates with sessionId and completed status
   * @returns {Promise<Object>} - The response data
   */
  bulkUpdateSessions: async (classId, updates) => {
    try {
      console.log(`Bulk updating ${updates.length} sessions for class ${classId}`);
      const response = await api.put(`/sessions/bulk/${classId}`, { updates });
      console.log('Bulk update successful:', response.data);
      return response;
    } catch (error) {
      console.error(`Error bulk updating sessions for class ${classId}:`, error);
      throw error;
    }
  },
  
  /**
   * Validate and repair session data for a class
   * This ensures all students have all necessary session records
   * @param {string} classId - The class ID
   * @returns {Promise<Object>} - The validation results
   */
  validateClassSessions: async (classId) => {
    try {
      console.log(`Validating sessions for class ${classId}`);
      const response = await api.post(`/sessions/validate/${classId}`);
      console.log('Session validation completed');
      return response.data;
    } catch (error) {
      console.error(`Error validating sessions for class ${classId}:`, error);
      throw error;
    }
  },
  
  /**
   * Save all pending session status changes
   * @param {string} classId - The class ID 
   * @param {Array} changes - The changes to save
   * @returns {Promise<Object>} - The response data
   */
  saveSessionChanges: async (classId, changes) => {
    try {
      return await api.post(`/sessions/save-changes/${classId}`, { changes });
    } catch (error) {
      console.error('Error saving session changes:', error);
      throw error;
    }
  },
  
  /**
   * Archive current semester sessions for a class
   * @param {string} classId - The class ID
   * @returns {Promise<Object>} - The response data
   */
  archiveSessions: async (classId) => {
    try {
      console.log(`Archiving sessions for class ${classId}`);
      const response = await api.post(`/sessions/archive/${classId}`);
      console.log('Session archiving successful:', response.data);
      
      // Check for success field explicitly
      if (response.data && response.data.success === true) {
        return response.data;
      } else {
        // If the success field is false or missing, treat as an error
        const errorMsg = (response.data && response.data.message) ? 
          response.data.message : 'Unknown error archiving sessions';
        console.error('Archive operation failed:', errorMsg);
        
        const error = new Error(errorMsg);
        error.response = response;
        throw error;
      }
    } catch (error) {
      console.error(`Error archiving sessions for class ${classId}:`, error);
      // Enhance the error with the response data if available
      if (error.response && error.response.data) {
        error.message = error.response.data.message || error.message;
      }
      throw error;
    }
  },
  
  /**
   * Load sessions for a specific semester
   * @param {string} classId - The class ID
   * @param {string} semester - The semester ('1st Semester' or '2nd Semester')
   * @returns {Promise<Object>} - The response data
   */
  loadSessions: async (classId, semester) => {
    try {
      console.log(`Loading ${semester} semester sessions for class ${classId}`);
      const response = await api.post(`/sessions/load/${classId}/${semester}`);
      console.log(`${semester} semester session loading successful:`, response.data);
      
      // Check for success field explicitly
      if (response.data && response.data.success === true) {
        return response.data;
      } else {
        // If the success field is false or missing, treat as an error
        const errorMsg = (response.data && response.data.message) ? 
          response.data.message : `Unknown error loading ${semester} sessions`;
        console.error('Load operation failed:', errorMsg);
        
        const error = new Error(errorMsg);
        error.response = response;
        throw error;
      }
    } catch (error) {
      console.error(`Error loading ${semester} semester sessions for class ${classId}:`, error);
      // Enhance the error with the response data if available
      if (error.response && error.response.data) {
        error.message = error.response.data.message || error.message;
      }
      throw error;
    }
  },
  
  /**
   * Get session history by class (for SSP history pages)
   * @param {string} classId - The class ID
   * @param {string} semester - Optional semester filter
   * @returns {Promise<Object>} - The response data
   */
  getSessionHistory: async (classId, semester = null) => {
    try {
      let url = `/sessions/history/${classId}`;
      if (semester) {
        url += `?semester=${semester}`;
      }
      console.log(`Fetching session history for class ${classId}`);
      const response = await api.get(url);
      console.log('Session history retrieved:', response.data);
      
      // Verify response structure
      if (!response.data) {
        console.warn('Empty response received for class history');
        return { data: { success: true, data: [] } };
      }
      
      // Handle case where backend returns non-success response
      if (response.data.success === false) {
        console.warn('Backend reported error:', response.data.message);
        // Return empty data structure rather than throwing
        return { data: { success: true, data: [] } };
      }
      
      // If response doesn't have a 'data' property, wrap it
      if (!response.data.data && Array.isArray(response.data)) {
        return { data: { success: true, data: response.data } };
      }
      
      return response;
    } catch (error) {
      console.error(`Error fetching session history for class ${classId}:`, error);
      
      // For UI consistency, return empty data structure rather than throwing
      console.warn('Returning empty data structure due to error');
      return { 
        data: { 
          success: true, 
          data: [],
          error: error.message,
          errorOccurred: true
        } 
      };
    }
  },
  
  /**
   * Get session history for a student
   * @param {string} studentId - The student ID
   * @param {string} classId - Optional class ID filter
   * @returns {Promise<Object>} - The response data
   */
  getStudentSessionHistory: async (studentId, classId = null) => {
    try {
      let url = `/sessions/history/student/${studentId}`;
      if (classId) {
        url += `?classId=${classId}`;
      }
      console.log(`Fetching session history for student ${studentId}`);
      const response = await api.get(url);
      console.log('Student session history retrieved:', response.data);
      
      // Verify response structure
      if (!response.data) {
        console.warn('Empty response received for student history');
        return { data: { success: true, data: [] } };
      }
      
      // Handle case where backend returns non-success response
      if (response.data.success === false) {
        console.warn('Backend reported error:', response.data.message);
        // Return empty data structure rather than throwing
        return { data: { success: true, data: [] } };
      }
      
      return response;
    } catch (error) {
      console.error(`Error fetching session history for student ${studentId}:`, error);
      
      // For UI consistency, return empty data structure rather than throwing
      console.warn('Returning empty data structure due to error');
      return { 
        data: { 
          success: true, 
          data: [],
          error: error.message,
          errorOccurred: true
        } 
      };
    }
  },
  
  archiveCurrentSessions,
  loadNextSemesterSessions,
  loadSessionMatrix,
}; 

/**
 * Archives the current semester sessions for a specific class
 * @param {string} classId - The ID of the class
 * @returns {Promise<Object>} - Response with success status and message
 */
async function archiveCurrentSessions(classId) {
  try {
    console.log(`Archiving sessions for class ${classId}`)
    const response = await api.post('/sessions/archive', { classId })
    
    if (!response || !response.data) {
      console.error('No response data received from archive API')
      return { success: false, message: 'No response received from server' }
    }
    
    console.log('Archive API response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error archiving sessions:', error)
    
    // Check for specific error cases
    if (error.response?.data?.message) {
      if (error.response.data.message.includes('2nd semester sessions')) {
        // Admin hasn't added 2nd semester sessions yet
        return { 
          success: false, 
          message: 'Admin has not yet configured 2nd semester sessions for this subject',
          type: 'no_second_semester'
        }
      } else if (error.response.data.message.includes('more than 2 missed sessions')) {
        // Some students have too many missed sessions
        return { 
          success: false, 
          message: 'Some students have more than 2 missed sessions',
          type: 'too_many_missed_sessions',
          students: error.response.data.students || []
        }
      }
    }
    
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'Server error during archiving'
    }
  }
}

/**
 * Loads sessions for the next semester for a specific class
 * @param {string} classId - The ID of the class
 * @returns {Promise<Object>} - Response with success status and message
 */
async function loadNextSemesterSessions(classId) {
  try {
    console.log(`Loading next semester sessions for class ${classId}`)
    const response = await api.post('/sessions/load', { 
      classId,
      semester: '2nd Semester'
    })
    
    if (!response || !response.data) {
      console.error('No response data received from load API')
      return { success: false, message: 'No response received from server' }
    }
    
    console.log('Load API response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error loading next semester sessions:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'Server error during loading'
    }
  }
}

/**
 * Helper function to manually construct the session matrix when standard endpoint fails
 * @param {string} classId - The class ID
 * @returns {Promise<Object>} - The constructed matrix data
 */
async function loadSessionMatrix(classId) {
  console.log(`Manually loading session matrix for ${classId}`);
  
  try {
    // Get the class details with students
    const classResponse = await api.get(`/classes/${classId}`);
    
    if (!classResponse.data) {
      throw new Error('No class data found');
    }
    
    const classData = classResponse.data;
    const students = classData.students || [];
    
    // Get subjects for both semesters
    const firstSemesterSubjectId = classData.firstSemester?.sspSubject || classData.sspSubject;
    const secondSemesterSubjectId = classData.secondSemester?.sspSubject;
    
    console.log(`Found subject IDs - First semester: ${firstSemesterSubjectId}, Second semester: ${secondSemesterSubjectId}`);
    
    if (!firstSemesterSubjectId && !secondSemesterSubjectId) {
      throw new Error('No subject found for either semester');
    }
    
    // Combine sessions from both semesters
    let allSessions = [];
    
    // Get first semester subject with sessions
    if (firstSemesterSubjectId) {
      try {
        const firstSemesterResponse = await api.get(`/subjects/${firstSemesterSubjectId}`);
        if (firstSemesterResponse.data && firstSemesterResponse.data.sessions) {
          const firstSemSessions = firstSemesterResponse.data.sessions.map(session => ({
            ...session,
            semester: '1st Semester'
          }));
          allSessions.push(...firstSemSessions);
          console.log(`Added ${firstSemSessions.length} first semester sessions`);
        }
      } catch (error) {
        console.error('Error loading first semester subject:', error);
      }
    }
    
    // Get second semester subject with sessions
    if (secondSemesterSubjectId) {
      try {
        const secondSemesterResponse = await api.get(`/subjects/${secondSemesterSubjectId}`);
        if (secondSemesterResponse.data && secondSemesterResponse.data.sessions) {
          const secondSemSessions = secondSemesterResponse.data.sessions.map(session => ({
            ...session,
            semester: '2nd Semester'
          }));
          allSessions.push(...secondSemSessions);
          console.log(`Added ${secondSemSessions.length} second semester sessions`);
        }
      } catch (error) {
        console.error('Error loading second semester subject:', error);
      }
    }
    
    console.log(`Combined total of ${allSessions.length} sessions from both semesters`);
    
    // For each student, get their session completions
    const studentsWithSessions = await Promise.all(
      students.map(async (student) => {
        try {
          // Request sessions from both semesters
          const sessionResponse = await api.get(`/sessions/student/${student._id}/class/${classId}?includeBothSemesters=true`);
          const sessionData = sessionResponse.data || [];
          
          // Create a sessions map
          const sessions = {};
          for (const session of allSessions) {
            // Find the completion for this session
            const completion = sessionData.find(s => 
              s.session && (s.session._id === session._id || s.session === session._id)
            );
            
            sessions[session._id] = {
              id: completion?._id || null,
              completed: completion?.completed || false,
              completionDate: completion?.completionDate || null,
              semester: session.semester || completion?.semester || '1st Semester'
            };
          }
          
          return {
            id: student._id,
            name: `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.trim() || 'Unknown Student',
            idNumber: student.user?.idNumber || 'Unknown ID',
            userId: student.user?._id || null,
            sessions
          };
        } catch (error) {
          console.warn(`Error loading sessions for student ${student._id}:`, error);
          return {
            id: student._id,
            name: `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.trim() || 'Unknown Student',
            idNumber: student.user?.idNumber || 'Unknown ID',
            userId: student.user?._id || null,
            sessions: {}
          };
        }
      })
    );
    
    return {
      sessions: allSessions,
      students: studentsWithSessions
    };
  } catch (error) {
    console.error('Error constructing session matrix manually:', error);
    return {
      sessions: [],
      students: []
    };
  }
}

/**
 * Archive the current semester sessions for a specific student
 * @param {string} classId - The class ID
 * @param {string} studentId - The student ID
 * @returns {Promise<Object>} - The response data
 */
async function archiveStudentSessions(classId, studentId) {
  try {
    console.log(`Archiving sessions for student ${studentId} in class ${classId}`);
    const response = await api.post('/sessions/archive-student', { 
      classId,
      studentId
    });
    
    console.log('Student session archiving response:', response.data);
    
    if (response.data && response.data.success === true) {
      return response.data;
    } else {
      const errorMsg = (response.data && response.data.message) ? 
        response.data.message : 'Unknown error archiving student sessions';
      console.error('Archive operation failed:', errorMsg);
      
      const error = new Error(errorMsg);
      error.response = response;
      throw error;
    }
  } catch (error) {
    console.error(`Error archiving sessions for student ${studentId}:`, error);
    if (error.response && error.response.data) {
      error.message = error.response.data.message || error.message;
    }
    throw error;
  }
}

/**
 * Load sessions for a specific student and semester
 * @param {string} classId - The class ID
 * @param {string} studentId - The student ID
 * @param {string} semester - The semester ('1st Semester' or '2nd Semester')
 * @returns {Promise<Object>} - The response data
 */
async function loadStudentSessions(classId, studentId, semester) {
  try {
    console.log(`Loading ${semester} semester sessions for student ${studentId} in class ${classId}`);
    const response = await api.post('/sessions/load-student', {
      classId,
      studentId,
      semester
    });
    
    console.log(`${semester} semester session loading for student:`, response.data);
    
    if (response.data && response.data.success === true) {
      return response.data;
    } else {
      const errorMsg = (response.data && response.data.message) ? 
        response.data.message : `Unknown error loading ${semester} sessions for student`;
      console.error('Load operation failed:', errorMsg);
      
      const error = new Error(errorMsg);
      error.response = response;
      throw error;
    }
  } catch (error) {
    console.error(`Error loading ${semester} semester sessions for student ${studentId}:`, error);
    if (error.response && error.response.data) {
      error.message = error.response.data.message || error.message;
    }
    throw error;
  }
} 