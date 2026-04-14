import { useState, useEffect } from 'react';
import { Package, Users, DollarSign, Loader2 } from 'lucide-react';
import { Order } from '@/types';
import { axiosClient } from '@/api/axiosClient';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosClient.get<Order[]>('/orders');
        setOrders(response.data);
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 size={40} className="text-brand-500 animate-spin" /></div>;
  }

  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const pendingCount = orders.filter(o => o.orderStatus === 'PENDING').length;
  const inProgressCount = orders.filter(o => o.orderStatus === 'IN_PROGRESS' || o.orderStatus === 'PICKED_UP').length;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Store Dashboard</h1>
          <p className="text-gray-400 mt-1">Overview of your laundry operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Pending Pickups', value: pendingCount, icon: Package, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'In Progress', value: inProgressCount, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Total Orders', value: orders.length, icon: Package, color: 'text-brand-400', bg: 'bg-brand-400/10' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-surface-dark border border-surface-border rounded-2xl p-6 flex flex-col justify-between hover:border-surface-border/80 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-display font-bold text-white">{stat.value}</p>
                </div>
                <div className={classNames('p-3 rounded-xl border border-white/5', stat.bg)}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-surface-dark border border-surface-border rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-surface-border">
          <h2 className="text-lg font-semibold text-white">Recent Store Orders</h2>
        </div>
        <div className="divide-y divide-surface-border">
          {orders.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400">No orders placed yet.</div>
          ) : (
            orders.slice(0, 5).map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div>
                  <p className="font-medium text-white flex items-center gap-2">
                    Order #{order.id}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                      {order.serviceTypeName}
                    </span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-brand-400">${order.totalAmount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">{order.orderStatus}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
