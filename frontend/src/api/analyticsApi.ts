import { axiosClient } from './axiosClient';
import type { DashboardStats } from '@/types/analytics';

export const analyticsApi = {
  getDashboard: () =>
    axiosClient.get<DashboardStats>('/analytics/dashboard').then(r => r.data),
};
