import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Bell, Lock, Globe,
  Eye, EyeOff, CheckCircle2, ChevronRight, Smartphone, Trash2, Shield,
} from 'lucide-react';

// ── Reusable toggle switch ────────────────────────────────────────────────────
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? 'bg-brand-500' : 'bg-surface-input'
      } border border-surface-border`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card-gradient border border-surface-border rounded-2xl p-6 animate-slide-up">
      <h3 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
        <Icon size={17} className="text-brand-400" />
        {title}
      </h3>
      {children}
    </div>
  );
}

// ── Row item ─────────────────────────────────────────────────────────────────
function SettingRow({ label, description, children }: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-surface-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();

  // Notification preferences
  const [emailNotif,  setEmailNotif]  = useState(true);
  const [smsNotif,    setSmsNotif]    = useState(false);
  const [pushNotif,   setPushNotif]   = useState(true);
  const [orderUpdate, setOrderUpdate] = useState(true);
  const [promoNotif,  setPromoNotif]  = useState(false);

  // Appearance
  const [darkMode,    setDarkMode]    = useState(true);
  const [language,    setLanguage]    = useState('en');

  // Password change state
  const [changingPwd,  setChangingPwd]  = useState(false);
  const [currentPwd,   setCurrentPwd]   = useState('');
  const [newPwd,       setNewPwd]       = useState('');
  const [confirmPwd,   setConfirmPwd]   = useState('');
  const [showCurrent,  setShowCurrent]  = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [pwdSaved,     setPwdSaved]     = useState(false);
  const [pwdError,     setPwdError]     = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handlePasswordSave = () => {
    setPwdError(null);
    if (!currentPwd || !newPwd || !confirmPwd) return setPwdError('All fields are required.');
    if (newPwd.length < 8) return setPwdError('New password must be at least 8 characters.');
    if (newPwd !== confirmPwd) return setPwdError('Passwords do not match.');
    // TODO: wire to PATCH /api/users/me/password when endpoint is ready
    setPwdSaved(true);
    setChangingPwd(false);
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    setTimeout(() => setPwdSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-surface text-white pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="font-display font-bold text-3xl">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your preferences and account security</p>
        </div>

        {pwdSaved && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm animate-fade-in">
            <CheckCircle2 size={15} /> Password updated successfully
          </div>
        )}

        {/* ── Notifications ──────────────────────────────── */}
        <Section title="Notifications" icon={Bell}>
          <SettingRow label="Email Notifications" description="Receive order updates via email">
            <Toggle enabled={emailNotif} onChange={setEmailNotif} />
          </SettingRow>
          <SettingRow label="SMS Alerts" description="Get a text when your order status changes">
            <Toggle enabled={smsNotif} onChange={setSmsNotif} />
          </SettingRow>
          <SettingRow label="Push Notifications" description="Browser or app push alerts">
            <Toggle enabled={pushNotif} onChange={setPushNotif} />
          </SettingRow>
          <SettingRow label="Order Status Updates" description="Pickup, in-progress, ready, delivered">
            <Toggle enabled={orderUpdate} onChange={setOrderUpdate} />
          </SettingRow>
          <SettingRow label="Promotions & Offers" description="Discounts and seasonal deals">
            <Toggle enabled={promoNotif} onChange={setPromoNotif} />
          </SettingRow>
        </Section>

        {/* ── Appearance ─────────────────────────────────── */}
        <Section title="Appearance & Language" icon={Globe}>
          <SettingRow label="Dark Mode" description="Use dark theme across the app">
            <Toggle enabled={darkMode} onChange={setDarkMode} />
          </SettingRow>
          <SettingRow label="Language">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-surface-input border border-surface-border rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-brand-500 transition-colors"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
            </select>
          </SettingRow>
        </Section>

        {/* ── Security ───────────────────────────────────── */}
        <Section title="Security" icon={Shield}>
          <SettingRow label="Change Password" description="Update your login password">
            <button
              onClick={() => setChangingPwd((v) => !v)}
              className="flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors"
            >
              {changingPwd ? 'Cancel' : 'Change'}
              {!changingPwd && <ChevronRight size={14} />}
            </button>
          </SettingRow>

          {changingPwd && (
            <div className="mt-4 space-y-3 animate-fade-in">
              {pwdError && (
                <p className="text-xs text-red-400 px-1">{pwdError}</p>
              )}
              {/* Current password */}
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Current password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2.5 pr-10 text-white text-sm focus:border-brand-500 outline-none transition-all"
                />
                <button type="button" onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* New password */}
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="New password (min 8 chars)"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2.5 pr-10 text-white text-sm focus:border-brand-500 outline-none transition-all"
                />
                <button type="button" onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Confirm */}
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2.5 text-white text-sm focus:border-brand-500 outline-none transition-all"
              />
              <button
                onClick={handlePasswordSave}
                className="w-full py-2.5 rounded-lg bg-brand-gradient text-white text-sm font-semibold hover:shadow-glow-brand transition-all"
              >
                <Lock size={14} className="inline mr-2" />
                Update Password
              </button>
            </div>
          )}

          <SettingRow label="Two-Factor Authentication" description="Add an extra layer of security">
            <button className="flex items-center gap-1 text-sm text-gray-500 cursor-not-allowed" disabled>
              <Smartphone size={14} /> Coming Soon
            </button>
          </SettingRow>

          <SettingRow label="Active Sessions" description="Manage where you're logged in">
            <button className="flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors">
              View <ChevronRight size={14} />
            </button>
          </SettingRow>
        </Section>

        {/* ── Account ────────────────────────────────────── */}
        <Section title="Account" icon={Lock}>
          <SettingRow label="Signed in as" description={user?.email ?? ''}>
            <span className="px-2.5 py-0.5 text-xs rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/20">
              {user?.role}
            </span>
          </SettingRow>

          <SettingRow label="Sign Out" description="Log out of this device">
            <button
              onClick={() => logout()}
              className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium"
            >
              Sign Out
            </button>
          </SettingRow>

          <div className="pt-4 mt-2 border-t border-surface-border">
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-2 text-sm text-red-500/70 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} /> Delete Account
              </button>
            ) : (
              <div className="flex items-center gap-3 animate-fade-in">
                <p className="text-sm text-red-400 flex-1">
                  Are you sure? This cannot be undone.
                </p>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="text-xs bg-red-500/20 border border-red-500/40 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            )}
          </div>
        </Section>

      </div>
    </div>
  );
}
