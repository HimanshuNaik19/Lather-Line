
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { ToastMessage } from '@/contexts/ToastContext';

interface ToastProps {
  toast: ToastMessage;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  const baseClasses = 'flex items-center gap-3 p-4 pr-12 rounded-xl shadow-card border animate-slide-up relative min-w-[300px] max-w-sm';
  
  let colorClasses = '';
  let Icon = Info;

  if (isSuccess) {
    colorClasses = 'bg-green-950/40 border-green-500/30 text-green-100';
    Icon = CheckCircle;
  } else if (isError) {
    colorClasses = 'bg-red-950/40 border-red-500/30 text-red-100';
    Icon = AlertCircle;
  } else {
    colorClasses = 'bg-surface-card border-brand-500/30 text-white shadow-glow-brand';
    Icon = Info;
  }

  return (
    <div className={`${baseClasses} ${colorClasses}`}>
      <Icon size={20} className={isSuccess ? 'text-green-400' : isError ? 'text-red-400' : 'text-brand-400'} />
      <p className="text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-white/10 transition-all"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
