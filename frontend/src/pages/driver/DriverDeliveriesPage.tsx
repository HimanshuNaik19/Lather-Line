import { useMyDeliveries } from '@/hooks/useDeliveries';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { StatusBadge } from '@/components/StatusBadge';
import { PaymentBadge } from '@/components/PaymentBadge';
import { formatOrderRef } from '@/utils/orderRef';
import { format } from 'date-fns';
import { Loader2, MapPin, Phone, CheckCircle, Navigation } from 'lucide-react';
import type { OrderStatus } from '@/types';

export default function DriverDeliveriesPage() {
  const { data: deliveries, isLoading, error } = useMyDeliveries();
  const updateStatus = useUpdateOrderStatus();

  const handleUpdateStatus = (publicId: string, newStatus: OrderStatus) => {
    updateStatus.mutate({ publicId, data: { orderStatus: newStatus } });
  };

  const getGoogleMapsLink = (lat?: number, lng?: number, address?: string, city?: string) => {
    if (lat && lng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    const query = encodeURIComponent(`${address || ''} ${city || ''}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={36} /></div>;
  }

  if (error) {
    return <div className="p-6 rounded-xl border border-red-500/40 text-red-400">Failed to load deliveries.</div>;
  }

  const activeDeliveries = deliveries?.filter(d => d.orderStatus === 'OUT_FOR_DELIVERY') || [];
  const completedDeliveries = deliveries?.filter(d => d.orderStatus === 'DELIVERED') || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold">My Deliveries</h1>
        <p className="text-gray-400 mt-1">Manage your active routes and deliveries.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
          <Navigation size={18} /> Active Route ({activeDeliveries.length})
        </h2>
        
        {activeDeliveries.length === 0 ? (
          <div className="bg-surface-dark border border-surface-border rounded-xl p-8 text-center">
            <CheckCircle className="mx-auto text-gray-600 mb-3" size={32} />
            <p className="text-gray-400">You have no active deliveries.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeDeliveries.map((order) => (
              <div key={order.publicId} className="bg-surface-dark border border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -z-10" />
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">#{formatOrderRef(order.publicId)}</p>
                    <h3 className="font-bold text-lg">{order.customerName}</h3>
                  </div>
                  <PaymentBadge status={order.paymentStatus} />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 text-gray-300">
                    <MapPin className="text-cyan-400 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm leading-relaxed">
                      {order.addressStreet ? `${order.addressStreet}, ` : ''}{order.addressCity}
                    </p>
                  </div>
                  {order.customerPhone && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <Phone className="text-cyan-400 shrink-0" size={18} />
                      <a href={`tel:${order.customerPhone}`} className="text-sm hover:text-cyan-300 transition-colors">
                        {order.customerPhone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-surface-border">
                  <a
                    href={getGoogleMapsLink(order.addressLatitude, order.addressLongitude, order.addressStreet, order.addressCity)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface border border-surface-border hover:border-cyan-500/50 transition-colors font-medium text-sm"
                  >
                    <MapPin size={16} className="text-cyan-400" /> Map
                  </a>
                  <button
                    onClick={() => handleUpdateStatus(order.publicId, 'DELIVERED')}
                    disabled={updateStatus.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold text-sm transition-colors disabled:opacity-50"
                  >
                    {updateStatus.isPending && updateStatus.variables?.publicId === order.publicId ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Mark Delivered
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {completedDeliveries.length > 0 && (
        <div className="space-y-4 pt-8">
          <h2 className="text-lg font-semibold text-gray-400">Completed Today ({completedDeliveries.length})</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {completedDeliveries.map((order) => (
              <div key={order.publicId} className="bg-surface-dark/50 border border-surface-border rounded-xl p-4 opacity-70">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold">{order.customerName}</p>
                  <StatusBadge status={order.orderStatus} />
                </div>
                <p className="text-sm text-gray-400">{order.addressCity}</p>
                <p className="text-xs text-gray-500 mt-2">Placed: {format(new Date(order.createdAt), 'dd MMM yyyy')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
