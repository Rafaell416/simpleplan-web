'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase/client';
import { useAuth } from './auth/AuthProvider';
import { useGoals } from './useGoals';
import { Goal } from './types';
import { isActionApplicableOnDay } from './utils/actionUtils';
import { calculateGoalProgress } from './utils/goalUtils';
import {
  computeStreaks,
  computeConsistencyScore,
  generateDateRange,
  DailyDataPoint,
} from './utils/statsUtils';

export interface TodoDailyData {
  date: string;
  completed: number;
  total: number;
}

export interface GoalProgressItem {
  goalId: string;
  title: string;
  progress: number;
}

export interface StatsData {
  completionByDate: DailyDataPoint[];
  todosCompletedByDate: TodoDailyData[];
  currentStreak: number;
  longestStreak: number;
  goalProgressList: GoalProgressItem[];
  consistencyScore: number;
  isLoading: boolean;
}

export function useStats(
  startDate: string,
  endDate: string,
  goalId?: string
): StatsData {
  const { user, loading: authLoading } = useAuth();
  const { goals, isLoading: goalsLoading } = useGoals();
  const [completionsRaw, setCompletionsRaw] = useState<any[]>([]);
  const [todosRaw, setTodosRaw] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userId = user?.id;

  useEffect(() => {
    if (authLoading || !userId || !startDate || !endDate) return;

    let cancelled = false;
    setIsLoading(true);

    const fetchData = async () => {
      try {
        // Fetch action completions in date range, joined to actions/goals for user filtering
        let completionsQuery = supabase
          .from('action_completions')
          .select('*, actions!inner(id, goal_id, recurrence_type, recurrence_weekly_day, recurrence_custom_days, created_at, goals!inner(id, user_id, title))')
          .gte('date', startDate)
          .lte('date', endDate)
          .eq('actions.goals.user_id', userId);

        if (goalId) {
          completionsQuery = completionsQuery.eq('actions.goal_id', goalId);
        }

        const { data: completions, error: cErr } = await completionsQuery;
        if (cErr) console.error('Error fetching completions:', cErr);

        // Fetch regular todos in date range
        const { data: todos, error: tErr } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', userId)
          .gte('date', startDate)
          .lte('date', endDate)
          .is('action_id', null);

        if (tErr) console.error('Error fetching todos:', tErr);

        if (!cancelled) {
          setCompletionsRaw(completions || []);
          setTodosRaw(todos || []);
        }
      } catch (err) {
        console.error('Error in useStats fetch:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [authLoading, userId, startDate, endDate, goalId]);

  const stats = useMemo<Omit<StatsData, 'isLoading'>>(() => {
    const allDates = generateDateRange(startDate, endDate);
    if (allDates.length === 0 || goalsLoading) {
      return {
        completionByDate: [],
        todosCompletedByDate: [],
        currentStreak: 0,
        longestStreak: 0,
        goalProgressList: [],
        consistencyScore: 0,
      };
    }

    // --- Completion rate by date ---
    // For each date, how many applicable actions were completed vs total applicable
    const filteredGoals: Goal[] = goalId
      ? goals.filter(g => g.id === goalId)
      : goals;

    const completedSet = new Set<string>();
    for (const c of completionsRaw) {
      if (c.completed) {
        completedSet.add(`${c.action_id}:${c.date}`);
      }
    }

    const completionByDate: DailyDataPoint[] = [];
    const activeDates = new Set<string>();

    for (const dateStr of allDates) {
      const d = new Date(dateStr + 'T00:00:00');
      let applicable = 0;
      let completed = 0;

      for (const goal of filteredGoals) {
        if (goal.paused) continue;
        for (const action of goal.actions) {
          if (isActionApplicableOnDay(action, d)) {
            applicable++;
            if (completedSet.has(`${action.id}:${dateStr}`)) {
              completed++;
            }
          }
        }
      }

      const rate = applicable > 0 ? Math.round((completed / applicable) * 100) : 0;
      completionByDate.push({ date: dateStr, value: rate });

      if (completed > 0) {
        activeDates.add(dateStr);
      }
    }

    // --- Todos completed by date ---
    const todosByDate = new Map<string, { completed: number; total: number }>();
    for (const dateStr of allDates) {
      todosByDate.set(dateStr, { completed: 0, total: 0 });
    }
    for (const todo of todosRaw) {
      const entry = todosByDate.get(todo.date);
      if (entry) {
        entry.total++;
        if (todo.completed) entry.completed++;
      }
    }
    const todosCompletedByDate: TodoDailyData[] = allDates.map(dateStr => {
      const entry = todosByDate.get(dateStr) || { completed: 0, total: 0 };
      return { date: dateStr, ...entry };
    });

    // --- Streaks ---
    const { current: currentStreak, longest: longestStreak } = computeStreaks(activeDates, allDates);

    // --- Goal progress comparison ---
    const goalProgressList: GoalProgressItem[] = filteredGoals
      .filter(g => !g.completed)
      .map(g => ({
        goalId: g.id,
        title: g.title,
        progress: calculateGoalProgress(g),
      }))
      .sort((a, b) => b.progress - a.progress);

    // --- Consistency ---
    const consistencyScore = computeConsistencyScore(activeDates.size, allDates.length);

    return {
      completionByDate,
      todosCompletedByDate,
      currentStreak,
      longestStreak,
      goalProgressList,
      consistencyScore,
    };
  }, [completionsRaw, todosRaw, goals, goalsLoading, startDate, endDate, goalId]);

  return {
    ...stats,
    isLoading: isLoading || goalsLoading,
  };
}
