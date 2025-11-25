'use client';

import { useState, useEffect } from 'react';
import { Goal, GoalPeriod } from '@/lib/types';

interface GoalFormProps {
  goal?: Goal | null;
  onClose: () => void;
  onSubmit: (goal: Omit<Goal, 'id' | 'createdAt' | 'habits'>) => void;
}

export function GoalForm({ goal, onClose, onSubmit }: GoalFormProps) {
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState<GoalPeriod>('monthly');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setPeriod(goal.period);
      setTargetDate(goal.targetDate || '');
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        period,
        targetDate: targetDate || undefined,
      });
      setTitle('');
      setPeriod('monthly');
      setTargetDate('');
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
              {goal ? 'Edit Goal' : 'Create New Goal'}
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
                htmlFor="goal-title"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                Goal Title
              </label>
              <input
                id="goal-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Read 'Atomic Habits' book"
                className="w-full px-3 py-2 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                required
              />
            </div>

            <div>
              <label
                htmlFor="goal-period"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                Period
              </label>
              <select
                id="goal-period"
                value={period}
                onChange={(e) => setPeriod(e.target.value as GoalPeriod)}
                className="w-full px-3 py-2 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="goal-target-date"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                Target Date (Optional)
              </label>
              <input
                id="goal-target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
                {goal ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

