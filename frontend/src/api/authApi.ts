import { axiosClient } from './axiosClient';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types';

export const authApi = {
  login: (data: LoginRequest) =>
    axiosClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    axiosClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  getCurrentUser: () =>
    axiosClient.get<AuthResponse>('/auth/me').then((r) => r.data),

  /** Asks the server to clear the ll_jwt HttpOnly cookie */
  logout: () => axiosClient.post('/auth/logout'),
};
