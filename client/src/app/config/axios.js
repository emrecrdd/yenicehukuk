import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL =
  import.meta.env.VITE_API_URL || 'https://yenicehukuk.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use((config) => {
  const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');

  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  return config;
});

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');

        if (tokens?.refreshToken) {
          const response = await axiosInstance.post('/auth/refresh-token', {
            refreshToken: tokens.refreshToken,
          });

          const { accessToken, refreshToken } = response.data.data;

          const newTokens = { accessToken, refreshToken };

          localStorage.setItem('tokens', JSON.stringify(newTokens));

          // header güncelle
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return axiosInstance(originalRequest);
        }
      } catch (err) {
        console.error('Refresh token error:', err);

        localStorage.removeItem('tokens');
        localStorage.removeItem('user');
        window.location.href = '/login';

        return Promise.reject(err);
      }
    }

    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;