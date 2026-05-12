import { useAllOrders } from '@/hooks/useOrders';
import { TrendingUp, ShoppingBag, Clock, CheckCircle2 } from 'lucide-react';
import type { Order } from '@/types';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-gray-400 text-sm">{label}</p>
      </div>
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:     'bg-gray-500/20 text-gray-300',
  PICKED_UP:   'bg-blue-500/20 text-blue-300',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-300',
  READY:       'bg-green-500/20 text-green-300',
  DELIVERED:   'bg-brand-500/20 text-brand-300',
  CANCELLED:   'bg-red-500/20 text-red-300',
};

export default function ManagerDashboardPage() {
  const { data: orders = [], isLoading } = useAllOrders();

  const revenue = orders.filter(o => o.orderStatus === 'DELIVERED').reduce((s, o) => s + o.totalAmount, 0);
  const pending = orders.filter(o => o.orderStatus === 'PENDING').length;
  const inProgress = orders.filter(o => ['PICKED_UP', 'IN_PROGRESS'].includes(o.orderStatus)).length;
  const delivered = orders.filter(o => o.orderStatus === 'DELIVERED').length;

  const recent = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Operations overview for your store.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Revenue Collected" value={`₹${revenue.toFixed(0)}`} icon={TrendingUp} color="bg-brand-500" />
        <StatCard label="Total Orders" value={orders.length} icon={ShoppingBag} color="bg-blue-600" />
        <StatCard label="In Progress" value={inProgress + pending} icon={Clock} color="bg-yellow-600" />
        <StatCard label="Delivered" value={delivered} icon={CheckCircle2} color="bg-green-600" />
      </div>

      <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border">
          <h2 className="font-semibold">Recent Orders</h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-input">
              <tr>
                {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {recent.map((order: Order) => (
                <tr key={order.publicId} className="hover:bg-surface-input/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">#{order.publicId.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3 text-white">{order.customerName ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{order.items.map(i => `${i.serviceName}(${i.quantity}${i.unit === 'KG' ? 'kg' : 'pc'})`).join(', ')}</td>
                  <td className="px-4 py-3 text-brand-400 font-semibold">₹{order.totalAmount}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[order.orderStatus]}`}>{order.orderStatus}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
