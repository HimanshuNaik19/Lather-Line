import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/ordersApi';
import type { CreateOrderRequest, PosCreateRequest, StatusUpdateRequest } from '@/types';

export const ORDER_KEYS = {
  all:        ['orders'] as const,
  mine:       ['orders', 'mine'] as const,
  staff:      ['orders', 'staff'] as const,
  active:     ['orders', 'active'] as const,
  detail:     (id: string) => ['orders', id] as const,
};

// ── Customer hooks ────────────────────────────────────────────────────────────
export function useMyOrders() {
  return useQuery({ queryKey: ORDER_KEYS.mine, queryFn: ordersApi.getMyOrders });
}

export function useMyOrdersPage(page: number, size: number) {
  return useQuery({
    queryKey: [...ORDER_KEYS.mine, 'paged', page, size],
    queryFn: () => ordersApi.getMyOrdersPaged(page, size),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersApi.createOrder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORDER_KEYS.all });
      qc.invalidateQueries({ queryKey: ORDER_KEYS.mine });
    },
  });
}

// ── Staff hooks (Admin / Manager / Washer) ────────────────────────────────────
export function useAllOrders() {
  return useQuery({ queryKey: ORDER_KEYS.staff, queryFn: ordersApi.getAllOrders });
}

export function useAllOrdersPage(page: number, size: number) {
  return useQuery({
    queryKey: [...ORDER_KEYS.staff, 'paged', page, size],
    queryFn: () => ordersApi.getAllOrdersPaged(page, size),
  });
}

export function useActiveOrders() {
  return useQuery({ queryKey: ORDER_KEYS.active, queryFn: ordersApi.getActiveOrders });
}

export function useCreatePosOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PosCreateRequest) => ordersApi.createPosOrder(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ORDER_KEYS.all }); },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, data }: { publicId: string; data: StatusUpdateRequest }) =>
      ordersApi.updateStatus(publicId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ORDER_KEYS.all });
      qc.invalidateQueries({ queryKey: ['deliveries'] });
      qc.invalidateQueries({ queryKey: ORDER_KEYS.detail(variables.publicId) });
    },
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => ordersApi.deleteOrder(publicId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ORDER_KEYS.all }); },
  });
}

// ── Single order ──────────────────────────────────────────────────────────────
export function useOrder(publicId: string) {
  return useQuery({
    queryKey: ORDER_KEYS.detail(publicId),
    queryFn: () => ordersApi.getOrder(publicId),
    enabled: !!publicId,
  });
}
