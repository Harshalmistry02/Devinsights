'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { SyncProgressEvent } from '@/lib/sync/sync-stream';

export function useSyncStream() {
  const [progress, setProgress] = useState<SyncProgressEvent | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startSync = useCallback(async (fullSync = false) => {
    setIsStreaming(true);
    setError(null);
    setProgress(null);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/sync/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullSync }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              setIsStreaming(false);
              break;
            }

            try {
              const event = JSON.parse(data);
              setProgress(event);

              if (event.phase === 'error') {
                setError(event.message);
                setIsStreaming(false);
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Sync was cancelled by user
        setError('Sync cancelled');
      } else {
        const message = err instanceof Error ? err.message : 'Sync failed';
        setError(message);
      }
      setIsStreaming(false);
    }
  }, []);

  const stopSync = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    progress,
    isStreaming,
    error,
    startSync,
    stopSync,
  };
}
