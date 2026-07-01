import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useServices } from '@/hooks/useServices';
import { useCreateOrder } from '@/hooks/useOrders';
import { useValidateCoupon, useMySubscription } from '@/hooks/useMarketing';
import { useAuth } from '@/hooks/useAuth';
import { usePayments } from '@/hooks/usePayments';
import type { ServiceType, OrderItemRequest, PaymentMethod } from '@/types';
import { ShoppingCart, Plus, Minus, Trash2, Scale, Package, ChevronRight, Clock, Tag } from 'lucide-react';

interface CartItem {
  service: ServiceType;
  quantity: number;
  label: string;
}

function toLocalDateTimeValue(date: Date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

function normalizePickupTime(value: string) {
  return value.length === 16 ? `${value}:00` : value;
}

export default function NewOrderPage() {
  const navigate = useNavigate();
  const { data: services, isLoading: servicesLoading } = useServices();
  const { user } = useAuth();
  const { processPayment } = usePayments();
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
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE');
  const [step, setStep] = useState<'items' | 'address' | 'payment'>('items');
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { data: subscription } = useMySubscription();
  const { data: coupon, refetch: validateCoupon, isFetching: validatingCoupon } = useValidateCoupon(couponCode);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    const res = await validateCoupon();
    if (res.data) {
      setAppliedCoupon(couponCode);
      setError('');
    } else {
      setError('Invalid or expired promo code');
      setAppliedCoupon('');
    }
  };

  // Live total
  const { subtotal, discount, total } = useMemo(() => {
    let sub = 0;
    
    // Create a copy of subscription limits to simulate usage
    let remKg = subscription && subscription.currentPeriodEnd > new Date().toISOString() ? subscription.remainingKg : 0;
    let remPcs = subscription && subscription.currentPeriodEnd > new Date().toISOString() ? subscription.remainingPieces : 0;

    cart.forEach(item => {
      let qty = item.quantity;
      let price = item.service.pricePerUnit;
      
      if (item.service.unit === 'KG' && remKg > 0) {
        if (qty <= remKg) {
          remKg -= qty;
          price = 0;
        } else {
          const covered = remKg;
          remKg = 0;
          sub += (qty - covered) * price;
          return;
        }
      } else if (item.service.unit === 'PIECE' && remPcs > 0) {
        if (qty <= remPcs) {
          remPcs -= qty;
          price = 0;
        } else {
          const covered = remPcs;
          remPcs = 0;
          sub += (qty - covered) * price;
          return;
        }
      }
      sub += price * qty;
    });

    let disc = 0;
    if (appliedCoupon && coupon) {
      disc = sub * (coupon.discountPercentage / 100);
      if (coupon.maxDiscount && disc > coupon.maxDiscount) {
        disc = coupon.maxDiscount;
      }
    }

    return {
      subtotal: sub,
      discount: disc,
      total: Math.max(0, sub - disc)
    };
  }, [cart, appliedCoupon, coupon, subscription]);

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
      { items, street, city, state, pinCode, pickupTime: normalizePickupTime(pickupTime), specialInstructions: notes, couponCode: appliedCoupon, paymentMethod },
      { 
        onSuccess: (order) => {
          if (paymentMethod === 'ONLINE' && total > 0) {
            processPayment(
              order.publicId,
              user?.fullName || 'Customer',
              user?.email || '',
              user?.phone || '9999999999',
              () => {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                setShowSuccessModal(true);
              },
              (err) => setError(err.message || 'Payment failed.')
            );
          } else {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            setShowSuccessModal(true);
          }
        }, 
        onError: (err: any) => {
          setError(err.response?.data?.message ?? err.message ?? 'Failed to place order.');
        }
      }
    );
  };

  const minPickup = toLocalDateTimeValue(new Date(Date.now() + 60 * 60 * 1000));

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
          {['items', 'address', 'payment'].map((s, idx) => (
            <div key={s} className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (s === 'address' && cart.length > 0) setStep('address');
                  else if (s === 'payment' && street && city && state && pinCode && pickupTime) setStep('payment');
                  else if (s === 'items') setStep('items');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  step === s
                    ? 'bg-brand-gradient text-white shadow-glow-brand'
                    : 'bg-surface-card border border-surface-border text-gray-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s ? 'bg-white/20' : 'bg-surface-border'
                }`}>{idx + 1}</span>
                {s === 'items' ? 'Select Services' : s === 'address' ? 'Pickup Details' : 'Payment'}
              </button>
              {idx < 2 && <ChevronRight size={16} className="text-gray-600" />}
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

                      <div className="pt-4 border-t border-surface-border">
                        {discount > 0 && (
                          <div className="flex items-center justify-between text-sm mb-2 text-gray-400">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                          </div>
                        )}
                        {discount > 0 && (
                          <div className="flex items-center justify-between text-sm mb-2 text-emerald-400">
                            <span>Discount ({coupon?.code})</span>
                            <span>-₹{discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-lg">Estimated Total</span>
                          <span className="font-bold text-2xl text-brand-400">₹{total.toFixed(2)}</span>
                        </div>
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
                
                {discount > 0 && (
                  <>
                    <div className="pt-3 border-t border-surface-border flex justify-between text-sm text-gray-400">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-emerald-400">
                      <span>Discount ({coupon?.code})</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  </>
                )}

                <div className={`pt-3 flex justify-between font-bold ${discount > 0 ? 'border-t border-surface-border mt-2' : 'border-t border-surface-border'}`}>
                  <span>Total</span>
                  <span className="text-brand-400">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-card border border-surface-border rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2"><Tag size={18} className="text-brand-400" /> Promo Code</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                  className="flex-1 bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none uppercase"
                  disabled={!!appliedCoupon}
                />
                {!appliedCoupon ? (
                  <button
                    onClick={handleApplyCoupon}
                    disabled={!couponCode || validatingCoupon}
                    className="px-6 py-3 rounded-xl bg-surface-border hover:bg-brand-500/20 text-brand-400 font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    {validatingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                ) : (
                  <button
                    onClick={() => { setAppliedCoupon(''); setCouponCode(''); }}
                    className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold text-sm transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              {appliedCoupon && (
                <p className="text-emerald-400 text-sm mt-2">Promo code applied successfully!</p>
              )}
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
              <button onClick={() => {
                  if (!street || !city || !state || !pinCode || !pickupTime) {
                    setError('Please fill in all address and pickup time fields.');
                  } else {
                    setError('');
                    setStep('payment');
                  }
                }}
                className="flex-[2] flex-grow py-3 rounded-xl bg-brand-gradient font-semibold text-sm hover:shadow-glow-brand transition-all">
                Continue to Payment →
              </button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-surface-card border border-surface-border rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'ONLINE' ? 'border-brand-500 bg-brand-500/10' : 'border-surface-border hover:border-brand-500/50'}`}>
                  <input type="radio" name="paymentMethod" value="ONLINE" checked={paymentMethod === 'ONLINE'} onChange={() => setPaymentMethod('ONLINE')} className="text-brand-500" />
                  <div>
                    <div className="font-medium">Pay Online (Razorpay)</div>
                    <div className="text-sm text-gray-400">UPI, Credit/Debit Cards, NetBanking</div>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'PAY_LATER' ? 'border-brand-500 bg-brand-500/10' : 'border-surface-border hover:border-brand-500/50'}`}>
                  <input type="radio" name="paymentMethod" value="PAY_LATER" checked={paymentMethod === 'PAY_LATER'} onChange={() => setPaymentMethod('PAY_LATER')} className="text-brand-500" />
                  <div>
                    <div className="font-medium">Pay Later (Cash on Delivery)</div>
                    <div className="text-sm text-gray-400">Pay with cash when we deliver your clothes</div>
                  </div>
                </label>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-4">
              <button onClick={() => setStep('address')} className="flex-1 py-3 rounded-xl border border-surface-border text-sm text-gray-400 hover:border-brand-500/40 transition-colors">
                ← Back to Details
              </button>
              <button onClick={handleSubmit} disabled={createOrder.isPending}
                className="flex-[2] flex-grow py-3 rounded-xl bg-brand-gradient font-semibold text-sm disabled:opacity-50 hover:shadow-glow-brand transition-all">
                {createOrder.isPending ? 'Processing…' : `Confirm Order · ₹${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-card border border-surface-border rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-brand-gradient flex items-center justify-center mx-auto mb-6 shadow-glow-brand">
              <Package size={40} className="text-white" />
            </div>
            <h2 className="font-display font-bold text-2xl text-white mb-2">Order Confirmed!</h2>
            <p className="text-gray-400 mb-8 text-sm">Your pickup has been successfully scheduled. We'll be there soon.</p>
            <button 
              onClick={() => navigate('/orders')}
              className="w-full py-3.5 rounded-xl bg-surface-input border border-surface-border text-white font-semibold hover:border-brand-500/50 hover:bg-white/5 transition-all"
            >
              View My Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
