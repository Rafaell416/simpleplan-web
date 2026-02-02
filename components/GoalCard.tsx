'use client';

import { useRouter } from 'next/navigation';
import { Goal } from '@/lib/types';
import { calculateGoalProgress, isGoalOverdue } from '@/lib/utils/goalUtils';
import { AlertTriangle } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const router = useRouter();

  const progress = calculateGoalProgress(goal);
  const overdue = isGoalOverdue(goal);

  return (
    <div
      onClick={() => router.push(`/goals/${goal.id}`)}
      className={`group relative rounded-lg p-4 bg-white dark:bg-neutral-900/60 border transition-all duration-200 hover:bg-neutral-50 dark:hover:bg-neutral-900/80 cursor-pointer h-full flex flex-col min-h-[180px] ${
        overdue 
          ? 'border-red-500 dark:border-red-600' 
          : goal.completed
          ? 'border-green-500 dark:border-green-600'
          : 'border-neutral-200 dark:border-neutral-800'
      }`}
    >
      {/* Icon and Title Section */}
      <div className="mb-3 flex-1">
        <div className="flex items-start gap-2">
          <h3 className={`text-base font-semibold tracking-tight line-clamp-2 flex-1 ${
            goal.completed 
              ? 'text-neutral-500 dark:text-neutral-500 line-through' 
              : 'text-neutral-900 dark:text-neutral-50'
          }`}>
            {goal.title}
          </h3>
          {overdue && (
            <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          )}
          {goal.completed && (
            <svg
              className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        {overdue && (
          <span className="text-xs text-red-600 dark:text-red-400 mt-1 inline-block">
            Overdue
          </span>
        )}
      </div>

      {/* Bottom Section - Progress Bar and Footer */}
      <div className="mt-auto">
        {/* Progress Bar Section */}
        <div className="mb-3">
          <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ease-out rounded-full ${
                goal.completed
                  ? 'bg-green-500 dark:bg-green-400'
                  : overdue
                  ? 'bg-red-500 dark:bg-red-400'
                  : 'bg-emerald-500 dark:bg-emerald-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer Section - Actions Count and Target Date */}
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span>{goal.actions.length}</span>
          </div>
          {goal.targetDate && (
            <div className="flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

