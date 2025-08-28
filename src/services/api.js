import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Create axios instance with proper base URL handling
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://sspms-backend.onrender.com/api';

const api = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Production-safe request logging (only in development)
if (import.meta.env.DEV) {
  api.interceptors.request.use(request => {
    console.log('API Request:', {
      url: request.url,
      method: request.method
    });
    return request;
  });

  api.interceptors.response.use(
    response => response,
    error => {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message
      });
      return Promise.reject(error);
    }
  );
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      
      // Only redirect if we're in the browser
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me')
};

// Advisers services
export const adviserService = {
  getAll: () => api.get('/advisers'),
  getById: (id) => api.get(`/advisers/${id}`),
  create: (adviser) => api.post('/advisers', adviser),
  update: (id, adviser) => api.put(`/advisers/${id}`, adviser),
  delete: (id) => api.delete(`/advisers/${id}`)
};

// Classes services
export const classService = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
  create: (classData) => api.post('/classes', classData),
  update: (id, classData) => api.put(`/classes/${id}`, classData),
  delete: (id) => api.delete(`/classes/${id}`),
  getAdvisoryClasses: () => api.get('/classes/advisory')
};

// Subjects services
export const subjectService = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (subject) => api.post('/subjects', subject),
  update: (id, subject) => api.put(`/subjects/${id}`, subject),
  delete: (id) => api.delete(`/subjects/${id}`),
  getSessions: (id) => api.get(`/subjects/${id}/sessions`)
};

// Students services
export const studentService = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (student) => api.post('/students', student),
  update: (id, student) => api.put(`/students/${id}`, student),
  delete: (id) => api.delete(`/students/${id}`),
  importStudents: (studentsData) => api.post('/students/import', studentsData),
  getByClass: (classId) => api.get(`/students/class/${classId}`),
  getByClasses: (classIds) => api.post('/students/classes', { classIds }),
  checkPromotionConflict: (currentClassId, nextClassId) => api.post('/students/check-promotion-conflict', { currentClassId, nextClassId })
};

// Announcements services
export const announcementService = {
  getAll: () => api.get('/announcements'),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (announcement) => api.post('/announcements', announcement),
  update: (id, announcement) => api.put(`/announcements/${id}`, announcement),
  delete: (id) => api.delete(`/announcements/${id}`),
  pin: (id, isPinned) => api.put(`/announcements/${id}/pin`, { isPinned })
};

// Survey services
export const surveyService = {
  submitSurvey: (formData) => {
    return api.post('/surveys/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getMySubmissions: () => api.get('/surveys/my-submissions'),
  getAllSubmissions: () => api.get('/surveys/all'),
  updateStatus: (id, status) => api.put(`/surveys/${id}/status`, { status })
};

export default api;