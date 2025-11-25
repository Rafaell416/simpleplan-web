'use client';

import { useState } from 'react';
import { Goal, Habit } from '@/lib/types';
import { GoalForm } from './GoalForm';
import { HabitForm } from './HabitForm';
import { GoalCard } from './GoalCard';

interface GoalsListProps {
  goals: Goal[];
  onGoalCreate: (goal: Omit<Goal, 'id' | 'createdAt' | 'habits'>) => void;
  onGoalUpdate: (id: string, goal: Partial<Goal>) => void;
  onGoalDelete: (id: string) => void;
  onHabitAdd: (goalId: string, habit: Omit<Habit, 'id' | 'goalId' | 'createdAt'>) => void;
  onHabitDelete: (goalId: string, habitId: string) => void;
}

export function GoalsList({
  goals,
  onGoalCreate,
  onGoalUpdate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onGoalDelete,
  onHabitAdd,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onHabitDelete,
}: GoalsListProps) {
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [habitFormGoalId, setHabitFormGoalId] = useState<string | null>(null);

  const handleGoalSubmit = (goalData: Omit<Goal, 'id' | 'createdAt' | 'habits'>) => {
    if (editingGoal) {
      onGoalUpdate(editingGoal.id, goalData);
      setEditingGoal(null);
    } else {
      onGoalCreate(goalData);
    }
    setIsGoalFormOpen(false);
  };

  const handleHabitSubmit = (habitData: Omit<Habit, 'id' | 'goalId' | 'createdAt'>) => {
    if (habitFormGoalId) {
      onHabitAdd(habitFormGoalId, habitData);
      setHabitFormGoalId(null);
    }
  };


  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* New Goal Card */}
        <button
          onClick={() => {
            setEditingGoal(null);
            setIsGoalFormOpen(true);
          }}
          className="group relative rounded-lg p-4 bg-white dark:bg-neutral-900/60 transition-all duration-200 hover:bg-neutral-50 dark:hover:bg-neutral-900/80 cursor-pointer h-full flex flex-col items-center justify-center min-h-[180px]"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-2 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
              <svg
                className="w-5 h-5 text-neutral-600 dark:text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              New Goal
            </span>
          </div>
        </button>

        {/* Goal Cards */}
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>

      {isGoalFormOpen && (
        <GoalForm
          goal={editingGoal}
          onClose={() => {
            setIsGoalFormOpen(false);
            setEditingGoal(null);
          }}
          onSubmit={handleGoalSubmit}
        />
      )}

      {habitFormGoalId && (
        <HabitForm
          onClose={() => setHabitFormGoalId(null)}
          onSubmit={handleHabitSubmit}
        />
      )}
    </div>
  );
}

