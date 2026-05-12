import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { ORDER_KEYS } from '@/hooks/useOrders';

export function OrderWebSocket() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !user?.businessId) return;
    // Only connect for admin and washer roles who manage orders
    if (user.role !== 'ADMIN' && user.role !== 'WASHER') return;

    const client = new Client({
      // Use native WebSocket instead of SockJS to avoid ESM import issues.
      // The backend registers /ws as a SockJS endpoint which also accepts raw WS.
      brokerURL: `ws://localhost:8080/ws/websocket`,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      // Silence debug noise in production
      debug: () => {},
    });

    client.onConnect = () => {
      console.log('[WS] Connected to Order WebSocket');
      const topic = `/topic/tenant/${user.businessId}/orders`;

      client.subscribe(topic, (message) => {
        if (message.body) {
          console.log('[WS] Order update received');
          queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('[WS] STOMP error:', frame.headers['message']);
    };

    client.onDisconnect = () => {
      console.log('[WS] Disconnected from Order WebSocket');
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [user?.businessId, user?.role, isAuthenticated, queryClient]);

  return null;
}
