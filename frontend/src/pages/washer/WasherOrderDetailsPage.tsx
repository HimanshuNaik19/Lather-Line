import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';
import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders';
import { StatusBadge } from '@/components/StatusBadge';
import type { OrderStatus } from '@/types';

const STATUS_FLOW: Record<string, { next: OrderStatus; label: string; color: string }> = {
  PENDING:     { next: 'PICKED_UP',   label: 'Mark Picked Up',   color: 'bg-blue-500 hover:bg-blue-400'   },
  PICKED_UP:   { next: 'IN_PROGRESS', label: 'Start Washing',    color: 'bg-yellow-500 hover:bg-yellow-400' },
  IN_PROGRESS: { next: 'READY',       label: 'Mark Ready',       color: 'bg-green-500 hover:bg-green-400'  },
  READY:       { next: 'DELIVERED',   label: 'Mark Delivered',   color: 'bg-brand-500 hover:bg-brand-400'  },
};

export default function WasherOrderDetailsPage() {
  const { publicId = '' } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(publicId);
  const updateStatus = useUpdateOrderStatus();

  if (isLoading || !order) {
    return <div className="text-white p-6">Loading order details...</div>;
  }

  const action = STATUS_FLOW[order.orderStatus];

  const handleUpdateStatus = () => {
    if (!action) return;
    updateStatus.mutate(
      { publicId: order.publicId, data: { orderStatus: action.next } },
      {
        onSuccess: () => {
          if (action.next === 'DELIVERED') {
            navigate('/washer');
          }
        }
      }
    );
  };

  return (
    <div className="max-w-xl mx-auto text-white space-y-6 pb-24">
      <div>
        <Link to="/washer" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-lg mb-4">
          <ArrowLeft size={18} /> Back to list
        </Link>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold font-mono">#{order.publicId.slice(0, 8).toUpperCase()}</h1>
          <StatusBadge status={order.orderStatus} />
        </div>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-200">Customer Info</h2>
        <div className="space-y-3 text-sm text-gray-400">
          <p className="flex items-center gap-2"><User size={16} className="text-gray-500" /> {order.customerName ?? '—'}</p>
          {order.customerPhone && <p className="flex items-center gap-2"><Phone size={16} className="text-gray-500" /> {order.customerPhone}</p>}
          <p className="flex items-start gap-2"><MapPin size={16} className="text-gray-500 shrink-0 mt-0.5" /> <span>{order.addressStreet ? `${order.addressStreet}, ` : ''}{order.addressCity}</span></p>
        </div>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-200">Order Items</h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between items-start text-sm">
              <div>
                <p className="text-gray-300 font-medium">{item.serviceName}</p>
                {item.label && <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>}
              </div>
              <span className="text-gray-400 font-medium">{item.quantity}{item.unit === 'KG' ? ' kg' : ' pcs'}</span>
            </div>
          ))}
        </div>
      </div>

      {order.specialInstructions && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 space-y-2">
          <h2 className="font-semibold text-yellow-300 text-sm">Special Instructions</h2>
          <p className="text-sm text-yellow-200/80">{order.specialInstructions}</p>
        </div>
      )}

      {/* Floating Action Button for mobile */}
      {action && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface/80 backdrop-blur-md border-t border-surface-border z-10 md:static md:bg-transparent md:border-none md:p-0 md:mt-8">
          <button
            onClick={handleUpdateStatus}
            disabled={updateStatus.isPending}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all shadow-lg ${action.color} disabled:opacity-50`}
          >
            {updateStatus.isPending ? 'Updating...' : (
              <>
                <CheckCircle2 size={20} />
                {action.label}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
