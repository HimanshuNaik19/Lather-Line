import { axiosClient } from './axiosClient';
import type { ServiceType } from '@/types';

export const servicesApi = {
  /** Fetch all active services */
  getActiveServices: async (): Promise<ServiceType[]> => {
    const response = await axiosClient.get('/services');
    return response.data;
  },
};
