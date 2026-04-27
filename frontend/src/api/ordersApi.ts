import { axiosClient } from './axiosClient';
import type { CreateOrderRequest, Order, PageResponse, PaginationParams, StatusUpdateRequest } from '@/types';

export const ordersApi = {
  getMyOrders: (params: PaginationParams) =>
    axiosClient.get<PageResponse<Order>>('/orders', { params }).then((r) => r.data),

  getAllOrders: (params: PaginationParams) =>
    axiosClient.get<PageResponse<Order>>('/orders/all', { params }).then((r) => r.data),

  getOrderById: (id: number) =>
    axiosClient.get<Order>(`/orders/${id}`).then((r) => r.data),

  createOrder: (data: CreateOrderRequest) =>
    axiosClient.post<Order>('/orders', data).then((r) => r.data),

  updateStatus: (id: number, data: StatusUpdateRequest) =>
    axiosClient.patch<Order>(`/orders/${id}/status`, data).then((r) => r.data),
};
