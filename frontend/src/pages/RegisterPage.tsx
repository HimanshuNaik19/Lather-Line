import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/authApi';
import { Shirt, Eye, EyeOff, Loader2, KeyRound, Building2 } from 'lucide-react';

type Mode = 'join' | 'create';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('join');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Join mode fields
  const [businessCode, setBusinessCode] = useState('');

  // Create mode fields
  const [businessName, setBusinessName] = useState('');
  const [newBusinessCode, setNewBusinessCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      let data;
      if (mode === 'join') {
        data = await authApi.register({ email, password, fullName, phone, businessCode });
      } else {
        if (newBusinessCode.length < 3) {
          setError('Business code must be at least 3 characters.');
          setLoading(false);
          return;
        }
        data = await authApi.registerBusiness({
          email,
          password,
          fullName,
          phone,
          businessName,
          businessCode: newBusinessCode,
          contactEmail: email,
        });
      }
      login(data);
      navigate(mode === 'create' ? '/admin/dashboard' : '/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm outline-none focus:border-brand-500 transition-colors';

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 pt-16 pb-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-4 shadow-glow-brand">
            <Shirt size={26} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Get Started</h1>
          <p className="text-gray-400 text-sm mt-1">
            {mode === 'join' ? 'Join an existing laundry store' : 'Register your laundry business'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-xl bg-surface-dark border border-surface-border p-1 mb-6">
          <button
            type="button"
            onClick={() => { setMode('join'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'join'
                ? 'bg-brand-gradient text-white shadow-glow-brand'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <KeyRound size={15} />
            Join a Store
          </button>
          <button
            type="button"
            onClick={() => { setMode('create'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'create'
                ? 'bg-brand-gradient text-white shadow-glow-brand'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Building2 size={15} />
            Create a Store
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card-gradient border border-surface-border rounded-2xl p-8 space-y-5 shadow-card animate-slide-up"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Shared fields */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-300 font-medium" htmlFor="reg-name">Full Name</label>
            <input id="reg-name" type="text" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-gray-300 font-medium" htmlFor="reg-email">Email</label>
            <input id="reg-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-gray-300 font-medium" htmlFor="reg-phone">Phone Number</label>
            <input id="reg-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" className={inputClass} />
          </div>

          {/* Mode-specific fields */}
          {mode === 'join' ? (
            <div className="space-y-1.5">
              <label className="text-sm text-gray-300 font-medium flex items-center gap-1.5" htmlFor="reg-code">
                <KeyRound size={13} className="text-brand-400" /> Business Invite Code
              </label>
              <input
                id="reg-code"
                type="text"
                required
                value={businessCode}
                onChange={(e) => setBusinessCode(e.target.value)}
                placeholder="e.g. sunshine"
                className={inputClass}
              />
              <p className="text-xs text-gray-500">Your laundry business will provide this code when you sign up.</p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium flex items-center gap-1.5" htmlFor="reg-biz-name">
                  <Building2 size={13} className="text-brand-400" /> Business Name
                </label>
                <input
                  id="reg-biz-name"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Sunshine Laundry"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium flex items-center gap-1.5" htmlFor="reg-biz-code">
                  <KeyRound size={13} className="text-brand-400" /> Store Code
                </label>
                <input
                  id="reg-biz-code"
                  type="text"
                  required
                  value={newBusinessCode}
                  onChange={(e) => setNewBusinessCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="e.g. sunshine"
                  className={inputClass}
                />
                <p className="text-xs text-gray-500">This unique code is what your customers will use to join your store. Use lowercase letters, numbers, and hyphens only.</p>
              </div>
            </>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-300 font-medium" htmlFor="reg-password">Password</label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                aria-label="Toggle password visibility"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-gradient text-white font-semibold hover:shadow-glow-brand hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading
              ? (mode === 'create' ? 'Creating business…' : 'Creating account…')
              : (mode === 'create' ? 'Create My Business' : 'Create Account')}
          </button>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
