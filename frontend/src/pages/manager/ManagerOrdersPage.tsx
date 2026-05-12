import { useAllOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import type { Order, OrderStatus } from '@/types';
import { Search, Filter } from 'lucide-react';
import { useState } from 'react';

const STATUS_COLOR: Record<string, string> = {
  PENDING:     'bg-gray-500/20 text-gray-300',
  PICKED_UP:   'bg-blue-500/20 text-blue-300',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-300',
  READY:       'bg-green-500/20 text-green-300',
  DELIVERED:   'bg-brand-500/20 text-brand-300',
  CANCELLED:   'bg-red-500/20 text-red-300',
};

const ALL_STATUSES: OrderStatus[] = ['PENDING', 'PICKED_UP', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'];

export default function ManagerOrdersPage() {
  const { data: orders = [], isLoading } = useAllOrders();
  const updateStatus = useUpdateOrderStatus();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.publicId.includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || o.orderStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">All Orders</h1>
        <p className="text-gray-400 text-sm mt-1">View and manage all customer and walk-in orders.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            placeholder="Search by name or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface-card border border-surface-border text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-surface-card border border-surface-border rounded-xl px-3">
          <Filter size={14} className="text-gray-500" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="bg-transparent text-sm text-gray-300 focus:outline-none py-2.5 pr-2"
          >
            <option value="ALL">All Statuses</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-input">
              <tr>
                {['Order', 'Customer', 'Items', 'Total', 'Status', 'Update', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filtered.map((order: Order) => (
                <tr key={order.publicId} className="hover:bg-surface-input/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">#{order.publicId.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3 text-white">
                    <p>{order.customerName ?? '—'}</p>
                    {order.customerPhone && <p className="text-xs text-gray-500">{order.customerPhone}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 max-w-48">
                    {order.items.map((i, idx) => (
                      <span key={idx} className="inline-block text-xs bg-surface-border rounded px-1.5 py-0.5 mr-1 mb-1">
                        {i.serviceName} · {i.quantity}{i.unit === 'KG' ? 'kg' : 'pc'}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-brand-400 font-semibold">₹{order.totalAmount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLOR[order.orderStatus]}`}>
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.orderStatus}
                      onChange={e => updateStatus.mutate({ publicId: order.publicId, data: { orderStatus: e.target.value as OrderStatus } })}
                      className="bg-surface-input border border-surface-border rounded-lg px-2 py-1.5 text-xs text-gray-300 focus:outline-none"
                    >
                      {ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <p className="text-center py-10 text-gray-500">No orders match your filters.</p>
          )}
        </div>
      )}
    </div>
  );
}
