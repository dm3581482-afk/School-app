import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updatePassword: (passwords) => api.put('/auth/update-password', passwords),
  getAllUsers: (params) => api.get('/auth/users', { params })
};

// Appointment API
export const appointmentAPI = {
  create: (data) => api.post('/appointments', data),
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  updateStatus: (id, data) => api.put(`/appointments/${id}/status`, data),
  delete: (id) => api.delete(`/appointments/${id}`)
};

// Announcement API
export const announcementAPI = {
  create: (data) => api.post('/announcements', data),
  getAll: (params) => api.get('/announcements', { params }),
  getById: (id) => api.get(`/announcements/${id}`),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`)
};

// Community API
export const communityAPI = {
  create: (data) => api.post('/community', data),
  getAll: (params) => api.get('/community', { params }),
  getById: (id) => api.get(`/community/${id}`),
  update: (id, data) => api.put(`/community/${id}`, data),
  delete: (id) => api.delete(`/community/${id}`),
  togglePin: (id) => api.put(`/community/${id}/pin`)
};

// Map API
export const mapAPI = {
  upload: (data) => api.post('/maps', data),
  getAll: () => api.get('/maps'),
  getActive: () => api.get('/maps/active'),
  activate: (id) => api.put(`/maps/${id}/activate`),
  update: (id, data) => api.put(`/maps/${id}`, data),
  delete: (id) => api.delete(`/maps/${id}`),
  addMarker: (id, data) => api.post(`/maps/${id}/markers`, data),
  deleteMarker: (id, markerId) => api.delete(`/maps/${id}/markers/${markerId}`)
};

// Notification API
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count')
};
