'use client';

import { useState, useMemo } from 'react';
import { Action, ActionRecurrence } from '@/lib/types';
import { formatRecurrence } from '@/lib/utils/actionUtils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface ActionProgressTrackerProps {
  actions: Action[];
  goalCreatedAt: string;
  onToggleCompletion?: (actionId: string, date: string, completed: boolean) => void;
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to check if a date is applicable for an action based on recurrence
function isDateApplicable(date: Date, recurrence: ActionRecurrence, actionCreatedAt: string): boolean {
  const dayOfWeek = date.getDay();
  const actionCreated = new Date(actionCreatedAt);
  if (date < actionCreated) {
    return false;
  }

  switch (recurrence.type) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekly':
      return dayOfWeek === recurrence.weeklyDay;
    case 'custom':
      return recurrence.customDays?.includes(dayOfWeek) ?? false;
    default:
      return false;
  }
}

// Get dates for the current view (past 30 days + next 7 days)
function getRelevantDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  
  // Past 30 days
  for (let i = 30; i > 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date);
  }
  
  // Today
  dates.push(new Date(today));
  
  // Next 7 days
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

// Get dates for a full month (GitHub-style calendar)
function getMonthDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Start from Sunday of the week containing the first day
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  // End on Saturday of the week containing the last day
  const endDate = new Date(lastDay);
  const daysToAdd = 6 - endDate.getDay();
  endDate.setDate(endDate.getDate() + daysToAdd);
  
  // Generate all dates in the calendar grid
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

// Calculate completion intensity for a date (0-4 scale like GitHub)
function getCompletionIntensity(
  date: Date, 
  actions: Action[], 
  goalCreatedAt: string
): { count: number; intensity: number } {
  const dateStr = formatDate(date);
  const dateObj = new Date(dateStr);
  
  // Only count if date is on or after goal creation
  if (dateObj < new Date(goalCreatedAt)) {
    return { count: 0, intensity: 0 };
  }
  
  let completedCount = 0;
  let applicableCount = 0;
  
  actions.forEach(action => {
    const actionCreated = new Date(action.createdAt);
    if (dateObj < actionCreated) {
      return; // Skip if date is before action was created
    }
    
    if (isDateApplicable(date, action.recurrence, action.createdAt)) {
      applicableCount++;
      if (action.completions?.some(c => c.date === dateStr && c.completed)) {
        completedCount++;
      }
    }
  });
  
  if (applicableCount === 0) {
    return { count: 0, intensity: 0 };
  }
  
  // Calculate intensity (0-4) based on completion percentage
  const percentage = completedCount / applicableCount;
  const intensity = Math.min(4, Math.floor(percentage * 4));
  
  return { count: completedCount, intensity };
}

