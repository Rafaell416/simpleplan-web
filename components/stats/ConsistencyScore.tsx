'use client';

interface ConsistencyScoreProps {
  score: number;
  activeDays?: number;
  totalDays?: number;
}

export function ConsistencyScore({ score }: ConsistencyScoreProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4 flex items-center gap-4">
      <div className="relative flex-shrink-0">
        <svg width={88} height={88} viewBox="0 0 88 88">
          <circle
            cx={44}
            cy={44}
            r={radius}
            strokeWidth={6}
            fill="none"
            className="stroke-neutral-200 dark:stroke-neutral-800"
          />
          <circle
            cx={44}
            cy={44}
            r={radius}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="stroke-emerald-500 dark:stroke-emerald-400"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '44px 44px', transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{score}%</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">Consistency</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          % of days you completed at least one action
        </p>
      </div>
    </div>
  );
}
