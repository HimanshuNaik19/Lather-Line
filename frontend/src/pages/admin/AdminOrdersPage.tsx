import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAllOrders, useDeleteOrder } from '@/hooks/useOrders';
import type { OrderStatus } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { PaymentBadge } from '@/components/PaymentBadge';
import { formatOrderRef } from '@/utils/orderRef';
import { useMarkAsPaid } from '@/hooks/usePayment';

const STATUSES: Array<'ALL' | OrderStatus> = ['ALL', 'PENDING', 'PICKED_UP', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const { data: orders, isLoading, error } = useAllOrders();
  const deleteOrder = useDeleteOrder();
  const markAsPaid = useMarkAsPaid();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'ALL' | OrderStatus>('ALL');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (orders ?? []).filter((order) => {
      const statusMatch = status === 'ALL' || order.orderStatus === status;
      const itemNames = order.items.map(i => i.serviceName).join(' ');
      const queryMatch =
        !q ||
        itemNames.toLowerCase().includes(q) ||
        order.addressCity.toLowerCase().includes(q) ||
        order.publicId.toLowerCase().includes(q);
      return statusMatch && queryMatch;
    });
  }, [orders, query, status]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-display font-bold leading-none">Orders</h1>
          <p className="text-gray-400 mt-2 text-sm">Manage all laundry and dry-cleaning orders.</p>
        </div>
        <Link to="/admin/pos" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-gradient font-semibold text-xl">
          <Plus size={20} /> New Order
        </Link>
      </div>

      <div className="bg-surface-dark border border-surface-border rounded-xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order, city, or service..."
            className="w-full bg-surface-dark border border-surface-border rounded-xl py-3 pl-12 pr-4 text-xl"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'ALL' | OrderStatus)}
          className="bg-surface-dark border border-surface-border rounded-xl px-4 py-3 text-xl md:w-64"
        >
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {value === 'ALL' ? 'All Statuses' : value.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-400" size={36} /></div>}
      {error && <div className="p-6 rounded-xl border border-red-500/40 text-red-400">Failed to load orders.</div>}

      <div className="space-y-4">
        {filtered.map((order) => (
          <Link
            key={order.publicId}
            to={`/admin/orders/${order.publicId}`}
            className="block bg-surface-dark border border-surface-border rounded-2xl p-6 hover:border-brand-500/60 transition-colors"
          >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
              <div>
                <p className="text-gray-400 text-lg">Reference</p>
                <p className="font-semibold text-sm">{formatOrderRef(order.publicId)}</p>
                <p className="text-gray-400 text-sm truncate">{order.addressCity}</p>
              </div>
              <div>
                <p className="text-gray-400 text-lg">Services</p>
                <p className="font-semibold text-sm">
                  {order.items.map(i => `${i.serviceName}(${i.quantity}${i.unit === 'KG' ? 'kg' : 'pc'})`).join(', ')}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-lg">Status</p>
                <div className="flex gap-2">
                  <StatusBadge status={order.orderStatus} />
                  <PaymentBadge status={order.paymentStatus} />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-lg">Total & Date</p>
                <p className="text-brand-400 font-bold text-sm">Rs {order.totalAmount}</p>
                <p className="text-gray-400 text-sm">{format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm')}</p>
              </div>
              <div className="flex justify-end items-center gap-3 text-gray-500">
                {order.paymentStatus === 'PENDING' && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (window.confirm('Mark this order as paid by cash?')) {
                        markAsPaid.mutate(order.publicId);
                      }
                    }}
                    disabled={markAsPaid.isPending}
                    className="hover:text-emerald-400 p-2 rounded-full hover:bg-emerald-500/10 transition-colors"
                    title="Mark as Paid (Cash)"
                  >
                    {markAsPaid.isPending && markAsPaid.variables === order.publicId ? (
                      <Loader2 size={22} className="animate-spin" />
                    ) : (
                      <span className="text-sm font-bold border border-current px-2 py-0.5 rounded-lg">₹</span>
                    )}
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (window.confirm('Are you sure you want to delete this order?')) {
                      deleteOrder.mutate(order.publicId);
                    }
                  }}
                  className="hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors"
                  title="Delete Order"
                >
                  <Trash2 size={22} />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
