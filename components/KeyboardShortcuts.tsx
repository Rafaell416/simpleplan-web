'use client';

import { useState, useEffect } from 'react';

interface Shortcut {
  keys: string[];
  description: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['+'], description: 'Create a new task' },
  { keys: ['Tab'], description: 'Navigate between tasks' },
  { keys: ['E'], description: 'Edit focused task' },
  { keys: ['Enter'], description: 'Toggle task completion' },
  { keys: ['Delete'], description: 'Delete task (with confirmation)' },
  { keys: ['Esc'], description: 'Cancel editing or exit input mode' },
];

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle with "?" key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Close with Escape key when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex fixed bottom-8 right-8 z-40 items-center gap-2 rounded-full bg-white/90 dark:bg-neutral-900/90 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-900 transition-colors cursor-pointer"
        aria-label="Show keyboard shortcuts"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="hidden sm:inline">Shortcuts</span>
        <kbd className="hidden sm:inline px-1.5 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded font-mono">?</kbd>
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="hidden md:block fixed inset-0 bg-black/20 dark:bg-black/40 z-50"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
              Keyboard Shortcuts
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
              >
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {shortcut.description}
                </span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <span key={keyIndex}>
                      <kbd className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 rounded font-mono text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                        {key}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="mx-1 text-neutral-400">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-500 text-center">
              Press <kbd className="px-1.5 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded font-mono">?</kbd> to toggle or <kbd className="px-1.5 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded font-mono">Esc</kbd> to close
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

