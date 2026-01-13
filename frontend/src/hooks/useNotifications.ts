/**
 * SSE Hook for Real-time Notifications
 * Manages Server-Sent Events connection
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import axiosInstance from '@/lib/axios';

export interface Notification {
  type: 'connected' | 'keepalive' | 'order_status' | 'new_order' | 'payment_verified' | 'error';
  message?: string;
  orderId?: string;
  orderNumber?: string;
  status?: string;
  previousStatus?: string;
  customerName?: string;
  total?: number;
  timestamp?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new SSE connection
    const connect = async () => {
      try {
        // The axios response doesn't support SSE directly
        // We need to create EventSource with the full URL
        const baseUrl = axiosInstance.defaults.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const eventSource = new EventSource(`${baseUrl}/api/v1/notifications/events`, {
          withCredentials: true,
        });

        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        eventSource.onmessage = (event) => {
          try {
            const notification: Notification = JSON.parse(event.data);
            
            if (notification.type === 'connected') {
              console.log('Notifications connected');
            } else if (notification.type === 'keepalive') {
              // Keepalive message, ignore
            } else {
              // Add new notification
              setNotifications(prev => [notification, ...prev].slice(0, 50));
              
              // Show toast notification
              if (notification.type === 'order_status') {
                // Trigger toast or other UI update
                console.log('Order status update:', notification);
              }
            }
          } catch (err) {
            console.error('Failed to parse notification:', err);
          }
        };

        eventSource.onerror = (err) => {
          console.error('SSE error:', err);
          setError('Connection error');
          setIsConnected(false);
          eventSource.close();
          
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            if (eventSourceRef.current === eventSource) {
              connect();
            }
          }, 5000);
        };

      } catch (err) {
        console.error('Failed to connect to notifications:', err);
        setError('Failed to connect');
        setIsConnected(false);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (index: number) => {
    setNotifications(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  return {
    notifications,
    isConnected,
    error,
    clearNotifications,
    markAsRead,
  };
}
