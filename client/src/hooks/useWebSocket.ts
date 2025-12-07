import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/_core/hooks/useAuth';

interface UseWebSocketOptions {
  pageId?: number;
  onViewersChange?: (viewers: Array<{ userId: number; userName: string; isTyping: boolean }>) => void;
  onContentChange?: (data: { userId: number; userName: string; content: any; timestamp: Date }) => void;
  onUserTyping?: (data: { userId: number; userName: string; isTyping: boolean }) => void;
  onCursorUpdate?: (data: { userId: number; userName: string; position: { x: number; y: number } }) => void;
}

/**
 * useWebSocket hook provides real-time collaboration features.
 * 
 * Features:
 * - Presence tracking (who's viewing the page)
 * - Typing indicators
 * - Live cursor positions
 * - Content synchronization
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [viewers, setViewers] = useState<Array<{ userId: number; userName: string; isTyping: boolean }>>([]);

  useEffect(() => {
    if (!user) return;

    // Connect to WebSocket server
    const socket = io({
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Handle connection
    socket.on('connect', () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);

      // Authenticate
      socket.emit('authenticate', {
        userId: user.id,
        userName: user.name || 'Anonymous',
      });

      // Join page if pageId is provided
      if (options.pageId) {
        socket.emit('page:view', { pageId: options.pageId });
      }
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
    });

    // Handle page viewers updates
    socket.on('page:viewers', (data: { pageId: number; viewers: any[] }) => {
      setViewers(data.viewers);
      options.onViewersChange?.(data.viewers);
    });

    // Handle content changes
    socket.on('content:changed', (data: any) => {
      options.onContentChange?.(data);
    });

    // Handle typing indicators
    socket.on('user:typing', (data: any) => {
      options.onUserTyping?.(data);
    });

    // Handle cursor updates
    socket.on('cursor:update', (data: any) => {
      options.onCursorUpdate?.(data);
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [user, options.pageId]);

  // Update page view when pageId changes
  useEffect(() => {
    if (socketRef.current && isConnected && options.pageId) {
      socketRef.current.emit('page:view', { pageId: options.pageId });
    }
  }, [options.pageId, isConnected]);

  const startTyping = () => {
    if (socketRef.current && options.pageId) {
      socketRef.current.emit('typing:start', { pageId: options.pageId });
    }
  };

  const stopTyping = () => {
    if (socketRef.current && options.pageId) {
      socketRef.current.emit('typing:stop', { pageId: options.pageId });
    }
  };

  const updateCursor = (x: number, y: number) => {
    if (socketRef.current && options.pageId) {
      socketRef.current.emit('cursor:move', { pageId: options.pageId, x, y });
    }
  };

  const updateContent = (content: any) => {
    if (socketRef.current && options.pageId) {
      socketRef.current.emit('content:update', { pageId: options.pageId, content });
    }
  };

  return {
    isConnected,
    viewers,
    startTyping,
    stopTyping,
    updateCursor,
    updateContent,
  };
}
