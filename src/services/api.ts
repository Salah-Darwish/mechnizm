import axios from 'axios';

// Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Send token in both headers for compatibility
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['X-Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// List of public endpoints that should NOT redirect on 401
const publicEndpoints = [
  '/products',
  '/products/',
];

// Check if the URL is a public endpoint
const isPublicEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;
  // Check if URL matches public endpoints (exact match or starts with)
  return publicEndpoints.some(endpoint => {
    // Handle query params
    const urlPath = url.split('?')[0];
    // Check exact match or if it's a product detail endpoint (e.g., /products/123)
    return urlPath === endpoint || 
           urlPath.startsWith('/products/') ||
           urlPath.startsWith('/products?');
  });
};

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url;
      
      // Only redirect to login for protected endpoints
      // Public endpoints like /products should not redirect
      if (!isPublicEndpoint(requestUrl)) {
        localStorage.removeItem('auth_token');
        // Optionally redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
