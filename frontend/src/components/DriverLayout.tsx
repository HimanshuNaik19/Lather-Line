import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Truck, User, LogOut, Package, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function DriverLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/driver/deliveries', label: 'My Deliveries', icon: Truck },
    { to: '/driver/available', label: 'Available Pickups', icon: Package },
    { to: '/driver/account', label: 'My Account', icon: User },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row font-sans text-white">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-surface-dark border-b border-surface-border">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="text-gray-400 hover:text-white">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Truck size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg">Driver Portal</span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-surface-dark border-r border-surface-border flex flex-col animate-slide-in-right h-full">
            <div className="flex items-center justify-between p-4 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                  <Truck size={16} className="text-white" />
                </div>
                <span className="font-display font-bold text-lg">Driver</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {links.map((link) => {
                const isActive = location.pathname.startsWith(link.to);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-surface-border mt-auto">
              <div className="px-3 py-2 mb-2">
                <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-surface-dark border-r border-surface-border p-4">
        <div className="flex items-center gap-2 px-2 mb-8 mt-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
            <Truck size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-wide">Driver</span>
        </div>

        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname.startsWith(link.to);
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-surface-border mt-auto">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-semibold truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-surface relative h-[calc(100vh-4.5rem)] md:h-screen">
        {/* Background glow specific to driver */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
        
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
