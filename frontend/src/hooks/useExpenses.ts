import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '@/api/axiosClient';
import type { Expense, ProfitabilityReport } from '@/types';

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data } = await axiosClient.get<Expense[]>('/expenses');
      return data;
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expense: Partial<Expense>) => {
      const { data } = await axiosClient.post<Expense>('/expenses', expense);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['profitability'] });
    },
  });
}

export function useProfitabilityReport() {
  return useQuery({
    queryKey: ['profitability'],
    queryFn: async () => {
      const { data } = await axiosClient.get<ProfitabilityReport>('/analytics/profitability');
      return data;
    },
  });
}
