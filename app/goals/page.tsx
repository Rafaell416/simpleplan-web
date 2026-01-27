'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { GoalsList } from '@/components/GoalsList';
import { GoalSkeleton } from '@/components/GoalSkeleton';
import { Goal, Action } from '@/lib/types';
import { useGoals } from '@/lib/useGoals';
import { AuthGuard } from '@/components/AuthGuard';

export default function GoalsPage() {
  return (
    <AuthGuard>
      <GoalsContent />
    </AuthGuard>
  );
}

function GoalsContent() {
  const router = useRouter();
  const {
    goals,
    isLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    addAction,
    deleteAction,
  } = useGoals();

  const handleGoalCreate = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'actions'>) => {
    try {
      const newGoal = await createGoal(goalData);
      // Navigate to the goal detail page
      if (newGoal) {
        router.push(`/goals/${newGoal.id}`);
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    }
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
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header title="Goals" />
      <div className="flex-1 flex items-start justify-center pt-24 pb-20 md:pb-32">
        <div className="w-full max-w-3xl mx-auto px-6 py-8">
          {isLoading ? (
            <GoalSkeleton />
          ) : (
            <GoalsList
              goals={goals}
              onGoalCreate={handleGoalCreate}
              onGoalUpdate={handleGoalUpdate}
              onGoalDelete={handleGoalDelete}
              onActionAdd={handleActionAdd}
              onActionDelete={handleActionDelete}
            />
          )}
        </div>
      </div>
    </main>
  );
}
