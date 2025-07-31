import api from './api';

export const sessionService = {
  /**
   * Archive the current semester sessions for a specific student
   * @param {string} classId - The class ID
   * @param {string} studentId - The student ID
   * @param {boolean} promoteToNewYearLevel - Whether this is for a year level promotion
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
   * @param {Object|string} params - Parameters object with filters or legacy semester string
   * @returns {Promise<Object>} - The response data
   */
  getSessionHistory: async (classId, params = {}) => {
    try {
      let url = `/sessions/history/${classId}`;
      
      // Handle legacy string parameter (for backward compatibility)
      if (typeof params === 'string') {
        if (params) {
          url += `?semester=${params}`;
        }
      } else if (params && typeof params === 'object') {
        // Handle new object parameter format
        const urlParams = new URLSearchParams();
        
        if (params.semester) {
          urlParams.append('semester', params.semester);
        }
        
        if (params.schoolYear) {
          urlParams.append('schoolYear', params.schoolYear);
        }
        
        if (urlParams.toString()) {
          url += `?${urlParams.toString()}`;
        }
      }
      
      console.log(`Fetching session history for class ${classId} with URL: ${url}`);
      const response = await api.get(url);
      console.log('Session history retrieved:', response.data);
      
      // Verify response structure
      if (!response.data) {
        console.warn('Empty response received for class history');
        return { data: { success: true, data: [], schoolYears: [] } };
      }
      
      // Handle case where backend returns non-success response
      if (response.data.success === false) {
        console.warn('Backend reported error:', response.data.message);
        // Return empty data structure rather than throwing
        return { data: { success: true, data: [], schoolYears: [] } };
      }
      
      // If response doesn't have a 'data' property, wrap it
      if (!response.data.data && Array.isArray(response.data)) {
        return { data: { success: true, data: response.data, schoolYears: [] } };
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
          schoolYears: [],
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
  
  /**
   * Clear current sessions for graduated students
   * @param {string} classId - The class ID
   * @param {Array} studentIds - Array of student IDs to clear sessions for
   * @returns {Promise<Object>} - The response data
   */
  clearCurrentSessions: async (classId, studentIds) => {
    try {
      console.log(`Clearing current sessions for ${studentIds.length} graduated students in class ${classId}`);
      const response = await api.post('/sessions/clear-current', {
        classId,
        studentIds
      });
      
      console.log('Clear current sessions response:', response.data);
      
      if (response.data && response.data.success === true) {
        return response.data;
      } else {
        const errorMsg = (response.data && response.data.message) ? 
          response.data.message : 'Unknown error clearing current sessions';
        console.error('Clear current sessions operation failed:', errorMsg);
        
        const error = new Error(errorMsg);
        error.response = response;
        throw error;
      }
    } catch (error) {
      console.error(`Error clearing current sessions for graduated students:`, error);
      if (error.response && error.response.data) {
        error.message = error.response.data.message || error.message;
      }
      throw error;
    }
  },
  
  /**
   * Get SSP dashboard data for student - progress, next session, recent completed
   * This replicates the logic from SSP.vue to ensure consistency
   * @param {string} studentId - The student ID
   * @param {string} classId - The class ID
   * @returns {Promise<Object>} - Dashboard data object
   */
  getSSPDashboardData: async (studentId, classId) => {
    try {
      console.log(`Fetching SSP dashboard data for student ${studentId} in class ${classId}`);
      
      // Try using the dedicated backend endpoint first
      try {
        const backendResponse = await api.get(`/sessions/dashboard/${studentId}/${classId}`);
        
        if (backendResponse && backendResponse.data && backendResponse.data.success) {
          console.log('Successfully got dashboard data from backend endpoint');
          return backendResponse.data;
        }
      } catch (backendError) {
        console.warn('Backend dashboard endpoint failed, falling back to frontend calculation:', backendError.message);
      }
      
      // Fallback to frontend calculation if backend endpoint fails
      console.log('Using frontend calculation as fallback');
      
      // Get raw session data
      const sessionResponse = await api.get(`/sessions/student/${studentId}/class/${classId}`);
      
      if (!sessionResponse || !Array.isArray(sessionResponse.data)) {
        throw new Error('Invalid session response');
      }
      
      const allSessions = sessionResponse.data;
      console.log(`Got ${allSessions.length} total sessions for dashboard`);
      
      // Categorize sessions by semester (same logic as SSP.vue)
      const firstSemSessions = allSessions.filter(s => 
        !s.semester || s.semester === '1st Semester');
      
      const secondSemSessions = allSessions.filter(s => 
        s.semester === '2nd Semester');
      
      const completedFirstSemSessions = allSessions.filter(s => 
        s.semester === '1st Semester (Completed)');
      
      console.log(`Sessions by semester: 1st=${firstSemSessions.length}, 2nd=${secondSemSessions.length}, 1st(Completed)=${completedFirstSemSessions.length}`);
      
      // Determine which semester's sessions to use for dashboard (same logic as SSP.vue)
      let currentSessions = [];
      let currentSemesterName = '1st Semester';
      
      if (secondSemSessions.length > 0) {
        // If there are 2nd semester sessions, prioritize showing those
        console.log("Using 2nd semester sessions for dashboard");
        currentSessions = secondSemSessions;
        currentSemesterName = '2nd Semester';
      } else if (completedFirstSemSessions.length > 0) {
        // If first semester is completed, show those
        console.log("Using completed 1st semester sessions for dashboard");
        currentSessions = completedFirstSemSessions;
        currentSemesterName = '1st Semester (Completed)';
      } else {
        // Otherwise show 1st semester sessions
        console.log("Using 1st semester sessions for dashboard");
        currentSessions = firstSemSessions;
        currentSemesterName = '1st Semester';
      }
      
      // Sort sessions by day number
      currentSessions.sort((a, b) => a.sessionDay - b.sessionDay);
      
      // Calculate progress
      const completedCount = currentSessions.filter(s => s.completed).length;
      const totalCount = currentSessions.length;
      const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      
      // Find next session to complete
      const nextSession = currentSessions.find(s => !s.completed);
      
      // Get recent completed sessions (last 3, sorted by completion date)
      const recentCompleted = currentSessions
        .filter(s => s.completed && (s.completionDate || s.updatedAt))
        .sort((a, b) => {
          const dateA = new Date(a.completionDate || a.updatedAt);
          const dateB = new Date(b.completionDate || b.updatedAt);
          return dateB - dateA; // Most recent first
        })
        .slice(0, 3)
        .map(s => ({
          day: s.sessionDay,
          title: s.sessionTitle,
          completedAt: s.completionDate || s.updatedAt
        }));
      
      console.log(`Dashboard data calculated: ${progressPercentage}% progress, next session: ${nextSession ? `Day ${nextSession.sessionDay}` : 'None'}, recent completed: ${recentCompleted.length}`);
      
      return {
        success: true,
        currentSemester: currentSemesterName,
        totalSessions: totalCount,
        completedSessions: completedCount,
        progressPercentage: progressPercentage,
        nextSession: nextSession ? {
          day: nextSession.sessionDay,
          title: nextSession.sessionTitle,
          id: nextSession._id
        } : null,
        recentCompleted: recentCompleted,
        allSessions: currentSessions // Include all for debugging if needed
      };
      
    } catch (error) {
      console.error(`Error fetching SSP dashboard data for student ${studentId}:`, error);
      
      // Return default/empty data structure to prevent dashboard crashes
      return {
        success: false,
        currentSemester: '1st Semester',
        totalSessions: 0,
        completedSessions: 0,
        progressPercentage: 0,
        nextSession: null,
        recentCompleted: [],
        allSessions: [],
        error: error.message
      };
    }
  },

  // Complete session with attachment
  completeSessionWithAttachment: (sessionId, formData) => {
    return api.put(`/sessions/${sessionId}/complete-with-attachment`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Get session attachment URL
  getSessionAttachmentUrl: (sessionId) => {
    return `/api/sessions/${sessionId}/attachment`;
  },

  // Check if session has attachment
  hasSessionAttachment: (session) => {
    return !!(session.hasAttachment || session.attachmentUrl || session.attachmentOriginalName || (session.attachments && session.attachments.length > 0));
  },

  // Reject session attachment with reason (adviser only)
  rejectAttachment: async (sessionId, rejectionReason) => {
    try {
      const response = await api.put(`/sessions/${sessionId}/reject-attachment`, {
        rejectionReason: rejectionReason
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting attachment:', error);
      throw error;
    }
  },

  // Unsubmit session attachment (student only)
  unsubmitAttachment: async (sessionId) => {
    try {
      const response = await api.put(`/sessions/${sessionId}/unsubmit-attachment`);
      return response.data;
    } catch (error) {
      console.error('Error unsubmitting attachment:', error);
      throw error;
    }
  }
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
 * @param {boolean} promoteToNewYearLevel - Whether this is for a year level promotion
 * @returns {Promise<Object>} - The response data
 */
async function archiveStudentSessions(classId, studentId, promoteToNewYearLevel = false) {
  try {
    console.log(`Archiving sessions for student ${studentId} in class ${classId}${promoteToNewYearLevel ? ' (year level promotion)' : ''}`);
    const response = await api.post('/sessions/archive-student', { 
      classId,
      studentId,
      promoteToNewYearLevel
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