import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ChevronDown, LayoutDashboard, LogOut, Menu, Package, Settings, Shirt, User, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = !isLoading && isAuthenticated
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/orders', label: 'My Orders', icon: Package },
      ]
    : [];

  const dropdownItems = [
    ...(user?.role === 'ADMIN' || user?.role === 'WASHER'
      ? [{ to: '/admin/dashboard', label: 'Business Portal', icon: Building2 }]
      : []),
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/orders', label: 'My Orders', icon: Package },
    { to: '/account', label: 'Account', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-40 border-b border-surface-border bg-surface/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow-brand group-hover:scale-110 transition-transform">
              <Shirt size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">
              Lather <span className="text-brand-400">&</span> Line
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-400 transition-colors"
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!isLoading && (isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((open) => !open)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-surface-border bg-surface-input hover:border-brand-500/50 transition-all group"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-bold text-white shadow-glow-brand">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {user?.fullName?.split(' ')[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-surface-card border border-surface-border rounded-2xl shadow-card overflow-hidden animate-slide-up z-50">
                    <div className="px-4 py-3 border-b border-surface-border">
                      <p className="text-sm font-semibold text-white truncate">{user?.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/20">
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1">
                      {dropdownItems.map(({ to, label, icon: Icon }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Icon size={15} className="text-gray-500" />
                          {label}
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-surface-border py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-brand-gradient text-white px-4 py-2 rounded-lg hover:shadow-glow-brand transition-all"
                >
                  Get Started
                </Link>
              </>
            ))}
          </div>

          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-surface-border bg-surface-card animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            {!isLoading && isAuthenticated && (
              <div className="flex items-center gap-3 px-2 py-3 mb-2 border-b border-surface-border">
                <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-sm font-bold text-white">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
            )}

            {!isLoading && (isAuthenticated ? (
              <>
                {dropdownItems.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-2 py-2.5 text-gray-300 hover:text-brand-400 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-2 py-2.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors mt-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login" className="text-center text-gray-300 py-2" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className="text-center bg-brand-gradient text-white py-2 rounded-lg" onClick={() => setMobileOpen(false)}>Get Started</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
