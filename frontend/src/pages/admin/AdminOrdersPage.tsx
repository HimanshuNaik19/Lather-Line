import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAllOrders } from '@/hooks/useOrders';
import type { OrderStatus } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { formatOrderRef } from '@/utils/orderRef';

const STATUSES: Array<'ALL' | OrderStatus> = ['ALL', 'PENDING', 'PICKED_UP', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const { data: orders, isLoading, error } = useAllOrders();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'ALL' | OrderStatus>('ALL');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (orders ?? []).filter((order) => {
      const statusMatch = status === 'ALL' || order.orderStatus === status;
      const queryMatch =
        !q ||
        order.serviceTypeName.toLowerCase().includes(q) ||
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
        <Link to="/orders/new" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-gradient font-semibold text-xl">
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
                <p className="text-gray-400 text-lg">Service</p>
                <p className="font-semibold text-sm">{order.serviceTypeName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-lg">Status</p>
                <StatusBadge status={order.orderStatus} />
              </div>
              <div>
                <p className="text-gray-400 text-lg">Total & Date</p>
                <p className="text-brand-400 font-bold text-sm">Rs {order.totalAmount}</p>
                <p className="text-gray-400 text-sm">{format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm')}</p>
              </div>
              <div className="flex justify-end text-gray-500">
                <Trash2 size={22} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
