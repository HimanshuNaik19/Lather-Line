import { axiosClient } from './axiosClient';
import type { Order, CreateOrderRequest, PosCreateRequest, StatusUpdateRequest, PageResponse } from '@/types';

export const ordersApi = {
  // Customer: create an online order
  createOrder: (data: CreateOrderRequest) =>
    axiosClient.post<Order>('/orders', data).then(r => r.data),

  // Staff: walk-in POS order
  createPosOrder: (data: PosCreateRequest) =>
    axiosClient.post<Order>('/orders/pos', data).then(r => r.data),

  // Customer: own orders
  getMyOrders: () =>
    axiosClient.get<Order[]>('/orders').then(r => r.data),

  getMyOrdersPaged: (page = 0, size = 10) =>
    axiosClient.get<PageResponse<Order>>(`/orders/paged?page=${page}&size=${size}`).then(r => r.data),

  // Staff: all orders
  getAllOrders: () =>
    axiosClient.get<Order[]>('/orders/all').then(r => r.data),

  getAllOrdersPaged: (page = 0, size = 20) =>
    axiosClient.get<PageResponse<Order>>(`/orders/all/paged?page=${page}&size=${size}`).then(r => r.data),

  // Washer: active orders (PICKED_UP, IN_PROGRESS)
  getActiveOrders: () =>
    axiosClient.get<Order[]>('/orders/active').then(r => r.data),

  // Single order
  getOrder: (publicId: string) =>
    axiosClient.get<Order>(`/orders/${publicId}`).then(r => r.data),

  // Update status
  updateStatus: (publicId: string, data: StatusUpdateRequest) =>
    axiosClient.patch<Order>(`/orders/${publicId}/status`, data).then(r => r.data),
};
