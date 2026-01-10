'use client';

import { useState, useMemo } from 'react';
import { Action, ActionRecurrence, ActionCompletion } from '@/lib/types';
import { formatRecurrence } from '@/lib/utils/actionUtils';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface ActionProgressTrackerProps {
  actions: Action[];
  goalCreatedAt: string;
  onToggleCompletion: (actionId: string, date: string, completed: boolean) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
  // Only show dates on or after the action was created
  if (date < actionCreated) {
    return false;
  }

  switch (recurrence.type) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
    case 'weekly':
      return dayOfWeek === recurrence.weeklyDay;
    case 'custom':
      return recurrence.customDays?.includes(dayOfWeek) ?? false;
    default:
      return false;
  }
}

// Get all dates for the current month view
function getMonthDates(): Date[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Include a few days from previous month to fill the week
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  // Include a few days from next month to fill the week
  const endDate = new Date(lastDay);
  const daysToAdd = 6 - endDate.getDay();
  endDate.setDate(endDate.getDate() + daysToAdd);
  
  const dates: Date[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

// Get week dates (current week)
function getWeekDates(): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

export function ActionProgressTracker({ 
  actions, 
  goalCreatedAt,
  onToggleCompletion 
}: ActionProgressTrackerProps) {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  
  const dates = useMemo(() => {
    return viewMode === 'week' ? getWeekDates() : getMonthDates();
  }, [viewMode]);
  
  // Check if an action is completed on a specific date
  const isCompleted = (action: Action, date: Date): boolean => {
    const dateStr = formatDate(date);
    return action.completions?.some(c => c.date === dateStr && c.completed) ?? false;
  };
  
  // Check if a date is applicable for an action
  const isApplicable = (action: Action, date: Date): boolean => {
    return isDateApplicable(date, action.recurrence, action.createdAt);
  };
  
  // Calculate progress for an action
  const calculateActionProgress = (action: Action): { completed: number; total: number; percentage: number } => {
    const applicableDates = dates.filter(date => isApplicable(action, date));
    const completedCount = applicableDates.filter(date => isCompleted(action, date)).length;
    const totalCount = applicableDates.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    return {
      completed: completedCount,
      total: totalCount,
      percentage
    };
  };
  
  // Calculate overall progress
  const calculateOverallProgress = (): { completed: number; total: number; percentage: number } => {
    let totalCompleted = 0;
    let totalApplicable = 0;
    
    actions.forEach(action => {
      const progress = calculateActionProgress(action);
      totalCompleted += progress.completed;
      totalApplicable += progress.total;
    });
    
    const percentage = totalApplicable > 0 ? Math.round((totalCompleted / totalApplicable) * 100) : 0;
    
    return {
      completed: totalCompleted,
      total: totalApplicable,
      percentage
    };
  };
  
  const overallProgress = calculateOverallProgress();
  
  const handleToggle = (action: Action, date: Date) => {
    const dateStr = formatDate(date);
    const currentlyCompleted = isCompleted(action, date);
    onToggleCompletion(action.id, dateStr, !currentlyCompleted);
  };
  
  if (actions.length === 0) {
    return null;
  }
  
  return (
    <div className="w-full space-y-4">
      {/* Header with view toggle and overall progress */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
            className="h-8"
          >
            Week
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
            className="h-8"
          >
            Month
          </Button>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="text-right flex-shrink-0">
            <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Overall Progress
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {overallProgress.completed} / {overallProgress.total} completed
            </div>
          </div>
          <div className="flex-1 sm:w-32 max-w-xs sm:max-w-none">
            <Progress 
              value={overallProgress.percentage}
              className="h-2 bg-neutral-200 dark:bg-neutral-800"
              indicatorClassName="bg-green-500 dark:bg-green-400"
            />
          </div>
          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 w-12 flex-shrink-0 text-right">
            {overallProgress.percentage}%
          </div>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900/50">
                  <th className="sticky left-0 z-10 bg-neutral-50 dark:bg-neutral-900/50 border-r border-neutral-200 dark:border-neutral-800 px-4 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-50 min-w-[200px]">
                    Action
                  </th>
                  {dates.map((date) => {
                    const isToday = formatDate(date) === formatDate(new Date());
                    const isCurrentMonth = date.getMonth() === new Date().getMonth();
                    
                    return (
                      <th
                        key={date.toISOString()}
                        className={`px-2 py-3 text-center text-xs font-medium border-r border-neutral-200 dark:border-neutral-800 last:border-r-0 min-w-[60px] ${
                          isToday 
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                            : !isCurrentMonth && viewMode === 'month'
                            ? 'text-neutral-400 dark:text-neutral-600'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        <div className="font-semibold">{DAYS[date.getDay()]}</div>
                        <div className="text-xs mt-1">{date.getDate()}</div>
                      </th>
                    );
                  })}
                  <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-900 dark:text-neutral-50 min-w-[100px]">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-950">
                {actions.map((action, actionIndex) => {
                  const actionProgress = calculateActionProgress(action);
                  const isLastRow = actionIndex === actions.length - 1;
                  
                  return (
                    <tr
                      key={action.id}
                      className={`border-t border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors ${
                        isLastRow ? 'border-b' : ''
                      }`}
                    >
                      {/* Action Name */}
                      <td className="sticky left-0 z-10 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                            {action.name}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            ({formatRecurrence(action.recurrence)})
                          </div>
                        </div>
                      </td>
                      
                      {/* Date Checkboxes */}
                      {dates.map((date) => {
                        const applicable = isApplicable(action, date);
                        const completed = isCompleted(action, date);
                        const isToday = formatDate(date) === formatDate(new Date());
                        
                        return (
                          <td
                            key={date.toISOString()}
                            className={`px-2 py-3 text-center border-r border-neutral-200 dark:border-neutral-800 last:border-r-0 ${
                              isToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                            }`}
                          >
                            {applicable ? (
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={completed}
                                  onCheckedChange={() => handleToggle(action, date)}
                                  className="cursor-pointer size-5 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 dark:data-[state=checked]:bg-green-400 dark:data-[state=checked]:border-green-400"
                                  aria-label={`${completed ? 'Mark as incomplete' : 'Mark as complete'} ${action.name} on ${formatDate(date)}`}
                                />
                              </div>
                            ) : (
                              <div className="text-neutral-300 dark:text-neutral-700">-</div>
                            )}
                          </td>
                        );
                      })}
                      
                      {/* Action Progress */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-[80px]">
                            <Progress
                              value={actionProgress.percentage}
                              className="h-2 bg-neutral-200 dark:bg-neutral-800"
                              indicatorClassName="bg-green-500 dark:bg-green-400"
                            />
                          </div>
                          <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 w-12 text-right">
                            {actionProgress.percentage}%
                          </div>
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 text-center">
                          {actionProgress.completed}/{actionProgress.total}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

