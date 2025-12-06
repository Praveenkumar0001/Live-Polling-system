import { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

// SINGLE GLOBAL SOCKET
let socket = null;
let isInitializing = false;
let initPromise = null;

const initSocket = () => {
  if (socket) return Promise.resolve(socket);
  if (initPromise) return initPromise;

  isInitializing = true;
  
  initPromise = new Promise((resolve) => {
    console.log('🔌 Creating socket connection to:', SOCKET_URL);
    
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('✅ Socket CONNECTED:', socket.id);
      isInitializing = false;
      resolve(socket);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket DISCONNECTED:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 Connection error:', error.message);
    });

    // If already connected, resolve immediately
    if (socket.connected) {
      isInitializing = false;
      resolve(socket);
    }
  });

  return initPromise;
};

export const useSocket = () => {
  const [connected, setConnected] = useState(false);
  const [currentSocket, setCurrentSocket] = useState(null);

  useEffect(() => {
    initSocket().then((sock) => {
      setCurrentSocket(sock);
      setConnected(sock.connected);

      const handleConnect = () => setConnected(true);
      const handleDisconnect = () => setConnected(false);

      sock.on('connect', handleConnect);
      sock.on('disconnect', handleDisconnect);

      return () => {
        sock.off('connect', handleConnect);
        sock.off('disconnect', handleDisconnect);
      };
    });
  }, []);

  const emit = useCallback((event, data) => {
    if (socket && socket.connected) {
      console.log(`📤 Emitting ${event}`);
      socket.emit(event, data);
      return true;
    }
    console.error(`❌ Cannot emit ${event} - not connected`);
    return false;
  }, []);

  const on = useCallback((event, handler) => {
    if (socket) {
      socket.on(event, handler);
      return () => socket.off(event, handler);
    }
  }, []);

  return { socket: currentSocket, connected, emit, on };
};

export const getSocket = () => socket;
export const waitForSocket = () => initSocket();