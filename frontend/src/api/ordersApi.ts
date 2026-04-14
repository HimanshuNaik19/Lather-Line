import { axiosClient } from './axiosClient';
import type { Order, CreateOrderRequest, StatusUpdateRequest } from '@/types';

export const ordersApi = {
  getMyOrders: () =>
    axiosClient.get<Order[]>('/orders').then((r) => r.data),

  getOrderById: (id: number) =>
    axiosClient.get<Order>(`/orders/${id}`).then((r) => r.data),

  createOrder: (data: CreateOrderRequest) =>
    axiosClient.post<Order>('/orders', data).then((r) => r.data),

  updateStatus: (id: number, data: StatusUpdateRequest) =>
    axiosClient.patch<Order>(`/orders/${id}/status`, data).then((r) => r.data),
};
