import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock3, MapPin, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { useOrder } from '@/hooks/useOrders';
import { StatusBadge } from '@/components/StatusBadge';
import { formatOrderRef } from '@/utils/orderRef';

const flow = ['PENDING', 'PICKED_UP', 'IN_PROGRESS', 'READY', 'DELIVERED'] as const;

export default function AdminOrderDetailsPage() {
  const { publicId } = useParams();
  const { data: order, isLoading } = useOrder(publicId);

  const activeIndex = useMemo(
    () => flow.indexOf((order?.orderStatus as typeof flow[number]) ?? 'PENDING'),
    [order?.orderStatus]
  );

  if (isLoading || !order) {
    return <div className="text-white">Loading order...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto text-white space-y-6">
      <div>
        <Link to="/admin/orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-xl mb-2">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold font-display">Order #{formatOrderRef(order.publicId)}</h1>
          <StatusBadge status={order.orderStatus} />
        </div>
        <p className="text-gray-400 text-sm mt-1">Created {format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm')}</p>
      </div>

      <div className="bg-surface-dark border border-brand-500/40 rounded-2xl p-6">
        <div className="flex justify-between items-center gap-2">
          {flow.map((step, index) => (
            <div key={step} className="flex-1 text-center">
              <div className={`mx-auto w-10 h-10 rounded-full border-2 flex items-center justify-center ${index <= activeIndex ? 'border-brand-400 bg-brand-500/20 text-brand-300' : 'border-surface-border text-gray-500'}`}>
                OK
              </div>
              <p className={`mt-2 text-sm font-semibold ${index <= activeIndex ? 'text-brand-300' : 'text-gray-400'}`}>
                {step.replace('_', ' ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-dark border border-surface-border rounded-2xl p-6">
            <h2 className="font-semibold text-base mb-4">Order Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Reference</p>
                <p className="font-semibold break-all">{order.publicId}</p>
              </div>
              <div>
                <p className="text-gray-400">Phone</p>
                <p className="font-semibold inline-flex items-center gap-2"><Phone size={16} /> N/A</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-400">Address</p>
                <p className="font-semibold inline-flex items-center gap-2"><MapPin size={16} /> {order.addressCity}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-dark border border-surface-border rounded-2xl p-6">
            <h2 className="font-semibold text-base mb-4">Service Information</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Service Type</p>
                <p className="font-semibold">{order.serviceTypeName}</p>
              </div>
              <div>
                <p className="text-gray-400">Weight</p>
                <p className="font-semibold">1 kg</p>
              </div>
              <div>
                <p className="text-gray-400">Pickup Time</p>
                <p className="font-semibold inline-flex items-center gap-2">
                  <Clock3 size={16} /> {format(new Date(order.pickupTime), 'dd MMM yyyy, HH:mm')}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-surface-input text-xl text-gray-300">
              {order.specialInstructions || 'No special instructions provided.'}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-dark border border-surface-border rounded-2xl p-6">
            <h2 className="font-semibold text-base mb-4">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>Rs {order.totalAmount}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Tax</span><span>Rs 0</span></div>
              <div className="border-t border-surface-border pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="text-brand-400">Rs {order.totalAmount}</span></div>
            </div>
          </div>

          <div className="bg-surface-dark border border-surface-border rounded-2xl p-6 space-y-3">
            <h2 className="font-semibold text-base">Quick Actions</h2>
            <button className="w-full py-3 rounded-lg border border-surface-border text-xl">Print Receipt</button>
            <button className="w-full py-3 rounded-lg border border-surface-border text-xl">Send WhatsApp Reminder</button>
          </div>
        </div>
      </div>
    </div>
  );
}
