import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '@/api/axiosClient';

export function useCheckoutSession() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await axiosClient.post(`/payments/checkout/${orderId}`);
      return response.data as { checkoutUrl: string };
    },
    onSuccess: (data) => {
      // Redirect customer to the Stripe checkout page
      window.location.href = data.checkoutUrl;
    },
  });
}

export function useMarkAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      await axiosClient.post(`/payments/mark-paid/${orderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
