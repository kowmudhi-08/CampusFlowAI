import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const isPublicAuthUrl =
      config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/register') ||
      config.url?.includes('/auth/setup-admin') ||
      config.url?.includes('/auth/admin-setup-status');

    if (!isPublicAuthUrl) {
      const token = localStorage.getItem('campusflow_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isPublicAuthUrl =
        error.config.url?.includes('/auth/login') ||
        error.config.url?.includes('/auth/register') ||
        error.config.url?.includes('/auth/setup-admin') ||
        error.config.url?.includes('/auth/admin-setup-status');

      if (!isPublicAuthUrl) {
        localStorage.removeItem('campusflow_token');
        localStorage.removeItem('campusflow_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
