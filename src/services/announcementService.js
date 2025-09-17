import api from './api';

export const announcementService = {
  getAll: async () => {
    const response = await api.get('/announcements');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  },
  create: async (announcement) => {
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', announcement.title);
    formData.append('content', announcement.content);
    formData.append('targetAudience', announcement.targetAudience);
    formData.append('isPinned', announcement.isPinned);
    
    // Add target classes if provided
    if (announcement.targetClasses && announcement.targetClasses.length > 0) {
      formData.append('targetClasses', JSON.stringify(announcement.targetClasses));
    }
    
    // Add image file if provided
    if (announcement.image && announcement.image instanceof File) {
      formData.append('image', announcement.image);
    }
    
    const response = await api.post('/announcements', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  update: async (id, announcement) => {
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', announcement.title);
    formData.append('content', announcement.content);
    formData.append('targetAudience', announcement.targetAudience);
    formData.append('isPinned', announcement.isPinned);
    
    // Add target classes if provided
    if (announcement.targetClasses && announcement.targetClasses.length > 0) {
      formData.append('targetClasses', JSON.stringify(announcement.targetClasses));
    }
    
    // Handle image updates
    if (announcement.removeImage) {
      formData.append('removeImage', 'true');
    } else if (announcement.image && announcement.image instanceof File) {
      formData.append('image', announcement.image);
    }
    
    const response = await api.put(`/announcements/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  },
  pin: async (id, isPinned) => {
    const response = await api.put(`/announcements/${id}/pin`, { isPinned });
    return response.data;
  },
  getActiveClasses: async () => {
    const response = await api.get('/announcements/classes/active');
    return response.data;
  },
  test: async () => {
    const response = await api.get('/announcements/test');
    return response.data;
  },
  like: async (id) => {
    const response = await api.post(`/announcements/${id}/like`);
    return response.data;
  },
  getImageUrl: (filename) => {
    return `${api.defaults.baseURL}/announcements/images/${filename}`;
  }
}; 