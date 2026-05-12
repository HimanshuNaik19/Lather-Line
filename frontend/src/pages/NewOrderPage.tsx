import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '@/hooks/useServices';
import { useCreateOrder } from '@/hooks/useOrders';
import type { ServiceType, OrderItemRequest } from '@/types';
import { ShoppingCart, Plus, Minus, Trash2, Scale, Package, ChevronRight, Clock } from 'lucide-react';

interface CartItem {
  service: ServiceType;
  quantity: number;
  label: string;
}

export default function NewOrderPage() {
  const navigate = useNavigate();
  const { data: services, isLoading: servicesLoading } = useServices();
  const createOrder = useCreateOrder();

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Address & schedule
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'items' | 'address'>('items');
  const [error, setError] = useState('');

  // Live total
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.service.pricePerUnit * item.quantity, 0),
    [cart]
  );

  const addToCart = (service: ServiceType) => {
    setCart(prev => {
      const existing = prev.find(i => i.service.id === service.id);
      if (existing) {
        return prev.map(i => i.service.id === service.id
          ? { ...i, quantity: i.service.unit === 'KG' ? +(i.quantity + 0.5).toFixed(1) : i.quantity + 1 }
          : i);
      }
      return [...prev, { service, quantity: service.unit === 'KG' ? 1 : 1, label: '' }];
    });
  };

  const updateQty = (serviceId: number, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.service.id !== serviceId) return i;
      const step = i.service.unit === 'KG' ? 0.5 : 1;
      const newQty = +(i.quantity + delta * step).toFixed(1);
      return newQty <= 0 ? i : { ...i, quantity: newQty };
    }));
  };

  const setQty = (serviceId: number, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      setCart(prev => prev.map(i => i.service.id === serviceId ? { ...i, quantity: num } : i));
    }
  };

  const setLabel = (serviceId: number, label: string) => {
    setCart(prev => prev.map(i => i.service.id === serviceId ? { ...i, label } : i));
  };

  const removeFromCart = (serviceId: number) => {
    setCart(prev => prev.filter(i => i.service.id !== serviceId));
  };

  const handleSubmit = () => {
    if (!street || !city || !state || !pinCode || !pickupTime) {
      setError('Please fill in all address and pickup time fields.');
      return;
    }
    setError('');

    const items: OrderItemRequest[] = cart.map(i => ({
      serviceTypeId: i.service.id,
      quantity: i.quantity,
      label: i.label || undefined,
    }));

    createOrder.mutate(
      { items, street, city, state, pinCode, pickupTime: new Date(pickupTime).toISOString(), specialInstructions: notes },
      { onSuccess: () => navigate('/orders'), onError: (err: any) => setError(err.response?.data?.message ?? 'Failed to place order.') }
    );
  };

  const minPickup = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="min-h-screen bg-surface text-white pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl">New Order</h1>
          <p className="text-gray-400 mt-1">Select services and specify weight or quantity.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {['items', 'address'].map((s, idx) => (
            <div key={s} className="flex items-center gap-3">
              <button
                onClick={() => s === 'address' && cart.length > 0 ? setStep(s as any) : setStep('items')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  step === s
                    ? 'bg-brand-gradient text-white shadow-glow-brand'
                    : 'bg-surface-card border border-surface-border text-gray-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s ? 'bg-white/20' : 'bg-surface-border'
                }`}>{idx + 1}</span>
                {s === 'items' ? 'Select Services' : 'Pickup Details'}
              </button>
              {idx < 1 && <ChevronRight size={16} className="text-gray-600" />}
            </div>
          ))}
        </div>

        {step === 'items' && (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Service selector — 3 cols */}
            <div className="lg:col-span-3 space-y-4">
              <h2 className="font-semibold text-lg">Available Services</h2>
              {servicesLoading ? (
                <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {services?.filter(s => s.active).map(service => {
                    const inCart = cart.find(i => i.service.id === service.id);
                    return (
                      <button
                        key={service.id}
                        onClick={() => addToCart(service)}
                        className={`text-left p-5 rounded-2xl border transition-all hover:border-brand-500/60 hover:shadow-glow-brand/20 ${
                          inCart ? 'border-brand-500 bg-brand-500/10' : 'border-surface-border bg-surface-card'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className={`p-2 rounded-xl ${service.unit === 'KG' ? 'bg-blue-500/15' : 'bg-purple-500/15'}`}>
                            {service.unit === 'KG'
                              ? <Scale size={18} className="text-blue-400" />
                              : <Package size={18} className="text-purple-400" />}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            service.unit === 'KG'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            per {service.unit === 'KG' ? 'kg' : 'piece'}
                          </span>
                        </div>
                        <p className="font-semibold text-white">{service.name}</p>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">{service.description}</p>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-brand-400 font-bold">
                            ₹{service.pricePerUnit}
                            <span className="text-gray-400 font-normal text-xs">/{service.unit === 'KG' ? 'kg' : 'pc'}</span>
                          </span>
                          {service.turnaroundHours && (
                            <span className="flex items-center gap-1 text-gray-500 text-xs">
                              <Clock size={11} /> {service.turnaroundHours}h
                            </span>
                          )}
                        </div>
                        {inCart && (
                          <div className="mt-3 pt-3 border-t border-brand-500/30">
                            <span className="text-brand-300 text-xs font-medium flex items-center gap-1">
                              <Plus size={12} /> Added to order
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cart — 2 cols */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-5">
                    <ShoppingCart size={18} className="text-brand-400" />
                    <h2 className="font-semibold text-lg">Your Order</h2>
                    {cart.length > 0 && (
                      <span className="ml-auto text-xs px-2 py-0.5 bg-brand-500/20 text-brand-300 rounded-full">{cart.length} item{cart.length > 1 ? 's' : ''}</span>
                    )}
                  </div>

                  {cart.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <ShoppingCart size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Click a service to add it</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.service.id} className="p-4 rounded-xl bg-surface-input border border-surface-border">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-sm text-white">{item.service.name}</span>
                            <button onClick={() => removeFromCart(item.service.id)} className="text-red-500/70 hover:text-red-400 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Quantity control */}
                          <div className="flex items-center gap-2 mb-3">
                            <button
                              onClick={() => updateQty(item.service.id, -1)}
                              className="w-8 h-8 rounded-lg bg-surface-border flex items-center justify-center hover:bg-brand-500/20 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              min={item.service.unit === 'KG' ? 0.5 : 1}
                              step={item.service.unit === 'KG' ? 0.5 : 1}
                              value={item.quantity}
                              onChange={e => setQty(item.service.id, e.target.value)}
                              className="w-20 text-center bg-surface-border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                            <span className="text-gray-400 text-sm">{item.service.unit === 'KG' ? 'kg' : 'pcs'}</span>
                            <button
                              onClick={() => updateQty(item.service.id, 1)}
                              className="w-8 h-8 rounded-lg bg-surface-border flex items-center justify-center hover:bg-brand-500/20 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Optional label for PIECE items */}
                          {item.service.unit === 'PIECE' && (
                            <input
                              type="text"
                              placeholder="Label (e.g. Shirt, Saree)…"
                              value={item.label}
                              onChange={e => setLabel(item.service.id, e.target.value)}
                              className="w-full text-xs bg-surface-border rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500 mb-3"
                            />
                          )}

                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">₹{item.service.pricePerUnit} × {item.quantity}{item.service.unit === 'KG' ? 'kg' : ''}</span>
                            <span className="font-semibold text-brand-400">
                              ₹{(item.service.pricePerUnit * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}

                      <div className="pt-4 border-t border-surface-border flex items-center justify-between">
                        <span className="font-bold text-lg">Estimated Total</span>
                        <span className="font-bold text-2xl text-brand-400">₹{total.toFixed(2)}</span>
                      </div>

                      <button
                        onClick={() => setStep('address')}
                        disabled={cart.length === 0}
                        className="w-full py-3 rounded-xl bg-brand-gradient font-semibold text-sm disabled:opacity-50 hover:shadow-glow-brand transition-all"
                      >
                        Continue to Pickup Details →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'address' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-surface-card border border-surface-border rounded-2xl p-6">
              <h2 className="font-semibold text-lg mb-5">Order Summary</h2>
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.service.id} className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      {item.service.name} — {item.quantity}{item.service.unit === 'KG' ? ' kg' : ' pcs'}
                      {item.label && <span className="text-gray-500 ml-1">({item.label})</span>}
                    </span>
                    <span className="text-brand-400 font-medium">₹{(item.service.pricePerUnit * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-surface-border flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-brand-400">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-card border border-surface-border rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-lg mb-1">Pickup Address</h2>
              <input className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none" placeholder="Street address" value={street} onChange={e => setStreet(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <input className="bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
                <input className="bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none" placeholder="State" value={state} onChange={e => setState(e.target.value)} />
              </div>
              <input className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none" placeholder="PIN Code" value={pinCode} onChange={e => setPinCode(e.target.value)} />
            </div>

            <div className="bg-surface-card border border-surface-border rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-lg mb-1">Schedule Pickup</h2>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Pickup Date & Time</label>
                <input type="datetime-local" min={minPickup} value={pickupTime} onChange={e => setPickupTime(e.target.value)}
                  className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none [color-scheme:dark]" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Special Instructions (optional)</label>
                <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Handle with care, fragile items…"
                  className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none resize-none" />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-4">
              <button onClick={() => setStep('items')} className="flex-1 py-3 rounded-xl border border-surface-border text-sm text-gray-400 hover:border-brand-500/40 transition-colors">
                ← Back to Services
              </button>
              <button onClick={handleSubmit} disabled={createOrder.isPending}
                className="flex-2 flex-grow py-3 rounded-xl bg-brand-gradient font-semibold text-sm disabled:opacity-50 hover:shadow-glow-brand transition-all">
                {createOrder.isPending ? 'Placing Order…' : `Place Order · ₹${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
