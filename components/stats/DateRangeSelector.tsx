'use client';

import { useState } from 'react';
import { type DatePreset } from '@/lib/utils/statsUtils';

interface DateRangeSelectorProps {
  preset: DatePreset;
  customStart: string;
  customEnd: string;
  onPresetChange: (preset: DatePreset) => void;
  onCustomChange: (start: string, end: string) => void;
}

const PRESETS: { value: DatePreset; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '3m', label: '3 Months' },
  { value: '1y', label: 'Year' },
  { value: 'custom', label: 'Custom' },
];

export function DateRangeSelector({
  preset,
  customStart,
  customEnd,
  onPresetChange,
  onCustomChange,
}: DateRangeSelectorProps) {
  const [localStart, setLocalStart] = useState(customStart);
  const [localEnd, setLocalEnd] = useState(customEnd);

  const handlePreset = (p: DatePreset) => {
    onPresetChange(p);
  };

  const handleApplyCustom = () => {
    if (localStart && localEnd && localStart <= localEnd) {
      onCustomChange(localStart, localEnd);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePreset(p.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              preset === p.value
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-transparent'
                : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-500 dark:text-neutral-400">From</label>
            <input
              type="date"
              value={localStart}
              onChange={(e) => setLocalStart(e.target.value)}
              className="px-2 py-1.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-500 dark:text-neutral-400">To</label>
            <input
              type="date"
              value={localEnd}
              onChange={(e) => setLocalEnd(e.target.value)}
              className="px-2 py-1.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
            />
          </div>
          <button
            onClick={handleApplyCustom}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
