import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  // We point to /api because Nginx handles the proxy to the backend
  baseURL: '/api', 
});

// Request Interceptor: Automatically adds the Token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;