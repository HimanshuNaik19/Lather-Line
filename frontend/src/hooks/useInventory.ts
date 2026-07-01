import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '@/api/axiosClient';
import type { InventoryItem, ServiceInventoryRequirement } from '@/types';

export function useInventoryItems() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data } = await axiosClient.get<InventoryItem[]>('/inventory');
      return data;
    },
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<InventoryItem>) => {
      const { data } = await axiosClient.post<InventoryItem>('/inventory', item);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, item }: { id: number; item: Partial<InventoryItem> }) => {
      const { data } = await axiosClient.put<InventoryItem>(`/inventory/${id}`, item);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useServiceRequirements(serviceTypeId: number) {
  return useQuery({
    queryKey: ['inventory-requirements', serviceTypeId],
    queryFn: async () => {
      const { data } = await axiosClient.get<ServiceInventoryRequirement[]>(`/inventory/services/${serviceTypeId}`);
      return data;
    },
    enabled: !!serviceTypeId,
  });
}

export function useAddServiceRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ serviceTypeId, inventoryItemId, quantityRequired }: { serviceTypeId: number, inventoryItemId: number, quantityRequired: number }) => {
      const { data } = await axiosClient.post<ServiceInventoryRequirement>(`/inventory/services/${serviceTypeId}`, {
        inventoryItemId,
        quantityRequired,
      });
      return data;
    },
    onSuccess: (_, { serviceTypeId }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-requirements', serviceTypeId] });
    },
  });
}
