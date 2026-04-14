import { useQuery } from '@tanstack/react-query';
import { servicesApi } from '@/api/servicesApi';

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
