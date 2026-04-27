import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMyOrders } from '@/hooks/useOrders';
import {
  User, Mail, Phone, Shield, Calendar, Package,
  CheckCircle2, Clock, Edit3, Save, X, Camera,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { format } from 'date-fns';

export default function AccountPage() {
  const { user } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useMyOrders();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone]     = useState('');
  const [saved, setSaved]     = useState(false);

  const totalOrders = orders?.length ?? 0;
  const delivered   = orders?.filter((o) => o.orderStatus === 'DELIVERED').length ?? 0;
  const inProgress  = orders?.filter((o) =>
    ['PENDING', 'PICKED_UP', 'IN_PROGRESS', 'READY'].includes(o.orderStatus)
  ).length ?? 0;

  const handleSave = () => {
    // TODO: wire to PATCH /api/users/me when backend endpoint is ready
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const avatarInitials = (user?.fullName ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-surface text-white pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Page header ─────────────────────────────────── */}
        <div className="animate-fade-in">
          <h1 className="font-display font-bold text-3xl">My Account</h1>
          <p className="text-gray-400 mt-1">Manage your profile and view your activity</p>
        </div>

        {/* ── Profile card ────────────────────────────────── */}
        <div className="bg-card-gradient border border-surface-border rounded-2xl p-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center text-2xl font-bold text-white shadow-glow-brand select-none">
                {avatarInitials}
              </div>
              <button className="absolute -bottom-2 -right-2 w-7 h-7 bg-surface-card border border-surface-border rounded-full flex items-center justify-center hover:border-brand-500/50 transition-colors">
                <Camera size={13} className="text-gray-400" />
              </button>
            </div>

            {/* Name & role */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display font-bold text-xl text-white">
                  {user?.fullName}
                </h2>
                <span className="px-2.5 py-0.5 text-xs rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/20">
                  {user?.role}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
              <p className="text-gray-500 text-xs mt-1">Member since April 2026</p>
            </div>

            {/* Edit toggle */}
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-medium hover:shadow-glow-brand transition-all"
                  >
                    <Save size={14} /> Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-surface-border text-gray-400 text-sm hover:border-brand-500/40 transition-colors"
                  >
                    <X size={14} /> Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-surface-border text-gray-300 text-sm hover:border-brand-500/50 hover:text-white transition-all"
                >
                  <Edit3 size={14} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {saved && (
            <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm animate-fade-in">
              <CheckCircle2 size={15} /> Profile saved successfully
            </div>
          )}
        </div>

        {/* ── Profile details form ─────────────────────────── */}
        <div className="bg-card-gradient border border-surface-border rounded-2xl p-6 animate-slide-up">
          <h3 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
            <User size={17} className="text-brand-400" /> Personal Information
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-surface-input border border-brand-500/50 rounded-lg px-4 py-2.5 text-white focus:border-brand-400 focus:ring-1 focus:ring-brand-400 outline-none transition-all"
                />
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-input border border-surface-border text-white">
                  <User size={15} className="text-gray-500 shrink-0" />
                  <span>{user?.fullName}</span>
                </div>
              )}
            </div>

            {/* Email (read-only always) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Email Address</label>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-input border border-surface-border text-gray-400">
                <Mail size={15} className="text-gray-500 shrink-0" />
                <span className="truncate">{user?.email}</span>
                <span className="ml-auto text-xs text-gray-600 shrink-0">Read-only</span>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Phone Number</label>
              {editing ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-surface-input border border-brand-500/50 rounded-lg px-4 py-2.5 text-white focus:border-brand-400 focus:ring-1 focus:ring-brand-400 outline-none transition-all"
                />
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-input border border-surface-border text-gray-400">
                  <Phone size={15} className="text-gray-500 shrink-0" />
                  <span>{phone || 'Not set'}</span>
                </div>
              )}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Account Role</label>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-input border border-surface-border text-gray-400">
                <Shield size={15} className="text-gray-500 shrink-0" />
                <span>{user?.role}</span>
                <span className="ml-auto text-xs text-gray-600 shrink-0">Read-only</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Orders',  value: totalOrders, icon: Package,     color: 'text-brand-400',  bg: 'bg-brand-500/10' },
            { label: 'In Progress',   value: inProgress,  icon: Clock,       color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: 'Delivered',     value: delivered,   icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-card-gradient border border-surface-border rounded-2xl p-5 flex flex-col gap-3 hover:border-brand-500/30 transition-colors">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="font-display font-bold text-2xl">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Recent orders ─────────────────────────────────── */}
        <div className="bg-card-gradient border border-surface-border rounded-2xl p-6 animate-slide-up">
          <h3 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
            <Calendar size={17} className="text-brand-400" /> Order History
          </h3>
          {ordersLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !orders?.length ? (
            <div className="text-center py-10 text-gray-500">
              <Package size={36} className="mx-auto mb-3 opacity-40" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-surface-input border border-surface-border hover:border-brand-500/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-white truncate">
                      Order #{order.id} · {order.serviceTypeName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(new Date(order.pickupTime), 'dd MMM yyyy, h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={order.orderStatus} />
                    <span className="text-brand-400 font-semibold text-sm">₹{order.totalAmount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
