'use client';

interface StreakCardsProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakCards({ currentStreak, longestStreak }: StreakCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
          Current Streak
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            {currentStreak}
          </span>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {currentStreak === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
          Longest Streak
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            {longestStreak}
          </span>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {longestStreak === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>
    </div>
  );
}
