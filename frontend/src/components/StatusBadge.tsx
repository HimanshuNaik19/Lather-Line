import { clsx } from 'clsx';
import type { OrderStatus } from '@/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; dot: string }> = {
  PENDING:     { label: 'Pending',     color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', dot: 'bg-yellow-400' },
  PICKED_UP:   { label: 'Picked Up',  color: 'text-blue-400 bg-blue-400/10 border-blue-400/30',   dot: 'bg-blue-400 animate-pulse' },
  IN_PROGRESS: { label: 'In Progress',color: 'text-purple-400 bg-purple-400/10 border-purple-400/30', dot: 'bg-purple-400 animate-pulse' },
  READY:       { label: 'Ready',      color: 'text-brand-400 bg-brand-400/10 border-brand-400/30', dot: 'bg-brand-400' },
  DELIVERED:   { label: 'Delivered',  color: 'text-green-400 bg-green-400/10 border-green-400/30', dot: 'bg-green-400' },
  CANCELLED:   { label: 'Cancelled',  color: 'text-red-400 bg-red-400/10 border-red-400/30',     dot: 'bg-red-400' },
};

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        cfg.color,
        className,
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}
