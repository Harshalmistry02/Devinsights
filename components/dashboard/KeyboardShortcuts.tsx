'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className="fixed bottom-4 left-4 z-50 bg-slate-900 border border-cyan-500/50 rounded-lg px-3 py-2 shadow-xl animate-in slide-in-from-bottom-2 duration-200">
        <p className="text-sm text-cyan-400 font-medium">
          Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs">d</kbd> for Dashboard,{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs">i</kbd> for Insights,{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs">p</kbd> for Profile
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
    { keys: ['g', 'd'], description: 'Go to Dashboard' },
    { keys: ['g', 'i'], description: 'Go to Insights' },
{ keys: ['g', 'p'], description: 'Go to Profile' },
    { keys: ['g', 'r'], description: 'Go to Repositories' },
    { keys: ['g', 's'], description: 'Go to Settings' },
    { keys: ['Ctrl/⌘', 'S'], description: 'Trigger Sync' },
    { keys: ['Ctrl/⌘', 'K'], description: 'Search (coming soon)' },
    { keys: ['?'], description: 'Show this help' },
    { keys: ['Esc'], description: 'Close modals' },
  ];

  return (
    <>
      {/* Help Button */}
      <button
        id="shortcuts-help-button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 p-3 bg-slate-900 border border-slate-700/50 rounded-lg text-slate-400 hover:text-slate-300 hover:border-slate-600 transition-colors shadow-lg group"
        title="Keyboard shortcuts (press ?)"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="w-5 h-5" />
        <span className="absolute right-full mr-2 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Press <kbd className="px-1 py-0.5 bg-slate-900 border border-slate-600 rounded">?</kbd>
        </span>
      </button>

      {/* Help Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-modal-title"
        >
          <div
            className="bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <Keyboard className="w-6 h-6 text-cyan-400" />
                <h2 id="shortcuts-modal-title" className="text-xl font-semibold text-slate-200">
                  Keyboard Shortcuts
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                aria-label="Close shortcuts help"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0"
                >
                  <span className="text-sm text-slate-300">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex} className="flex items-center gap-1">
                        <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs font-mono text-slate-300">
                          {key}
                        </kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="text-slate-500 text-xs">then</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-800/30 border-t border-slate-700/50 rounded-b-xl">
              <p className="text-xs text-slate-500 text-center">
                Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded">Esc</kbd> to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
