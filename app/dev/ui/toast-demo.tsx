'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

/** Temporary toast preview for Phase 3 review. */
export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          toast('Sync started', {
            description: 'Fetching repositories from GitHub.',
          })
        }
      >
        Default toast
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          toast.success('Sync complete', {
            description: '48 repositories and 283 commits are up to date.',
          })
        }
      >
        Success toast
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          toast.warning('Partial sync', {
            description: 'Some repositories could not be synced.',
          })
        }
      >
        Warning toast
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          toast.error('Sync failed', {
            description: 'Check your GitHub connection and try again.',
          })
        }
      >
        Error toast
      </Button>
    </div>
  );
}
