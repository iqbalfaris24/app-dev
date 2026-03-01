import axios from 'axios';
import { TokenManager } from '../utils/tokenManager';

const api = axios.create({
  // Membaca dari .env
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tambahkan Bearer Token ke setiap request jika ada
api.interceptors.request.use(async (config) => {
  const token = await TokenManager.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: try refresh token on 401 once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const currentToken = await TokenManager.get();
        const refreshRes = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh-token`, {}, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        const newToken = refreshRes.data?.data?.token || refreshRes.data?.token;
        if (newToken) {
          await TokenManager.save(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (e) {
        await TokenManager.remove();
      }
    }
    return Promise.reject(error);
  }
);

export default api;