import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '@/api/axiosClient';
import type { Order } from '@/types';

export function useMyDeliveries() {
  return useQuery({
    queryKey: ['deliveries', 'mine'],
    queryFn: async () => {
      const response = await axiosClient.get('/deliveries/mine');
      return response.data as Order[];
    },
  });
}

export function useAvailableDeliveries() {
  return useQuery({
    queryKey: ['deliveries', 'available'],
    queryFn: async () => {
      const response = await axiosClient.get('/deliveries/available');
      return response.data as Order[];
    },
  });
}

export function useClaimDelivery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await axiosClient.post(`/deliveries/${orderId}/claim`);
      return response.data as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
  });
}

export function useAssignDriver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, driverId }: { orderId: string; driverId: number }) => {
      const response = await axiosClient.post(`/deliveries/${orderId}/assign/${driverId}`);
      return response.data as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
  });
}

export function useDriverList() {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const response = await axiosClient.get('/deliveries/drivers');
      return response.data as Array<{ id: number; fullName: string; email: string }>;
    },
  });
}
