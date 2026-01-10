'use client';

import { useState, useEffect } from 'react';
import { Goal, Action, ActionRecurrence } from './types';

const STORAGE_KEY = 'simpleplan-goals';

// Generate a unique ID using timestamp and random number
function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load goals from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedGoals: any[] = JSON.parse(stored);
        // Migrate old goals with 'habits' to 'actions' and old recurrence format
        const migratedGoals: Goal[] = parsedGoals.map((goal: any) => {
          if (goal.habits && !goal.actions) {
            const { habits, ...rest } = goal;
            return {
              ...rest,
              actions: habits,
            } as Goal;
          }
          // Migrate old recurrence format (string) to new format (object)
          if (goal.actions) {
            goal.actions = goal.actions.map((action: any) => {
              if (typeof action.recurrence === 'string') {
                const oldRecurrence = action.recurrence;
                let newRecurrence: ActionRecurrence;
                if (oldRecurrence === 'daily') {
                  newRecurrence = { type: 'daily' };
                } else if (oldRecurrence === 'weekly') {
                  // Default to Monday for old weekly actions
                  newRecurrence = { type: 'weekly', weeklyDay: 1 };
                } else {
                  // Default to daily if unknown
                  newRecurrence = { type: 'daily' };
                }
                return { ...action, recurrence: newRecurrence };
              }
              return action;
            });
          }
          return goal as Goal;
        });
        // Remove duplicates by keeping only the first occurrence of each ID
        const uniqueGoals = migratedGoals.filter((goal, index, self) =>
          index === self.findIndex((g) => g.id === goal.id)
        );
        setGoals(uniqueGoals);
      } else {
        // Initialize with example goals if localStorage is empty
        const goal1Id = generateUniqueId();
        const goal2Id = generateUniqueId();
        const action1Id = generateUniqueId();
        const action2Id = generateUniqueId();
        
        const exampleGoals: Goal[] = [
          {
            id: goal1Id,
            title: 'Read "Atomic Habits" book',
            actions: [
              {
                id: action1Id,
                goalId: goal1Id,
                name: 'Read 10 pages',
                recurrence: { type: 'daily' },
                createdAt: new Date().toISOString(),
              },
            ],
            createdAt: new Date().toISOString(),
          },
          {
            id: goal2Id,
            title: 'Run 30 minutes',
            createdAt: new Date().toISOString(),
            targetDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
            actions: [
              {
                id: action2Id,
                goalId: goal2Id,
                name: 'Run 30 minutes',
                recurrence: { type: 'weekly', weeklyDay: 1 }, // Monday
                createdAt: new Date().toISOString(),
              }
            ],
          }
        ];
        setGoals(exampleGoals);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(exampleGoals));
      }
    } catch (error) {
      console.error('Error loading goals from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
      } catch (error) {
        console.error('Error saving goals to localStorage:', error);
      }
    }
  }, [goals, isLoading]);

  const createGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'actions'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: generateUniqueId(),
      actions: [],
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [...prev, newGoal]);
    return newGoal;
  };

  const updateGoal = (id: string, goalData: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((goal) => (goal.id === id ? { ...goal, ...goalData } : goal))
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  const getGoal = (id: string): Goal | undefined => {
    return goals.find((goal) => goal.id === id);
  };

  const addAction = (goalId: string, actionData: Omit<Action, 'id' | 'goalId' | 'createdAt'>) => {
    const newAction: Action = {
      ...actionData,
      id: generateUniqueId(),
      goalId,
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? { ...goal, actions: [...goal.actions, newAction] }
          : goal
      )
    );
  };

  const updateAction = (goalId: string, actionId: string, actionData: Partial<Action>) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              actions: goal.actions.map((action) =>
                action.id === actionId ? { ...action, ...actionData } : action
              ),
            }
          : goal
      )
    );
  };

  const deleteAction = (goalId: string, actionId: string) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? { ...goal, actions: goal.actions.filter((a) => a.id !== actionId) }
          : goal
      )
    );
  };

  const toggleActionCompletion = (goalId: string, actionId: string, date: string, completed: boolean) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              actions: goal.actions.map((action) => {
                if (action.id !== actionId) return action;
                
                // Initialize completions array if it doesn't exist
                const completions = action.completions || [];
                
                // Find existing completion for this date
                const existingIndex = completions.findIndex(c => c.date === date);
                
                let updatedCompletions;
                if (existingIndex >= 0) {
                  // Update existing completion
                  updatedCompletions = [...completions];
                  updatedCompletions[existingIndex] = { date, completed };
                } else {
                  // Add new completion
                  updatedCompletions = [...completions, { date, completed }];
                }
                
                return { ...action, completions: updatedCompletions };
              }),
            }
          : goal
      )
    );
  };

  return {
    goals,
    isLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    getGoal,
    addAction,
    updateAction,
    deleteAction,
    toggleActionCompletion,
  };
}

