import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function ScanRouter() {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      // Redirect to login with a return URL
      navigate(`/login?returnTo=${encodeURIComponent(location.pathname)}`, { replace: true });
      return;
    }

    // Role-based routing
    if (user.role === 'ADMIN' || user.role === 'MANAGER') {
      navigate(`/admin/orders/${publicId}`, { replace: true });
    } else if (user.role === 'WASHER') {
      navigate(`/washer/orders/${publicId}`, { replace: true });
    } else if (user.role === 'DRIVER') {
      navigate(`/driver/deliveries`, { replace: true }); // Drivers don't have detail pages yet
    } else {
      // Customers
      navigate(`/orders?orderId=${publicId}`, { replace: true });
    }
  }, [user, isLoading, isAuthenticated, navigate, publicId, location.pathname]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4 text-gray-400">
        <Loader2 size={36} className="animate-spin text-brand-400" />
        <p>Routing to order details...</p>
      </div>
    </div>
  );
}
