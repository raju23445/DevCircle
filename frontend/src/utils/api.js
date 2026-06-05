import axios from 'axios';

// ✅ Use environment variable in production, proxy in development
const BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : '/api';

console.log('API Base URL:', BASE_URL); // helps debug

const api = axios.create({ 
  baseURL: BASE_URL,
  timeout: 30000,  // 30 seconds — Render free tier can be slow to wake up
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err.response?.status, err.response?.data);
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;