import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';
export const AUTH_UNAUTHORIZED_EVENT = 'll-auth:unauthorized';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url ?? '');
    if (error.response?.status === 401 && !requestUrl.startsWith('/auth/')) {
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  },
);
