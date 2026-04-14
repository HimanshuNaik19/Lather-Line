import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/authApi';
import { Shirt, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.register({ ...form, businessId: 1 });
      login(data);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (
    id: string,
    label: string,
    type: string,
    key: keyof typeof form,
    placeholder: string,
    required = true,
  ) => (
    <div className="space-y-1.5">
      <label className="text-sm text-gray-300 font-medium" htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        required={required}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm outline-none focus:border-brand-500 transition-colors"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 pt-16 pb-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-4 shadow-glow-brand">
            <Shirt size={26} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Create your account</h1>
          <p className="text-gray-400 text-sm mt-1">Start scheduling pickups in minutes</p>
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

          {field('reg-name',  'Full Name',    'text',  'fullName', 'Jane Doe')}
          {field('reg-email', 'Email',        'email', 'email',    'you@example.com')}
          {field('reg-phone', 'Phone Number', 'tel',   'phone',    '+91 9876543210', false)}

          <div className="space-y-1.5">
            <label className="text-sm text-gray-300 font-medium" htmlFor="reg-password">Password</label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min 8 characters"
                className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-3 pr-11 text-white placeholder-gray-500 text-sm outline-none focus:border-brand-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
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
            {loading ? 'Creating account…' : 'Create Account'}
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
