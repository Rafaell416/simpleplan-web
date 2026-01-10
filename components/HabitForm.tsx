'use client';

import { useState } from 'react';
import { ActionRecurrence } from '@/lib/types';

interface HabitFormProps {
  onClose: () => void;
  onSubmit: (action: Omit<import('@/lib/types').Action, 'id' | 'goalId' | 'createdAt'>) => void;
}

export function HabitForm({ onClose, onSubmit }: HabitFormProps) {
  const [name, setName] = useState('');
  const [recurrence, setRecurrence] = useState<ActionRecurrence>({ type: 'daily' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({
        name: name.trim(),
        recurrence,
      });
      setName('');
      setRecurrence({ type: 'daily' });
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
              Add Action
            </h3>
            <button
              onClick={onClose}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="action-name"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                Action Name
              </label>
              <input
                id="action-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Read 10 pages"
                className="w-full px-3 py-2 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                required
              />
            </div>

            <div>
              <label
                htmlFor="action-recurrence"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                Recurrence
              </label>
              <select
                id="action-recurrence"
                value={recur.type}
                onChange={(e) => {
                  const type = e.target.value as ActionRecurrence['type'];
                  if (type === 'weekly') {
                    setRecurrence({ type: 'weekly', weeklyDay: new Date().getDay() });
                  } else if (type === 'weekdays') {
                    setRecurrence({ type: 'weekdays' });
                  } else if (type === 'custom') {
                    setRecurrence({ type: 'custom', customDays: [] });
                  } else {
                    setRecurrence({ type: 'daily' });
                  }
                }}
                className="w-full px-3 py-2 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
              >
                Add Action
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

