import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../app/providers/auth.provider.jsx';

export const useSocket = (namespace = '/') => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const { tokens } = useAuth();

  useEffect(() => {
    if (!tokens?.accessToken) return;

    // ✅ /api'yi kaldır, sadece base URL'i al
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    const socket = io(`${baseUrl}${namespace}`, {
      auth: {
        token: tokens.accessToken,
      },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🟢 Socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setIsConnected(false);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [tokens?.accessToken, namespace]);

  const emit = useCallback((event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  }, [isConnected]);

  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  return { socket: socketRef.current, isConnected, emit, on, off };
};