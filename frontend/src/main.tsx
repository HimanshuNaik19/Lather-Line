import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Loader2 } from 'lucide-react';

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ToastProvider } from '@/contexts/ToastContext';
import { Navbar } from '@/components/Navbar';
import { Chatbot } from '@/components/Chatbot';
import { OrderWebSocket } from '@/components/OrderWebSocket';
import ErrorBoundary from '@/components/ErrorBoundary';
import NotFoundPage from '@/pages/NotFoundPage';

// Layouts
import AdminLayout from '@/components/AdminLayout';
import WasherLayout from '@/components/WasherLayout';
import ManagerLayout from '@/components/ManagerLayout';
import { DriverLayout } from '@/components/DriverLayout';

// Customer pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import OrdersPage from '@/pages/OrdersPage';
import NewOrderPage from '@/pages/NewOrderPage';
import AccountPage from '@/pages/AccountPage';
import SettingsPage from '@/pages/SettingsPage';
import SubscriptionsPage from '@/pages/SubscriptionsPage';

// Admin pages
const AdminDashboardPage = React.lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminOrdersPage = React.lazy(() => import('@/pages/admin/AdminOrdersPage'));
const AdminOrderDetailsPage = React.lazy(() => import('@/pages/admin/AdminOrderDetailsPage'));
const AdminServicesPage = React.lazy(() => import('@/pages/admin/AdminServicesPage'));
const AdminInventoryPage = React.lazy(() => import('@/pages/admin/AdminInventoryPage'));
const AdminExpensesPage = React.lazy(() => import('@/pages/admin/AdminExpensesPage'));
const POSPage = React.lazy(() => import('@/pages/admin/POSPage'));
const AdminMarketingPage = React.lazy(() => import('@/pages/admin/AdminMarketingPage'));

// Washer pages
const WasherOrdersPage = React.lazy(() => import('@/pages/washer/WasherOrdersPage'));
const WasherOrderDetailsPage = React.lazy(() => import('@/pages/washer/WasherOrderDetailsPage'));

// Scanner
import ScanRouter from '@/pages/ScanRouter';

// Manager pages
const ManagerDashboardPage = React.lazy(() => import('@/pages/manager/ManagerDashboardPage'));
const ManagerOrdersPage = React.lazy(() => import('@/pages/manager/ManagerOrdersPage'));

// Driver pages
const DriverDeliveriesPage = React.lazy(() => import('@/pages/driver/DriverDeliveriesPage'));
const DriverAvailablePage = React.lazy(() => import('@/pages/driver/DriverAvailablePage'));

import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

// ── Route guards ──────────────────────────────────────────────────────────────

function Loading() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center text-white">
      <Loader2 size={36} className="animate-spin text-brand-400" />
    </div>
  );
}

/** Requires authentication — any role */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

/** Requires CUSTOMER role specifically */
function CustomerRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'CUSTOMER') return <Navigate to={roleHome(user.role)} replace />;
  return <>{children}</>;
}

/** Requires ADMIN role */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to={roleHome(user.role)} replace />;
  return <>{children}</>;
}

/** Requires MANAGER or ADMIN */
function ManagerRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'MANAGER' && user.role !== 'ADMIN') return <Navigate to={roleHome(user.role)} replace />;
  return <>{children}</>;
}

/** Requires WASHER, MANAGER, or ADMIN */
function WasherRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (!['WASHER', 'MANAGER', 'ADMIN'].includes(user.role)) return <Navigate to={roleHome(user.role)} replace />;
  return <>{children}</>;
}

/** Requires DRIVER */
function DriverRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'DRIVER') return <Navigate to={roleHome(user.role)} replace />;
  return <>{children}</>;
}

/** Maps role to its home URL */
function roleHome(role: string): string {
  switch (role) {
    case 'ADMIN':   return '/admin/dashboard';
    case 'MANAGER': return '/manager/dashboard';
    case 'WASHER':  return '/washer/orders';
    case 'DRIVER':  return '/driver/deliveries';
    default:        return '/dashboard';
  }
}

// ── Global UI elements (Navbar + Chatbot hidden in staff portals) ─────────────
function GlobalUI() {
  const location = useLocation();
  const isStaffPortal = ['/admin', '/washer', '/manager', '/driver'].some(p => location.pathname.startsWith(p));
  if (isStaffPortal) return null;
  return (
    <>
      <Navbar />
      <Chatbot />
    </>
  );
}

// ── App routes ────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <GlobalUI />
      <React.Suspense fallback={<Loading />}>
        <Routes>
        {/* ── Public ── */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/scan/:publicId" element={<ScanRouter />} />

        {/* ── Customer portal ── */}
        <Route path="/dashboard"  element={<CustomerRoute><DashboardPage /></CustomerRoute>} />
        <Route path="/orders/new" element={<CustomerRoute><NewOrderPage /></CustomerRoute>} />
        <Route path="/orders"     element={<CustomerRoute><OrdersPage /></CustomerRoute>} />
        <Route path="/subscriptions" element={<CustomerRoute><SubscriptionsPage /></CustomerRoute>} />
        <Route path="/account"    element={<PrivateRoute><AccountPage /></PrivateRoute>} />
        <Route path="/settings"   element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

        {/* ── Admin portal ── */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="orders"    element={<AdminOrdersPage />} />
          <Route path="orders/:publicId" element={<AdminOrderDetailsPage />} />
          <Route path="services"  element={<AdminServicesPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="expenses"  element={<AdminExpensesPage />} />
          <Route path="marketing" element={<AdminMarketingPage />} />
          <Route path="pos"       element={<POSPage />} />
        </Route>

        {/* ── Manager portal ── */}
        <Route path="/manager" element={<ManagerRoute><ManagerLayout /></ManagerRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboardPage />} />
          <Route path="orders"    element={<ManagerOrdersPage />} />
          <Route path="pos"       element={<POSPage />} />
          <Route path="account"   element={<AccountPage />} />
        </Route>

        {/* ── Washer portal ── */}
        <Route path="/washer" element={<WasherRoute><WasherLayout /></WasherRoute>}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders"  element={<WasherOrdersPage />} />
          <Route path="orders/:publicId" element={<WasherOrderDetailsPage />} />
          <Route path="pos"     element={<POSPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>

        {/* ── Driver portal ── */}
        <Route path="/driver" element={<DriverRoute><DriverLayout /></DriverRoute>}>
          <Route index element={<Navigate to="deliveries" replace />} />
          <Route path="deliveries" element={<DriverDeliveriesPage />} />
          <Route path="available"  element={<DriverAvailablePage />} />
          <Route path="account"    element={<AccountPage />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <OrderWebSocket />
            <App />
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
