'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      containerStyle={{ zIndex: 9999 }}
      toastOptions={{
        success: {
          style: {
            background: '#10b981',
            color: '#ffffff',
            fontWeight: '500',
            borderRadius: '8px',
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 9999,
          },
        },
        error: {
          style: {
            background: '#ef4444',
            color: '#ffffff',
            fontWeight: '500',
            borderRadius: '8px',
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 9999,
          },
        },
        loading: {
          style: {
            background: '#3b82f6',
            color: '#ffffff',
            fontWeight: '500',
            borderRadius: '8px',
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 9999,
          },
        },
        style: {
          background: '#0ea5e9',
          color: '#ffffff',
          fontWeight: '500',
          borderRadius: '8px',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          padding: '12px 16px',
          fontSize: '14px',
          maxWidth: '400px',
          zIndex: 9999,
        },
        duration: 4000,
      }}
    />
  );
}
