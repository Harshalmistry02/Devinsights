'use client';

import { Toaster as SonnerToaster } from 'sonner';

/**
 * Toast Notification Provider
 * Wraps the Sonner Toaster with custom styling
 */
export function ToastProvider() {
  return (
    <SonnerToaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'rgb(15 23 42 / 0.95)',
          border: '1px solid rgb(51 65 85 / 0.3)',
          color: '#e2e8f0',
          backdropFilter: 'blur(12px)',
        },
        className: 'sonner-toast',
      }}
    />
  );
}
