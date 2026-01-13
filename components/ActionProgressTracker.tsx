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
  targetDate?: string;
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

// Get dates for a full month (Duolingo-style calendar)
function getMonthDates(year: number, month: number): Date[] {
  const dates: Date[] = [];
  
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

// Calculate completion status for a date (GitHub-style)
function getCompletionStatus(
  date: Date, 
  actions: Action[], 
  goalCreatedAt: string
): { count: number; total: number; completed: boolean; percentage: number } {
  const dateStr = formatDate(date);
  const dateObj = new Date(dateStr);
  
  // Only count if date is on or after goal creation
  if (dateObj < new Date(goalCreatedAt)) {
    return { count: 0, total: 0, completed: false, percentage: 0 };
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
    return { count: 0, total: 0, completed: false, percentage: 0 };
  }
  
  const percentage = (completedCount / applicableCount) * 100;
  const completed = completedCount === applicableCount && applicableCount > 0;
  
  return { count: completedCount, total: applicableCount, completed, percentage };
}

// Duolingo-style Calendar Component
function DuolingoStyleCalendar({
  year,
  month,
  actions,
  goalCreatedAt,
  targetDate,
  onMonthChange
}: {
  year: number;
  month: number;
  actions: Action[];
  goalCreatedAt: string;
  targetDate?: string;
  onMonthChange: (year: number, month: number) => void;
}) {
  const today = new Date();
  const todayStr = formatDate(today);
  const dates = useMemo(() => getMonthDates(year, month), [year, month]);
  
  const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Calculate summary statistics for the month
  const monthStats = useMemo(() => {
    let daysWithPractice = 0;
    let totalDays = 0;
    
    dates.forEach(date => {
      const isCurrentMonth = date.getMonth() === month;
      if (!isCurrentMonth) return;
      
      const dateObj = new Date(formatDate(date));
      if (dateObj < new Date(goalCreatedAt)) return;
      
      const { percentage } = getCompletionStatus(date, actions, goalCreatedAt);
      if (percentage > 0) {
        daysWithPractice++;
      }
      totalDays++;
    });
    
    return { daysWithPractice, totalDays };
  }, [dates, month, actions, goalCreatedAt]);
  
  // Get day color based on completion status (GitHub-style green scale)
  const getDayColor = (status: { completed: boolean; percentage: number; total: number }, isToday: boolean, isCurrentMonth: boolean): string => {
    if (!isCurrentMonth) {
      return 'bg-transparent text-neutral-400 dark:text-neutral-600';
    }
    
    let baseColor = '';
    
    if (status.total === 0) {
      // No applicable actions - neutral gray
      baseColor = 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-400 dark:text-neutral-600';
    } else if (status.completed && status.percentage === 100) {
      // Fully completed - full green
      baseColor = 'bg-green-500 dark:bg-green-600 text-white';
    } else if (status.percentage > 0) {
      // Partially completed - green with opacity based on percentage
      // Use intensity levels like GitHub (0-4 scale)
      const intensity = Math.min(4, Math.floor((status.percentage / 100) * 4));
      const opacityMap = [
        'bg-green-200 dark:bg-green-900/30',      // 0-25% - very light
        'bg-green-300 dark:bg-green-800/40',      // 26-50% - light
        'bg-green-400 dark:bg-green-700/50',       // 51-75% - medium
        'bg-green-500 dark:bg-green-600/60',       // 76-99% - darker
      ];
      baseColor = `${opacityMap[intensity] || opacityMap[0]} text-white dark:text-green-50`;
    } else {
      // No completions - neutral gray
      baseColor = 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-400 dark:text-neutral-600';
    }
    
    // Return base color (today indicator is handled separately with a dot)
    return baseColor;
  };
  
  const handlePrevMonth = () => {
    if (month === 0) {
      onMonthChange(year - 1, 11);
    } else {
      onMonthChange(year, month - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (!canNavigateNext) return; // Prevent navigation if it would exceed target date
    
    if (month === 11) {
      onMonthChange(year + 1, 0);
    } else {
      onMonthChange(year, month + 1);
    }
  };
  
  // Check if next month would exceed target date
  const canNavigateNext = useMemo(() => {
    if (!targetDate) return true; // If no target date, allow navigation
    
    const target = new Date(targetDate);
    const nextMonth = month === 11 ? new Date(year + 1, 0, 1) : new Date(year, month + 1, 1);
    
    // Allow navigation if next month's first day is on or before target date
    return nextMonth <= target;
  }, [year, month, targetDate]);
  
  return (
    <div className="w-full space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          {MONTH_NAMES[month]} {year}
        </h2>
        
        <button
          onClick={handleNextMonth}
          disabled={!canNavigateNext}
          className={`p-2 rounded-lg transition-colors ${
            canNavigateNext
              ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              : 'opacity-50 cursor-not-allowed'
          }`}
          aria-label="Next month"
        >
          <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {monthStats.daysWithPractice}
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                days of streak
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {actions.length}
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                {actions.length === 1 ? 'action' : 'actions'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="bg-white dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {WEEK_DAYS.map((day, index) => (
            <div key={`${day}-${index}`} className="text-center text-xs font-medium text-neutral-600 dark:text-neutral-400 py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar weeks */}
        <div className="grid grid-cols-7 gap-2">
          {dates.map((date) => {
            const dateStr = formatDate(date);
            const isToday = dateStr === todayStr;
            const isCurrentMonth = date.getMonth() === month;
            const status = getCompletionStatus(date, actions, goalCreatedAt);
            
            return (
              <motion.div
                key={dateStr}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: Math.random() * 0.05 }}
                className={`relative group aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${getDayColor(status, isToday, isCurrentMonth)} ${
                  isCurrentMonth ? 'cursor-pointer hover:scale-110' : ''
                }`}
                title={`${date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}: ${status.count} ${status.count === 1 ? 'action' : 'actions'} completed`}
              >
                {isCurrentMonth && (
                  <>
                    <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                      <span className="text-sm font-medium">{date.getDate()}</span>
                      {status.total > 0 && (
                        <span className="text-[9px] font-normal mt-0.5 opacity-80">
                          {status.count}/{status.total}
                        </span>
                      )}
                    </div>
                    {isToday && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                    )}
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20 transition-opacity shadow-lg">
                      {date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric'
                      })}
                      <br />
                      {status.count}/{status.total} {status.total === 1 ? 'action' : 'actions'} completed
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100"></div>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
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
  todayStr
}: {
  actions: Action[];
  filteredDates: Date[];
  calculateActionProgress: (action: Action) => { completed: number; total: number; percentage: number };
  getCurrentStreak: (action: Action) => number;
  isApplicable: (action: Action, date: Date) => boolean;
  isCompleted: (action: Action, date: Date) => boolean;
  todayStr: string;
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
              {applicableDates.map((date) => {
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
                    className="relative group"
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
  targetDate,
  onToggleCompletion 
}: ActionProgressTrackerProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('calendar');
  
  const dates = useMemo(() => {
    return getRelevantDates();
  }, []);
  
  // Use all dates (no filtering)
  const filteredDates = useMemo(() => {
    return dates;
  }, [dates]);
  
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
  
  // Calendar view state
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  
  const handleMonthChange = (year: number, month: number) => {
    setCalendarYear(year);
    setCalendarMonth(month);
  };
  
  return (
    <div className="w-full space-y-6">
      {/* Header with view mode toggle, timeframe toggle and overall progress */}
      <div className="flex flex-col gap-4">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mr-2">View:</span>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="h-8"
          >
            Calendar
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className="h-8"
          >
            Cards
          </Button>
        </div>
        
      </div>
      
      {/* Render based on view mode */}
      {viewMode === 'calendar' ? (
        <DuolingoStyleCalendar 
          year={calendarYear}
          month={calendarMonth}
          actions={actions}
          goalCreatedAt={goalCreatedAt}
          targetDate={targetDate}
          onMonthChange={handleMonthChange}
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
        />
      )}
    </div>
  );
}
