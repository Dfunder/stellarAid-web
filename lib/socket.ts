'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let connectionPromise: Promise<Socket> | null = null;
let destroyTimeout: ReturnType<typeof setTimeout> | null = null;

function clearDestroyTimer() {
  if (destroyTimeout !== null) {
    clearTimeout(destroyTimeout);
    destroyTimeout = null;
  }
}

export function getSocket(accessToken?: string | null): Socket | null {
  if (typeof window === 'undefined') return null;

  clearDestroyTimer();

  if (socket?.connected) return socket;

  if (!connectionPromise) {
    const token = accessToken ?? window.localStorage.getItem('accessToken');

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      forceNew: false,
      multiplex: true,
    });

    socket.on('connect', () => {
      connectionPromise = null;
    });

    socket.on('disconnect', () => {
      connectionPromise = null;
    });

    socket.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message);
      connectionPromise = null;
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    connectionPromise = null;
  }
  clearDestroyTimer();
}

export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

if (typeof window !== 'undefined') {
  const cleanup = () => {
    if (socket?.connected) {
      socket.disconnect();
    }
  };
  window.addEventListener('beforeunload', cleanup);
  window.addEventListener('pagehide', cleanup);
}
