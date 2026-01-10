'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
  { keys: ['Option', '↑'], description: 'Navigate to previous day' },
  { keys: ['Option', '↓'], description: 'Navigate to next day' },
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:flex fixed bottom-8 right-8 z-40 items-center gap-2 rounded-full bg-white/90 dark:bg-neutral-900/90 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-900 transition-colors shadow-sm cursor-pointer"
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
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
            >
              <span className="text-sm text-neutral-600 dark:text-neutral-400 flex-shrink-0">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {shortcut.keys.map((key, keyIndex) => (
                  <React.Fragment key={keyIndex}>
                    <kbd className="px-2.5 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-md font-mono text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center min-w-[36px] h-8 shadow-sm">
                      {key === '↑' ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : key === '↓' ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      ) : (
                        key
                      )}
                    </kbd>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="text-neutral-400 dark:text-neutral-500 text-sm font-medium">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-500 text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded font-mono">?</kbd> to toggle or <kbd className="px-1.5 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded font-mono">Esc</kbd> to close
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

