'use client';

import { useRouter } from 'next/navigation';
import { Goal } from '@/lib/types';

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const router = useRouter();

  const calculateProgress = (): number => {
    if (!goal.targetDate) {
      // If no target date, return 0 or a placeholder
      return 0;
    }

    const now = new Date();
    const target = new Date(goal.targetDate);
    const start = new Date(goal.createdAt);

    if (target < start) {
      return 100; // Goal is past due
    }

    const totalDuration = target.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    if (totalDuration <= 0) {
      return 0;
    }

    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    return Math.round(progress);
  };

  const progress = calculateProgress();

  return (
    <div
      onClick={() => router.push(`/goals/${goal.id}`)}
      className="group relative rounded-lg p-4 bg-white dark:bg-neutral-900/60 transition-all duration-200 hover:bg-neutral-50 dark:hover:bg-neutral-900/80 cursor-pointer h-full flex flex-col"
    >
      {/* Icon and Title Section */}
      <div className="mb-3 flex-1">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight line-clamp-2">
          {goal.title}
        </h3>
      </div>

      {/* Bottom Section - Progress Bar and Footer */}
      <div className="mt-auto">
        {/* Progress Bar Section */}
        <div className="mb-3">
          <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 ease-out rounded-full"
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

