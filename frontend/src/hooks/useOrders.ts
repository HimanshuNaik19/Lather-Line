import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/ordersApi';
import type { CreateOrderRequest, StatusUpdateRequest } from '@/types';

export const ORDER_KEYS = {
  all: ['orders'] as const,
  byId: (id: number) => ['orders', id] as const,
};

/** Fetch the current user's orders */
export function useMyOrders() {
  return useQuery({
    queryKey: ORDER_KEYS.all,
    queryFn: ordersApi.getMyOrders,
    staleTime: 30_000,
  });
}

/** Fetch all orders for admins */
export function useAllOrders() {
  return useQuery({
    queryKey: [...ORDER_KEYS.all, 'admin-all'],
    queryFn: ordersApi.getAllOrders,
    staleTime: 30_000,
  });
}

/** Fetch a single order */
export function useOrder(id: number) {
  return useQuery({
    queryKey: ORDER_KEYS.byId(id),
    queryFn: () => ordersApi.getOrderById(id),
    enabled: !!id,
  });
}

/** Create a new order */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
    },
  });
}

/** Update order status (WASHER / ADMIN) */
export function useUpdateOrderStatus(orderId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StatusUpdateRequest) => ordersApi.updateStatus(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.byId(orderId) });
    },
  });
}
