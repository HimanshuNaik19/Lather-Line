import { useActiveOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import type { Order, OrderStatus } from '@/types';
import { Clock, Zap, CheckCircle2, User, Phone, MapPin } from 'lucide-react';

const STATUS_FLOW: Record<string, { next: OrderStatus; label: string; color: string }> = {
  PENDING:     { next: 'PICKED_UP',   label: 'Mark Picked Up',   color: 'bg-blue-500 hover:bg-blue-400'   },
  PICKED_UP:   { next: 'IN_PROGRESS', label: 'Start Washing',    color: 'bg-yellow-500 hover:bg-yellow-400' },
  IN_PROGRESS: { next: 'READY',       label: 'Mark Ready',       color: 'bg-green-500 hover:bg-green-400'  },
  READY:       { next: 'DELIVERED',   label: 'Mark Delivered',   color: 'bg-brand-500 hover:bg-brand-400'  },
};

const STATUS_COLOR: Record<string, string> = {
  PENDING:     'bg-gray-500/20 text-gray-300',
  PICKED_UP:   'bg-blue-500/20 text-blue-300',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-300',
  READY:       'bg-green-500/20 text-green-300',
  DELIVERED:   'bg-brand-500/20 text-brand-300',
  CANCELLED:   'bg-red-500/20 text-red-300',
};

function OrderCard({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus();
  const action = STATUS_FLOW[order.orderStatus];

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs text-gray-500 mb-1">#{order.publicId.slice(0, 8).toUpperCase()}</p>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.orderStatus]}`}>
            {order.orderStatus.replace('_', ' ')}
          </span>
        </div>
        <p className="text-brand-400 font-bold text-lg">₹{order.totalAmount}</p>
      </div>

      {/* Customer info */}
      <div className="flex flex-wrap gap-3 text-sm text-gray-400">
        <span className="flex items-center gap-1.5"><User size={13} /> {order.customerName ?? '—'}</span>
        {order.customerPhone && <span className="flex items-center gap-1.5"><Phone size={13} /> {order.customerPhone}</span>}
        <span className="flex items-center gap-1.5"><MapPin size={13} /> {order.addressCity}</span>
      </div>

      {/* Items */}
      <div className="text-xs text-gray-400 space-y-1">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span>{item.serviceName} · {item.quantity}{item.unit === 'KG' ? ' kg' : ' pcs'}{item.label ? ` (${item.label})` : ''}</span>
            <span className="text-gray-500">₹{item.subtotal}</span>
          </div>
        ))}
      </div>

      {/* Pickup time */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Clock size={12} />
        {new Date(order.pickupTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
      </div>

      {/* Action button */}
      {action && (
        <button
          onClick={() => updateStatus.mutate({ publicId: order.publicId, data: { orderStatus: action.next } })}
          disabled={updateStatus.isPending}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 ${action.color}`}
        >
          <Zap size={14} className="inline mr-1.5" />
          {action.label}
        </button>
      )}
      {order.orderStatus === 'DELIVERED' && (
        <div className="flex items-center justify-center gap-2 py-2 text-green-400 text-sm font-medium">
          <CheckCircle2 size={16} /> Delivered
        </div>
      )}
    </div>
  );
}

export default function WasherOrdersPage() {
  const { data: orders, isLoading } = useActiveOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Active Orders</h1>
        <p className="text-gray-400 text-sm mt-1">Orders in your queue — tap to advance status.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : !orders?.length ? (
        <div className="text-center py-20 text-gray-500">
          <CheckCircle2 size={48} className="mx-auto mb-4 opacity-30" />
          <p>No active orders right now.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {orders.map(order => <OrderCard key={order.publicId} order={order} />)}
        </div>
      )}
    </div>
  );
}
