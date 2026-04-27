import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/ordersApi';
import type { CreateOrderRequest, Order, PageResponse, StatusUpdateRequest } from '@/types';

const DEFAULT_LIST_SIZE = 100;

export const ORDER_KEYS = {
  all: ['orders'] as const,
  my: ['orders', 'my'] as const,
  admin: ['orders', 'admin'] as const,
  byId: (id: number) => ['orders', 'detail', id] as const,
  myPage: (page: number, size: number) => ['orders', 'my', page, size] as const,
  adminPage: (page: number, size: number) => ['orders', 'admin', page, size] as const,
};

export function useMyOrdersPage(page: number, size: number) {
  return useQuery<PageResponse<Order>>({
    queryKey: ORDER_KEYS.myPage(page, size),
    queryFn: () => ordersApi.getMyOrders({ page, size }),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });
}

export function useAllOrdersPage(page: number, size: number) {
  return useQuery<PageResponse<Order>>({
    queryKey: ORDER_KEYS.adminPage(page, size),
    queryFn: () => ordersApi.getAllOrders({ page, size }),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });
}

export function useMyOrders(size = DEFAULT_LIST_SIZE) {
  const query = useMyOrdersPage(0, size);
  return { ...query, data: query.data?.content ?? [] };
}

export function useAllOrders(size = DEFAULT_LIST_SIZE) {
  const query = useAllOrdersPage(0, size);
  return { ...query, data: query.data?.content ?? [] };
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: ORDER_KEYS.byId(id),
    queryFn: () => ordersApi.getOrderById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
    },
  });
}

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