// GitHub-style Calendar Component
function GitHubStyleCalendar({
  dates,
  actions,
  goalCreatedAt
}: {
  dates: Date[];
  actions: Action[];
  goalCreatedAt: string;
}) {
  const todayStr = formatDate(new Date());
  const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Group dates by weeks (7 days per week)
  const weeks: Date[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }
  
  // Get intensity color based on level (0-4)
  const getIntensityColor = (intensity: number, isToday: boolean): string => {
    if (isToday) {
      return 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-1 dark:ring-offset-neutral-900';
    }
    
    const colors = [
      'bg-neutral-100 dark:bg-neutral-800/50', // 0 - no completions
      'bg-green-300 dark:bg-green-900/40',     // 1 - 1-25%
      'bg-green-400 dark:bg-green-800/50',     // 2 - 26-50%
      'bg-green-500 dark:bg-green-700/60',     // 3 - 51-75%
      'bg-green-600 dark:bg-green-600/70',     // 4 - 76-100%
    ];
    
    return colors[intensity] || colors[0];
  };
  
  return (
    <div className="w-full space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          {actions.length} {actions.length === 1 ? 'action' : 'actions'}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-500">Less</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(level, false)}`}
              />
            ))}
          </div>
          <span className="text-xs text-neutral-500 dark:text-neutral-500">More</span>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="bg-white dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <div className="flex gap-1">
              {/* Day labels */}
              <div className="flex flex-col gap-1 mr-2 pt-7">
                {WEEK_DAYS.map((day, idx) => {
                  // Only show label for some days to save space
                  if (idx % 2 === 0) {
                    return (
                      <div key={day} className="h-3 flex items-center">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 w-8">
                          {day.slice(0, 1)}
                        </span>
                      </div>
                    );
                  }
                  return <div key={day} className="h-3" />;
                })}
              </div>
              
              {/* Calendar weeks */}
              <div className="flex gap-1 flex-1">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {week.map((date) => {
                      const dateStr = formatDate(date);
                      const isToday = dateStr === todayStr;
                      const isCurrentMonth = date.getMonth() === new Date().getMonth();
                      const { count, intensity } = getCompletionIntensity(date, actions, goalCreatedAt);
                      
                      return (
                        <motion.div
                          key={dateStr}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: (weekIdx * 7 + date.getDay()) * 0.01 }}
                          className={`w-3 h-3 rounded-sm transition-all group relative ${getIntensityColor(intensity, isToday)} ${
                            !isCurrentMonth ? 'opacity-40' : ''
                          } hover:scale-125 hover:z-10`}
                          title={`${date.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric'
                          })}: ${count} ${count === 1 ? 'action' : 'actions'} completed`}
                        >
                          {/* Tooltip content on hover */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20 transition-opacity">
                            {count} {count === 1 ? 'action' : 'actions'} completed
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100"></div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}

// Cards View Component
function CardsView({
  actions,
  filteredDates,
  calculateActionProgress,
  getCurrentStreak,
  isApplicable,
  isCompleted,
  todayStr,
  timeframe
}: {
  actions: Action[];
  filteredDates: Date[];
  calculateActionProgress: (action: Action) => { completed: number; total: number; percentage: number };
  getCurrentStreak: (action: Action) => number;
  isApplicable: (action: Action, date: Date) => boolean;
  isCompleted: (action: Action, date: Date) => boolean;
  todayStr: string;
  timeframe: string;
}) {
  return (
    <div className="space-y-4">
      {actions.map((action) => {
        const progress = calculateActionProgress(action);
        const streak = getCurrentStreak(action);
        const applicableDates = filteredDates.filter(date => isApplicable(action, date));
        
        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-md transition-shadow"
          >
            {/* Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 mb-1 truncate">
                  {action.name}
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-md font-medium">
                    {formatRecurrence(action.recurrence)}
                  </span>
                  {streak > 0 && (
                    <span className="text-xs px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-md font-medium flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      {streak} day streak
                    </span>
                  )}
                </div>
              </div>
              
              {/* Progress Stats */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <div className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                    {progress.percentage}%
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {progress.completed}/{progress.total}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <Progress
                value={progress.percentage}
                className="h-2.5 bg-neutral-200 dark:bg-neutral-800"
                indicatorClassName="bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400"
              />
            </div>
            
            {/* Date Visualization - Compact Heatmap Style */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {applicableDates.slice(0, timeframe === 'week' ? 14 : timeframe === 'month' ? 37 : 50).map((date) => {
                const applicable = isApplicable(action, date);
                const completed = isCompleted(action, date);
                const dateStr = formatDate(date);
                const isToday = dateStr === todayStr;
                const isPast = new Date(dateStr) < new Date(todayStr);
                
                if (!applicable) return null;
                
                return (
                  <motion.div
                    key={dateStr}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: Math.random() * 0.1 }}
                    className={`relative group ${
                      isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-1 dark:ring-offset-neutral-900' : ''
                    }`}
                    title={`${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${completed ? 'Completed' : isPast ? 'Missed' : 'Upcoming'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                        completed
                          ? 'bg-green-500 dark:bg-green-400 text-white dark:text-green-950'
                          : isPast
                          ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600'
                          : 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-400 dark:text-neutral-500 border border-dashed border-neutral-300 dark:border-neutral-700'
                      } ${isToday ? 'scale-110' : ''}`}
                    >
                      {completed ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-[10px]">{date.getDate()}</span>
                      )}
                    </div>
                    {isToday && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                    )}
                  </motion.div>
                );
              })}
              {applicableDates.length > (timeframe === 'week' ? 14 : timeframe === 'month' ? 37 : 50) && (
                <div className="text-xs text-neutral-400 dark:text-neutral-600 px-2">
                  +{applicableDates.length - (timeframe === 'week' ? 14 : timeframe === 'month' ? 37 : 50)} more
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function ActionProgressTracker({ 
  actions, 
  goalCreatedAt,
  onToggleCompletion 
}: ActionProgressTrackerProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('cards');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month');
  
  const dates = useMemo(() => {
    return getRelevantDates();
  }, []);
  
  // Filter dates based on timeframe
  const filteredDates = useMemo(() => {
    const today = new Date();
    const todayStr = formatDate(today);
    
    switch (timeframe) {
      case 'week':
        return dates.filter(date => {
          const dateStr = formatDate(date);
          const dateTime = new Date(dateStr).getTime();
          const todayTime = new Date(todayStr).getTime();
          const diff = dateTime - todayTime;
          return diff >= -7 * 24 * 60 * 60 * 1000 && diff <= 7 * 24 * 60 * 60 * 1000;
        });
      case 'month':
        return dates.filter(date => {
          const dateStr = formatDate(date);
          const dateTime = new Date(dateStr).getTime();
          const todayTime = new Date(todayStr).getTime();
          const diff = dateTime - todayTime;
          return diff >= -30 * 24 * 60 * 60 * 1000 && diff <= 7 * 24 * 60 * 60 * 1000;
        });
      default:
        return dates;
    }
  }, [dates, timeframe]);
  
  // Check if an action is completed on a specific date
  const isCompleted = (action: Action, date: Date): boolean => {
    const dateStr = formatDate(date);
    return action.completions?.some(c => c.date === dateStr && c.completed) ?? false;
  };
  
  // Check if a date is applicable for an action
  const isApplicable = (action: Action, date: Date): boolean => {
    return isDateApplicable(date, action.recurrence, action.createdAt);
  };
  
  // Calculate progress for an action within the filtered dates
  const calculateActionProgress = (action: Action): { completed: number; total: number; percentage: number } => {
    const applicableDates = filteredDates.filter(date => isApplicable(action, date));
    const completedCount = applicableDates.filter(date => isCompleted(action, date)).length;
    const totalCount = applicableDates.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    return {
      completed: completedCount,
      total: totalCount,
      percentage
    };
  };
  
  const todayStr = formatDate(new Date());
  
  // Get current streak for an action
  const getCurrentStreak = (action: Action): number => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      if (!isApplicable(action, checkDate)) {
        continue;
      }
      
      if (isCompleted(action, checkDate)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  if (actions.length === 0) {
    return null;
  }
  
  const monthDates = useMemo(() => getMonthDates(), []);
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return (
    <div className="w-full space-y-6">
      {/* Header with view mode toggle, timeframe toggle and overall progress */}
      <div className="flex flex-col gap-4">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mr-2">View:</span>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className="h-8"
          >
            Cards
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="h-8"
          >
            Calendar
          </Button>
        </div>
        
        {/* Timeframe Toggle (only for cards view) or Month Title (for calendar view) */}
        <div className="flex items-center gap-2">
          {viewMode === 'cards' ? (
            <>
              <Button
                variant={timeframe === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe('week')}
                className="h-8"
              >
                Week
              </Button>
              <Button
                variant={timeframe === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe('month')}
                className="h-8"
              >
                Month
              </Button>
              <Button
                variant={timeframe === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe('all')}
                className="h-8"
              >
                All
              </Button>
            </>
          ) : (
            <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              {MONTH_NAMES[new Date().getMonth()]} {new Date().getFullYear()}
            </div>
          )}
        </div>
      </div>
      
      {/* Render based on view mode */}
      {viewMode === 'calendar' ? (
        <GitHubStyleCalendar 
          dates={monthDates}
          actions={actions}
          goalCreatedAt={goalCreatedAt}
        />
      ) : (
        <CardsView 
          actions={actions}
          filteredDates={filteredDates}
          calculateActionProgress={calculateActionProgress}
          getCurrentStreak={getCurrentStreak}
          isApplicable={isApplicable}
          isCompleted={isCompleted}
          todayStr={todayStr}
          timeframe={timeframe}
        />
      )}
    </div>
  );
}
