'use client';

import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { GoalsList } from '@/components/GoalsList';
import { Goal, Action } from '@/lib/types';
import { useGoals } from '@/lib/useGoals';

export default function GoalsPage() {
  const {
    goals,
    isLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    addAction,
    deleteAction,
  } = useGoals();


  const handleGoalCreate = (goalData: Omit<Goal, 'id' | 'createdAt' | 'actions'>) => {
    createGoal(goalData);
  };

  const handleGoalUpdate = (id: string, goalData: Partial<Goal>) => {
    updateGoal(id, goalData);
  };

  const handleGoalDelete = (id: string) => {
    deleteGoal(id);
  };

  const handleActionAdd = (goalId: string, actionData: Omit<Action, 'id' | 'goalId' | 'createdAt'>) => {
    addAction(goalId, actionData);
  };

  const handleActionDelete = (goalId: string, actionId: string) => {
    deleteAction(goalId, actionId);
  };

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 font-sans text-neutral-900 dark:bg-black dark:text-white">
      <Header title="Goals" />
      <div className="flex-1 flex items-start justify-center pt-24 pb-20 md:pb-32">
        <div className="w-full max-w-3xl mx-auto px-6 py-8">
          <GoalsList
            goals={goals}
            onGoalCreate={handleGoalCreate}
            onGoalUpdate={handleGoalUpdate}
            onGoalDelete={handleGoalDelete}
            onActionAdd={handleActionAdd}
            onActionDelete={handleActionDelete}
          />
        </div>
      </div>
    </main>
  );
}
