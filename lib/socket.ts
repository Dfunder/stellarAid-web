'use client';

import { io, Socket } from 'socket.io-client';

// Global socket instance
let socket: Socket | null = null;

// Function to get the socket instance
export function getSocket(accessToken?: string | null) {
  if (typeof window === 'undefined') return null;

  if (socket?.connected) return socket;

  const token = accessToken ?? window.localStorage.getItem('accessToken');

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
  });

  return socket;
}
// Function to disconnect the socket
export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
