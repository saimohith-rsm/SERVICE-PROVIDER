import axios from 'axios';

// Dynamically normalize API base URL for Render or local proxy
let rawBaseUrl = import.meta.env.VITE_API_URL || '/api';
if (rawBaseUrl.startsWith('http') && !rawBaseUrl.endsWith('/api') && !rawBaseUrl.endsWith('/api/')) {
  rawBaseUrl = rawBaseUrl.replace(/\/+$/, '') + '/api';
}

const api = axios.create({
  baseURL: rawBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('serveease_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token if expired and not on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('serveease_token');
        localStorage.removeItem('serveease_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

