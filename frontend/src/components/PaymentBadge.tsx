import { PaymentStatus } from '@/types';

interface PaymentBadgeProps {
  status: PaymentStatus;
}

export function PaymentBadge({ status }: PaymentBadgeProps) {
  let colors = '';

  switch (status) {
    case 'PENDING':
      colors = 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      break;
    case 'PAID':
      colors = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      break;
    case 'FAILED':
      colors = 'bg-red-500/20 text-red-400 border border-red-500/30';
      break;
    case 'REFUNDED':
      colors = 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
      break;
    default:
      colors = 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${colors}`}>
      {status}
    </span>
  );
}
