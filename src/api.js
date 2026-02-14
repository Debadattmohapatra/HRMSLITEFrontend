import axios from 'axios';

// Use Render backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://hrmslitebackend-4.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds for Render free tier
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
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

// Response interceptor to handle the backend response format
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    
    // If response has the standard format { success, data, message }
    if (response.data && 'success' in response.data) {
      if (response.data.success) {
        return response.data.data; // Return just the data
      } else {
        // Handle error response
        return Promise.reject({
          response: {
            data: {
              message: response.data.message || 'An error occurred',
              errors: response.data.errors
            }
          }
        });
      }
    }
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Format error consistently
    if (error.response) {
      // Server responded with error
      const errorData = error.response.data;
      const errorMessage = errorData?.message || 
                          errorData?.errors || 
                          error.message || 
                          'An error occurred';
      
      return Promise.reject({
        response: {
          data: {
            message: errorMessage,
            status: error.response.status
          }
        },
        message: errorMessage
      });
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server. Backend URL:', API_BASE_URL);
      return Promise.reject({
        response: {
          data: {
            message: 'Cannot connect to server. Please check if backend is running at ' + API_BASE_URL
          }
        },
        message: 'Network Error'
      });
    } else {
      // Something else happened
      return Promise.reject({
        response: {
          data: {
            message: error.message || 'An unexpected error occurred'
          }
        },
        message: error.message
      });
    }
  }
);

// Employee API
export const employeeAPI = {
  getAll: async () => {
    try {
      return await api.get('/employees/');
    } catch (error) {
      throw error;
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/employees/${id}/`);
    } catch (error) {
      throw error;
    }
  },
  create: async (data) => {
    try {
      return await api.post('/employees/', data);
    } catch (error) {
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      return await api.put(`/employees/${id}/`, data);
    } catch (error) {
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await api.delete(`/employees/${id}/`);
    } catch (error) {
      throw error;
    }
  },
  getAttendance: async (id, params) => {
    try {
      return await api.get(`/employees/${id}/attendance/`, { params });
    } catch (error) {
      throw error;
    }
  },
  search: async (query) => {
    try {
      return await api.get('/employees/', { 
        params: { search: query } 
      });
    } catch (error) {
      throw error;
    }
  },
};

// Attendance API
export const attendanceAPI = {
  getAll: async (params) => {
    try {
      const response = await api.get('/attendance/', { params });
      console.log('Attendance getAll response:', response);
      return response;
    } catch (error) {
      console.error('Attendance getAll error:', error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/attendance/${id}/`);
    } catch (error) {
      throw error;
    }
  },
  create: async (data) => {
    try {
      console.log('Attendance create - sending data:', data);
      const response = await api.post('/attendance/', data);
      console.log('Attendance create - response:', response);
      return response;
    } catch (error) {
      console.error('Attendance create - error:', error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      return await api.put(`/attendance/${id}/`, data);
    } catch (error) {
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await api.delete(`/attendance/${id}/`);
    } catch (error) {
      throw error;
    }
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    try {
      return await api.get('/dashboard/stats/');
    } catch (error) {
      throw error;
    }
  },
};

export default api;