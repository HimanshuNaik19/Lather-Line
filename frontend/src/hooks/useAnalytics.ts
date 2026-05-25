import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analyticsApi';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsApi.getDashboard,
    staleTime: 60_000, // refresh every minute
  });
}
