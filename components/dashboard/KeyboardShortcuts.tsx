'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Keyboard } from 'lucide-react';

/**
 * Keyboard Shortcuts Handler
 * Implements global keyboard shortcuts for the application
 */
export function KeyboardShortcuts() {
  const router = useRouter();
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Cmd/Ctrl + K: Search (future feature)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        console.log('Search shortcut triggered (feature coming soon)');
        // TODO: Open search modal
        return;
      }

      // Cmd/Ctrl + S: Trigger sync
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        const syncButton = document.getElementById('sync-button');
        if (syncButton) {
          syncButton.click();
        }
        return;
      }

      // G then [key] navigation shortcuts
      if (e.key === 'g') {
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

          if (nextEvent.key === 'd') {
            router.push('/dashboard');
          } else if (nextEvent.key === 'i') {
            router.push('/insights');
          } else if (nextEvent.key === 'p') {
            router.push('/profile');
          } else if (nextEvent.key === 'r') {
            router.push('/repositories');
          } else if (nextEvent.key === 's') {
            router.push('/settings');
          }
          
          cleanup();
        };

        const cleanup = () => {
          setPressedKey(null);
          window.removeEventListener('keydown', handleNextKey);
          clearTimeout(timeoutId);
        };

        window.addEventListener('keydown', handleNextKey);
        
        // Clear the waiting state after 1 second
        timeoutId = setTimeout(cleanup, 1000);
      }

      // ? key: Show shortcuts help
      if (e.key === '?') {
        e.preventDefault();
        const helpButton = document.getElementById('shortcuts-help-button');
        if (helpButton) {
          helpButton.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [router]);

  // Visual indicator when waiting for second key
  if (pressedKey === 'g') {
    return (
      <div 
        className="fixed bottom-8 left-8 z-50 px-6 py-4 border border-[rgba(240,240,250,0.35)] bg-[rgba(0,0,0,0.85)] backdrop-blur animate-in slide-in-from-bottom-2 duration-200" 
        style={{ borderRadius: 0 }}
      >
        <p className="text-micro" style={{ opacity: 0.8, display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
          PRESS D FOR DASHBOARD, I FOR INSIGHTS, P FOR PROFILE
        </p>
      </div>
    );
  }

  return null;
}

/**
 * Keyboard Shortcuts Help Modal
 * Displays available keyboard shortcuts
 */
export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const shortcuts = [
    { keys: ['G', 'D'], description: 'GO TO DASHBOARD' },
    { keys: ['G', 'I'], description: 'GO TO INSIGHTS' },
    { keys: ['G', 'P'], description: 'GO TO PROFILE' },
    { keys: ['G', 'R'], description: 'GO TO REPOSITORIES' },
    { keys: ['G', 'S'], description: 'GO TO SETTINGS' },
    { keys: ['CMD/CTRL', 'S'], description: 'TRIGGER SYNC' },
    { keys: ['CMD/CTRL', 'K'], description: 'SEARCH (COMING SOON)' },
    { keys: ['?'], description: 'SHOW THIS HELP' },
    { keys: ['ESC'], description: 'CLOSE MODALS' },
  ];

  return (
    <>
      {/* Help Button - Ghost Floating Button */}
      <button
        id="shortcuts-help-button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 group transition-all"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "48px",
          height: "48px",
          background: "rgba(240, 240, 250, 0.1)",
          border: "1px solid rgba(240, 240, 250, 0.35)",
          borderRadius: "50%",
          color: "#f0f0fa",
          backdropFilter: "blur(4px)"
        }}
        title="Keyboard shortcuts (press ?)"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard size={20} />
      </button>

      {/* Help Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-modal-title"
        >
          <div
            style={{
              background: "#000",
              border: "1px solid rgba(240, 240, 250, 0.35)",
              borderRadius: "0",
            }}
            className="max-w-lg w-full relative pt-8 pb-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 pb-4 border-b border-[rgba(240,240,250,0.1)]">
              <h2 id="shortcuts-modal-title" className="text-section-head" style={{ fontSize: "1.25rem", margin: 0 }}>
                KEYBOARD SHORTCUTS
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="transition-opacity opacity-50 hover:opacity-100"
                style={{ color: "#f0f0fa", background: "transparent", border: "none" }}
                aria-label="Close shortcuts help"
              >
                <X size={20} />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="px-8 py-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-[rgba(240,240,250,0.05)] last:border-0"
                >
                  <span className="text-body text-dim" style={{ fontSize: "0.875rem" }}>
                    {shortcut.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex} className="flex items-center gap-1">
                        <kbd 
                          className="text-caption"
                          style={{
                            padding: "4px 8px",
                            background: "rgba(240, 240, 250, 0.05)",
                            border: "1px solid rgba(240, 240, 250, 0.35)",
                          }}
                        >
                          {key}
                        </kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="text-micro text-dim mx-1">THEN</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-8 pt-4 pb-2 text-center border-t border-[rgba(240,240,250,0.1)]">
              <p className="text-micro text-dim">
                PRESS ESC TO CLOSE
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

