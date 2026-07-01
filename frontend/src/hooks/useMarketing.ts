import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '@/api/axiosClient';
import type { Coupon, SubscriptionPlan, UserSubscription } from '@/types';

// --- Coupons ---

export function useValidateCoupon(code: string) {
  return useQuery({
    queryKey: ['coupon', code],
    queryFn: async () => {
      if (!code) return null;
      const res = await axiosClient.get<Coupon>(`/coupons/validate?code=${code}`);
      return res.data;
    },
    enabled: !!code,
    retry: false,
  });
}

export function useAllCoupons() {
  return useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: async () => {
      const res = await axiosClient.get<Coupon[]>('/admin/marketing/coupons');
      return res.data;
    }
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Coupon>) => {
      const res = await axiosClient.post<Coupon>('/admin/marketing/coupons', data);
      return res.data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }); }
  });
}

export function useDeactivateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosClient.delete(`/admin/marketing/coupons/${id}`);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }); }
  });
}

// --- Subscriptions ---

export function useActivePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await axiosClient.get<SubscriptionPlan[]>('/subscriptions/plans');
      return res.data;
    }
  });
}

export function useMySubscription() {
  return useQuery({
    queryKey: ['mySubscription'],
    queryFn: async () => {
      const res = await axiosClient.get<UserSubscription>('/subscriptions/me');
      return res.data;
    },
    retry: false
  });
}

export function useSubscribe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (planId: number) => {
      const res = await axiosClient.post<UserSubscription>(`/subscriptions/subscribe/${planId}`);
      return res.data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mySubscription'] }); }
  });
}

export function useAllPlans() {
  return useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: async () => {
      const res = await axiosClient.get<SubscriptionPlan[]>('/admin/marketing/plans');
      return res.data;
    }
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<SubscriptionPlan>) => {
      const res = await axiosClient.post<SubscriptionPlan>('/admin/marketing/plans', data);
      return res.data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'plans'] }); }
  });
}
