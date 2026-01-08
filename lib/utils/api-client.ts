/**
 * API Client Utilities with Retry Logic and Error Handling
 */

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

/**
 * Fetch with automatic retry and exponential backoff
 */
export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 30000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let i = 0; i <= retries; i++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      // Retry on server errors (5xx) or network issues
      if (!response.ok && i < retries) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response;
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on abort (user cancelled)
      if (error.name === 'AbortError') {
        throw error;
      }

      // Last attempt failed
      if (i === retries) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      const delay = retryDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Network status hook for detecting online/offline state
 */
export function useNetworkStatus() {
  if (typeof window === 'undefined') {
    return true; // Server-side, assume online
  }

  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Helper to check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.name === 'NetworkError' ||
    error?.message?.includes('fetch') ||
    error?.message?.includes('network') ||
    error?.code === 'ECONNREFUSED'
  );
}

/**
 * Helper to check if error is a timeout error
 */
export function isTimeoutError(error: any): boolean {
  return (
    error?.name === 'AbortError' ||
    error?.name === 'TimeoutError' ||
    error?.message?.includes('timeout')
  );
}

// Import React for the hook (will be used in component files)
import React from 'react';
