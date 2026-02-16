'use client';

import { useState, useEffect, useCallback } from 'react';
import { Goal, Action, ActionRecurrence, ActionCompletion } from './types';
import { supabase } from './supabase/client';
import { getUserId } from './supabase/rls';
import { useAuth } from './auth/AuthProvider';

// Helper to convert database action to Action type
function dbActionToAction(dbAction: any, completions: ActionCompletion[] = []): Action {
  const recurrence: ActionRecurrence = {
    type: dbAction.recurrence_type,
    weeklyDay: dbAction.recurrence_weekly_day ?? undefined,
    customDays: dbAction.recurrence_custom_days ?? undefined,
  };

  return {
    id: dbAction.id,
    goalId: dbAction.goal_id,
    name: dbAction.name,
    recurrence,
    createdAt: dbAction.created_at,
    completions: completions.length > 0 ? completions : undefined,
  };
}

// Helper to convert database goal to Goal type
async function dbGoalToGoal(dbGoal: any): Promise<Goal> {
  // Fetch actions for this goal
  const { data: actions, error: actionsError } = await supabase
    .from('actions')
    .select('*')
    .eq('goal_id', dbGoal.id)
    .order('created_at', { ascending: true });

  if (actionsError) {
    console.error('Error fetching actions:', actionsError);
  }

  // Fetch completions for all actions
  const actionIds = (actions || []).map((a: any) => a.id);
  let allCompletions: any[] = [];
  
  if (actionIds.length > 0) {
    const { data: completions, error: completionsError } = await supabase
      .from('action_completions')
      .select('*')
      .in('action_id', actionIds);

    if (completionsError) {
      console.error('Error fetching completions:', completionsError);
    } else {
      allCompletions = completions || [];
    }
  }

  // Group completions by action_id
  const completionsByAction = allCompletions.reduce((acc, comp) => {
    if (!acc[comp.action_id]) {
      acc[comp.action_id] = [];
    }
    acc[comp.action_id].push({
      date: comp.date,
      completed: comp.completed,
    });
    return acc;
  }, {} as Record<string, ActionCompletion[]>);

  const goalActions = (actions || []).map((action: any) => 
    dbActionToAction(action, completionsByAction[action.id] || [])
  );

  return {
    id: dbGoal.id,
    title: dbGoal.title,
    actions: goalActions,
    createdAt: dbGoal.created_at,
    targetDate: dbGoal.target_date || undefined,
    completed: dbGoal.completed || false,
    completedAt: dbGoal.completed_at || undefined,
  };
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const authUserId = user?.id;

  // Load goals when userId is available
  useEffect(() => {
    if (authLoading) return;

    if (!authUserId) {
      setGoals([]);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const loadGoals = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase not configured. Goals require Supabase.');
        if (!isCancelled) setIsLoading(false);
        return;
      }

      try {
        const { data: dbGoals, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', authUserId)
          .order('created_at', { ascending: false });

        if (isCancelled) return;

        if (error) {
          console.error('Error loading goals from Supabase:', error);
          setGoals([]);
        } else {
          const convertedGoals = await Promise.all(
            (dbGoals || []).map(dbGoalToGoal)
          );
          if (!isCancelled) setGoals(convertedGoals);
        }
      } catch (error) {
        console.error('Error loading goals:', error);
        if (!isCancelled) setGoals([]);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadGoals();

    return () => {
      isCancelled = true;
    };
  }, [authLoading, authUserId]);

  const createGoal = useCallback(async (goalData: Omit<Goal, 'id' | 'createdAt' | 'actions'>) => {
    try {
      const userId = await getUserId();
      const { data: dbGoal, error } = await supabase
        .from('goals')
        .insert({
          user_id: userId,
          title: goalData.title,
          target_date: goalData.targetDate || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating goal:', error);
        throw error;
      }

      // Convert database goal to Goal type
      const newGoal = await dbGoalToGoal(dbGoal);
      setGoals((prev) => [...prev, newGoal]);
      return newGoal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }, []);

  const updateGoal = useCallback(async (id: string, goalData: Partial<Goal>) => {
    try {
      const userId = await getUserId();
      const updateData: any = {};
      if (goalData.title !== undefined) updateData.title = goalData.title;
      if (goalData.targetDate !== undefined) updateData.target_date = goalData.targetDate || null;
      if (goalData.completed !== undefined) {
        updateData.completed = goalData.completed;
        // Set completed_at when marking as complete, clear it when uncompleting
        if (goalData.completed) {
          updateData.completed_at = new Date().toISOString();
        } else {
          updateData.completed_at = null;
        }
      }
      if (goalData.completedAt !== undefined) updateData.completed_at = goalData.completedAt || null;

      const { error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating goal:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }

    setGoals((prev) =>
      prev.map((goal) => (goal.id === id ? { ...goal, ...goalData } : goal))
    );
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      const userId = await getUserId();
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting goal:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      return; // Don't update local state if delete failed
    }

    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  }, []);

  const getGoal = useCallback((id: string): Goal | undefined => {
    return goals.find((goal) => goal.id === id);
  }, [goals]);

  const addAction = useCallback(async (goalId: string, actionData: Omit<Action, 'id' | 'goalId' | 'createdAt'>) => {
    try {
      const { data: dbAction, error } = await supabase
        .from('actions')
        .insert({
          goal_id: goalId,
          name: actionData.name,
          recurrence_type: actionData.recurrence.type,
          recurrence_weekly_day: actionData.recurrence.weeklyDay || null,
          recurrence_custom_days: actionData.recurrence.customDays || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating action:', error);
        throw error;
      }

      // Convert database action to Action type (no completions for new action)
      const newAction = dbActionToAction(dbAction, []);

      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === goalId
            ? { ...goal, actions: [...goal.actions, newAction] }
            : goal
        )
      );
    } catch (error) {
      console.error('Error creating action:', error);
      throw error;
    }
  }, []);

  const updateAction = useCallback(async (goalId: string, actionId: string, actionData: Partial<Action>) => {
    try {
      const updateData: any = {};
      if (actionData.name !== undefined) updateData.name = actionData.name;
      if (actionData.recurrence !== undefined) {
        updateData.recurrence_type = actionData.recurrence.type;
        updateData.recurrence_weekly_day = actionData.recurrence.weeklyDay || null;
        updateData.recurrence_custom_days = actionData.recurrence.customDays || null;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('actions')
          .update(updateData)
          .eq('id', actionId);

        if (error) {
          console.error('Error updating action:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error updating action:', error);
    }

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
  }, []);

  const deleteAction = useCallback(async (goalId: string, actionId: string) => {
    try {
      const { error } = await supabase
        .from('actions')
        .delete()
        .eq('id', actionId);

      if (error) {
        console.error('Error deleting action:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting action:', error);
      return;
    }

    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? { ...goal, actions: goal.actions.filter((a) => a.id !== actionId) }
          : goal
      )
    );
  }, []);

  const toggleActionCompletion = useCallback(async (
    goalId: string,
    actionId: string,
    date: string,
    completed: boolean
  ) => {
    try {
      // Use upsert to insert or update
      const { error } = await supabase
        .from('action_completions')
        .upsert({
          action_id: actionId,
          date,
          completed,
        }, {
          onConflict: 'action_id,date'
        });

      if (error) {
        console.error('Error toggling action completion:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error toggling action completion:', error);
    }

    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              actions: goal.actions.map((action) => {
                if (action.id !== actionId) return action;
                
                const completions = action.completions || [];
                const existingIndex = completions.findIndex(c => c.date === date);
                
                let updatedCompletions;
                if (existingIndex >= 0) {
                  updatedCompletions = [...completions];
                  updatedCompletions[existingIndex] = { date, completed };
                } else {
                  updatedCompletions = [...completions, { date, completed }];
                }
                
                return { ...action, completions: updatedCompletions };
              }),
            }
          : goal
      )
    );
  }, []);

  const markGoalComplete = useCallback(async (goalId: string, completed: boolean) => {
    await updateGoal(goalId, { 
      completed,
      completedAt: completed ? new Date().toISOString() : undefined 
    });
  }, [updateGoal]);

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
    markGoalComplete,
  };
}
