import { axiosClient } from './axiosClient';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types';

export const authApi = {
  login: (data: LoginRequest) =>
    axiosClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    axiosClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),
};
