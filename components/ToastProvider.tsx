'use client';

import { Toaster as SonnerToaster } from 'sonner';

/**
 * Toast notifications share the design-system surface, border and icon tones.
 */
export function ToastProvider() {
  return (
    <SonnerToaster
      position="bottom-right"
      theme="dark"
      expand={false}
      richColors={false}
      closeButton
      offset={{ bottom: 80, right: 24 }}
      mobileOffset={{ bottom: 24, right: 16 }}
      toastOptions={{
        className: 'devinsight-toast',
        duration: 4500,
      }}
    />
  );
}
