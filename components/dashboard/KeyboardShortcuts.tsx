'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Keyboard, X } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';

const SHORTCUTS = [
  { keys: ['G', 'D'], description: 'Go to dashboard' },
  { keys: ['G', 'I'], description: 'Go to insights' },
  { keys: ['G', 'P'], description: 'Go to profile' },
  { keys: ['G', 'R'], description: 'Go to repositories' },
  { keys: ['G', 'S'], description: 'Go to settings' },
  { keys: ['CMD/CTRL', 'S'], description: 'Trigger sync' },
  { keys: ['CMD/CTRL', 'K'], description: 'Search (coming soon)' },
  { keys: ['?'], description: 'Show this help' },
  { keys: ['ESC'], description: 'Close modals' },
];

/**
 * Global keyboard shortcuts.
 */
export function KeyboardShortcuts() {
  const router = useRouter();
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleKeyPress = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        console.log('Search shortcut triggered (feature coming soon)');
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        document.getElementById('sync-button')?.click();
        return;
      }

      if (event.key === 'g') {
        setPressedKey('g');

        const handleNextKey = (nextEvent: KeyboardEvent) => {
          const nextTarget = nextEvent.target as HTMLElement;
          if (
            nextTarget.tagName === 'INPUT' ||
            nextTarget.tagName === 'TEXTAREA' ||
            nextTarget.isContentEditable
          ) {
            cleanup();
            return;
          }

          if (nextEvent.key === 'd') router.push('/dashboard');
          else if (nextEvent.key === 'i') router.push('/insights');
          else if (nextEvent.key === 'p') router.push('/profile');
          else if (nextEvent.key === 'r') router.push('/repositories');
          else if (nextEvent.key === 's') router.push('/settings');

          cleanup();
        };

        const cleanup = () => {
          setPressedKey(null);
          window.removeEventListener('keydown', handleNextKey);
          clearTimeout(timeoutId);
        };

        window.addEventListener('keydown', handleNextKey);
        timeoutId = setTimeout(cleanup, 1000);
      }

      if (event.key === '?') {
        event.preventDefault();
        document.getElementById('shortcuts-help-button')?.click();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [router]);

  if (pressedKey === 'g') {
    return (
      <div
        className="fixed bottom-6 left-6 z-40 rounded-card border border-border bg-surface-2 px-4 py-3 shadow-[0_16px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        role="status"
      >
        <p className="text-caption text-text">
          Press D, I, R, P or S to navigate.
        </p>
      </div>
    );
  }

  return null;
}

/**
 * Keyboard shortcuts help button and modal.
 */
export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    helpButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFrame = requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  return (
    <>
      <Tooltip
        content="Keyboard shortcuts (?)"
        className="fixed bottom-6 right-6 z-40 hidden sm:inline-flex"
      >
        <button
          ref={helpButtonRef}
          id="shortcuts-help-button"
          type="button"
          onClick={() => setIsOpen(true)}
          className="focus-ring flex size-10 items-center justify-center rounded-full border border-border bg-surface-1 text-text-2 shadow-[var(--shadow-card)] backdrop-blur-xl transition-colors duration-150 hover:border-border-strong hover:bg-surface-2 hover:text-text"
          aria-label="Show keyboard shortcuts"
        >
          <Keyboard className="size-[18px]" aria-hidden="true" />
        </button>
      </Tooltip>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={close}
          role="presentation"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-modal-title"
            className="w-full max-w-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <Card padding="none" className="max-h-[calc(100dvh-32px)] overflow-hidden">
              <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-5 py-4 sm:px-6">
                <h2 id="shortcuts-modal-title" className="text-card-title">
                  Keyboard shortcuts
                </h2>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={close}
                  className="focus-ring inline-flex size-11 items-center justify-center rounded-pill text-text-3 transition-colors hover:bg-surface-hover hover:text-text"
                  aria-label="Close keyboard shortcuts"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>

              <div className="max-h-[60vh] space-y-1 overflow-y-auto px-5 py-4 sm:px-6">
                {SHORTCUTS.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between gap-4 border-b border-border-subtle py-2.5 last:border-0"
                  >
                    <span className="text-sm text-text-2">
                      {shortcut.description}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {shortcut.keys.map((key, index) => (
                        <span key={key} className="flex items-center gap-1.5">
                          <kbd className="rounded-[4px] border border-border bg-white/[0.06] px-2 py-1 font-mono text-[11px] leading-none text-text">
                            {key}
                          </kbd>
                          {index < shortcut.keys.length - 1 ? (
                            <span className="text-[11px] text-text-3">then</span>
                          ) : null}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border-subtle px-5 py-3 text-center sm:px-6">
                <p className="text-caption">Press Esc to close</p>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
