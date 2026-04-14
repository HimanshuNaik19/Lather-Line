import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateOrder } from '@/hooks/useOrders';
import { useActiveServices } from '@/hooks/useServices';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function NewOrderPage() {
  const navigate = useNavigate();
  
  const { data: services, isLoading: isLoadingServices } = useActiveServices();
  const { mutate: createOrder, isPending: isCreating } = useCreateOrder();

  const [serviceId, setServiceId] = useState<number | ''>('');
  const [pickupDate, setPickupDate] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [pinCode, setPinCode] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const selectedService = services?.find(s => s.id === Number(serviceId));
  
  // Calculate a generic price if possible. Backend usually finalizes it, but we need to send it.
  const estimatedTotal = selectedService ? selectedService.pricePerUnit : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId) return setError('Please select a service type.');
    if (!pickupDate || !pickupTime) return setError('Please select a pickup timeslot.');
    if (!street || !city || !state || !pinCode) return setError('Please provide a complete pickup address.');

    // Combine date and time to ISO
    const dateTimeString = `${pickupDate}T${pickupTime}:00`;

    const request = {
      serviceTypeId: Number(serviceId),
      street,
      city,
      state,
      pinCode,
      pickupTime: dateTimeString,
      totalAmount: estimatedTotal,
      specialInstructions: instructions
    };

    createOrder(request, {
      onSuccess: () => navigate('/dashboard'),
      onError: (err: any) => setError(err?.response?.data?.message || 'Failed to create order. Please try again.')
    });
  };

  // Generate the next 7 days for pickup
  const dateOptions = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(new Date(), i + 1);
    return {
      value: format(d, 'yyyy-MM-dd'),
      label: format(d, 'EEEE, MMM do')
    };
  });

  return (
    <div className="min-h-screen bg-surface text-white pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="flex flex-col mb-8 animate-fade-in">
          <h1 className="font-display font-bold text-3xl">New Order</h1>
          <p className="text-gray-400 mt-1">Schedule a pickup for your laundry</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
          
          {/* Service Selection */}
          <div className="bg-card-gradient border border-surface-border rounded-2xl p-6">
            <h2 className="font-display font-semibold text-xl mb-4">1. Select Service</h2>
            {isLoadingServices ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin text-brand-400" />
              </div>
            ) : services?.length === 0 ? (
              <p className="text-gray-400">No services available right now. Please try again later.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {services?.map((svc) => (
                  <button
                    type="button"
                    key={svc.id}
                    onClick={() => setServiceId(svc.id)}
                    className={`flex flex-col gap-2 p-4 rounded-xl border text-left transition-all ${
                      serviceId === svc.id 
                        ? 'bg-brand-gradient border-brand-400 shadow-glow-brand' 
                        : 'bg-surface-input border-surface-border hover:border-brand-500/50'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-semibold">{svc.name}</span>
                      {serviceId === svc.id && <CheckCircle2 size={18} className="text-white" />}
                    </div>
                    <span className="text-sm text-gray-300">₹{svc.pricePerUnit} / unit</span>
                    <span className="text-xs text-gray-400 line-clamp-2">{svc.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pickup Details */}
          <div className="bg-card-gradient border border-surface-border rounded-2xl p-6">
            <h2 className="font-display font-semibold text-xl mb-4">2. Pickup Schedule</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Date</label>
                <select 
                  className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2.5 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                  value={pickupDate}
                  onChange={e => setPickupDate(e.target.value)}
                  required
                >
                  <option value="">Select a date</option>
                  {dateOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Time Segment</label>
                <select 
                  className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2.5 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                  value={pickupTime}
                  onChange={e => setPickupTime(e.target.value)}
                  required
                >
                  <option value="">Select time</option>
                  <option value="09:00">09:00 AM - 11:00 AM</option>
                  <option value="11:00">11:00 AM - 01:00 PM</option>
                  <option value="14:00">02:00 PM - 04:00 PM</option>
                  <option value="16:00">04:00 PM - 06:00 PM</option>
                  <option value="18:00">06:00 PM - 08:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="bg-card-gradient border border-surface-border rounded-2xl p-6">
            <h2 className="font-display font-semibold text-xl mb-4">3. Pickup Address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-gray-300 block">Street / Apartment / Area</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2.5 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="e.g. 101, Residency, MG Road"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">City</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2.5 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Mumbai"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">State</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2.5 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  placeholder="Maharashtra"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-gray-300 block">Pin Code</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2.5 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                  value={pinCode}
                  onChange={e => setPinCode(e.target.value)}
                  placeholder="400001"
                  required
                />
              </div>
            </div>
          </div>

          {/* Special Instructions & Submit */}
          <div className="bg-card-gradient border border-surface-border rounded-2xl p-6">
            <h2 className="font-display font-semibold text-xl mb-4">4. Additional Info</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">Remarks / Instructions (Optional)</label>
                <textarea 
                  className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2.5 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all resize-none h-24"
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="e.g. Wash white clothes separately, do not dry clean, etc."
                />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-surface-border">
                <div>
                  <p className="text-sm text-gray-400">Estimated Total</p>
                  <p className="font-display font-bold text-2xl text-brand-400">
                    ₹{estimatedTotal.toFixed(2)}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-brand-gradient text-white font-semibold hover:shadow-glow-brand hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                  {isCreating ? <Loader2 size={20} className="animate-spin" /> : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
