import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '@/api/servicesApi';
import type { ServiceType } from '@/types';

export const SERVICE_KEYS = {
  all: ['services'] as const,
};

export function useActiveServices() {
  return useQuery({
    queryKey: SERVICE_KEYS.all,
    queryFn: servicesApi.getActiveServices,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAllServices() {
  return useQuery({
    queryKey: [...SERVICE_KEYS.all, 'admin-all'],
    queryFn: servicesApi.getAllServices,
    staleTime: 60_000,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<ServiceType, 'id'>) => servicesApi.createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICE_KEYS.all });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Omit<ServiceType, 'id'> }) =>
      servicesApi.updateService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICE_KEYS.all });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => servicesApi.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICE_KEYS.all });
    },
  });
}
