import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/api/axiosClient';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CreatePaymentResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

interface VerifyPaymentRequest {
  orderPublicId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export function usePayments() {
  const getPublicKey = useQuery({
    queryKey: ['razorpayKey'],
    queryFn: async () => {
      const res = await axiosClient.get('/payments/key');
      return res.data as { keyId: string };
    },
    staleTime: Infinity, // Key doesn't change often
  });

  const createPayment = useMutation({
    mutationFn: async (orderPublicId: string) => {
      const res = await axiosClient.post(`/payments/create/${orderPublicId}`);
      return res.data as CreatePaymentResponse;
    },
  });

  const verifyPayment = useMutation({
    mutationFn: async (request: VerifyPaymentRequest) => {
      await axiosClient.post('/payments/verify', request);
    },
  });

  const processPayment = async (
    orderPublicId: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    onSuccess: () => void,
    onError: (error: Error) => void
  ) => {
    try {
      const paymentData = await createPayment.mutateAsync(orderPublicId);

      const options = {
        key: paymentData.keyId,
        amount: paymentData.amount * 100, // Amount is in currency subunits (paise)
        currency: paymentData.currency,
        name: 'Lather & Line',
        description: 'Laundry Service Payment',
        order_id: paymentData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            await verifyPayment.mutateAsync({
              orderPublicId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            onSuccess();
          } catch (err: any) {
            onError(err);
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: '#0f172a', // Slate 900
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        onError(new Error(response.error.description));
      });
      rzp.open();
    } catch (err: any) {
      onError(err);
    }
  };

  return {
    getPublicKey,
    createPayment,
    verifyPayment,
    processPayment,
  };
}
