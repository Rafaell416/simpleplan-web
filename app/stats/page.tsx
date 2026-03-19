'use client';

import { useState, useMemo } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { useStats } from '@/lib/useStats';
import { useGoals } from '@/lib/useGoals';
import { getDateRange, type DatePreset } from '@/lib/utils/statsUtils';
import { DateRangeSelector } from '@/components/stats/DateRangeSelector';
import { CompletionRateChart } from '@/components/stats/CompletionRateChart';
import { TodosCompletedChart } from '@/components/stats/TodosCompletedChart';
import { StreakCards } from '@/components/stats/StreakCards';
import { GoalProgressComparison } from '@/components/stats/GoalProgressComparison';
import { ConsistencyScore } from '@/components/stats/ConsistencyScore';

export default function StatsPage() {
  return (
    <AuthGuard>
      <StatsContent />
    </AuthGuard>
  );
}

function StatsContent() {
  const [preset, setPreset] = useState<DatePreset>('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [tab, setTab] = useState<'overview' | 'goal'>('overview');
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>(undefined);

  const { goals } = useGoals();

  const { startDate, endDate } = useMemo(() => {
    if (preset === 'custom' && customStart && customEnd) {
      return getDateRange('custom', { start: customStart, end: customEnd });
    }
    return getDateRange(preset);
  }, [preset, customStart, customEnd]);

  const goalIdForHook = tab === 'goal' ? selectedGoalId : undefined;

  const {
    completionByDate,
    todosCompletedByDate,
    currentStreak,
    longestStreak,
    goalProgressList,
    consistencyScore,
    isLoading,
  } = useStats(startDate, endDate, goalIdForHook);

  const handlePresetChange = (p: DatePreset) => {
    setPreset(p);
  };

  const handleCustomChange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
    setPreset('custom');
  };

  const activeGoals = goals.filter(g => !g.completed);

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="flex-1 flex items-start justify-center pb-28 md:pb-32">
        <div className="w-full max-w-3xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 mb-6">
            Stats
          </h1>

          {/* Date Range Selector */}
          <div className="mb-6">
            <DateRangeSelector
              preset={preset}
              customStart={customStart}
              customEnd={customEnd}
              onPresetChange={handlePresetChange}
              onCustomChange={handleCustomChange}
            />
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-1 mb-6 bg-neutral-100 dark:bg-neutral-800/60 rounded-lg p-1">
            <button
              onClick={() => setTab('overview')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === 'overview'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setTab('goal')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === 'goal'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              By Goal
            </button>
          </div>

          {/* Goal Selector (By Goal tab) */}
          {tab === 'goal' && (
            <div className="mb-6">
              <select
                value={selectedGoalId || ''}
                onChange={(e) => setSelectedGoalId(e.target.value || undefined)}
                className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
              >
                <option value="">Select a goal...</option>
                {activeGoals.map((g) => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-xl bg-neutral-100 dark:bg-neutral-800/40 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stat Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <StreakCards currentStreak={currentStreak} longestStreak={longestStreak} />
                <ConsistencyScore score={consistencyScore} />
              </div>

              {/* Completion Rate Chart */}
              <section>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 mb-3">
                  Completion Rate
                </h2>
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4">
                  <CompletionRateChart
                    data={completionByDate}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </section>

              {/* Todos Completed Chart */}
              <section>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 mb-3">
                  Todos Completed
                </h2>
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4">
                  <TodosCompletedChart
                    data={todosCompletedByDate}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </section>

              {/* Goal Progress Comparison (Overview only) */}
              {tab === 'overview' && goalProgressList.length > 0 && (
                <section>
                  <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 mb-3">
                    Goal Progress
                  </h2>
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4">
                    <GoalProgressComparison data={goalProgressList} />
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
