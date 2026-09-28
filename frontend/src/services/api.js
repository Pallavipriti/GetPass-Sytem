import axios from 'axios';

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach token if exists
// Add a request interceptor to ensure token is always included
axiosInstance.interceptors.request.use(
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

// Add a response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on login endpoint failures
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');
    
    if (error.response?.status === 401 && !isLoginEndpoint) {
      // Token expired or invalid
      localStorage.removeItem('token');
      // Use window.location for redirect, but avoid redirect loops
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Export simple methods for easier usage
const axiosApi = {
  get: async (url, config = {}) => {
    try {
      console.log('GET', url, config);
      const response = await axiosInstance.get(url, config);
      console.log('Response:', response.data);
      return response; // Return full response object
    } catch (error) {
      console.error('API error:', error.response?.data || error.message);
      throw error;
    }
  },

  post: async (url, data, config = {}) => {
    try {
      console.log('POST', url, data);
      const response = await axiosInstance.post(url, data, config);
      console.log('Response:', response.data);
      return response; // Return full response object
    } catch (error) {
      console.error('API error:', error.response?.data || error.message);
      throw error;
    }
  },

  put: async (url, data, config = {}) => {
    try {
      console.log('PUT', url, data);
      const response = await axiosInstance.put(url, data, config);
      console.log('Response:', response.data);
      return response;
    } catch (error) {
      console.error('API error:', error.response?.data || error.message);
      throw error;
    }
  },

  patch: async (url, data, config = {}) => {
    try {
      console.log('PATCH', url, data);
      const response = await axiosInstance.patch(url, data, config);
      console.log('Response:', response.data);
      return response;
    } catch (error) {
      console.error('API error:', error.response?.data || error.message);
      throw error;
    }
  },

  delete: async (url, config = {}) => {
    try {
      console.log('DELETE', url);
      const response = await axiosInstance.delete(url, config);
      console.log('Response:', response.data);
      return response;
    } catch (error) {
      console.error('API error:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Also export the raw instance if needed
export { axiosInstance };
export default axiosApi;