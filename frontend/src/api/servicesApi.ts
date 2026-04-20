import { axiosClient } from './axiosClient';
import type { ServiceType } from '@/types';

export const servicesApi = {
  /** Fetch all active services */
  getActiveServices: async (): Promise<ServiceType[]> => {
    const response = await axiosClient.get('/services');
    return response.data;
  },

  /** Admin: fetch all services */
  getAllServices: async (): Promise<ServiceType[]> => {
    const response = await axiosClient.get('/services/all');
    return response.data;
  },

  /** Admin: create a new service */
  createService: async (payload: Omit<ServiceType, 'id'>): Promise<ServiceType> => {
    const response = await axiosClient.post('/services', payload);
    return response.data;
  },

  /** Admin: update service */
  updateService: async (id: number, payload: Omit<ServiceType, 'id'>): Promise<ServiceType> => {
    const response = await axiosClient.put(`/services/${id}`, payload);
    return response.data;
  },

  /** Admin: delete service */
  deleteService: async (id: number): Promise<void> => {
    await axiosClient.delete(`/services/${id}`);
  },
};
