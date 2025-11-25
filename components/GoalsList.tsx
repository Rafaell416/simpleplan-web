'use client';

import { useState } from 'react';
import { Goal, Habit, GoalPeriod, HabitRecurrence } from '@/lib/types';
import { GoalForm } from './GoalForm';
import { HabitForm } from './HabitForm';

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
  onGoalDelete,
  onHabitAdd,
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

  const getPeriodColor = (period: GoalPeriod) => {
    switch (period) {
      case 'weekly':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'monthly':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'quarterly':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    }
  };

  const getRecurrenceIcon = (recurrence: HabitRecurrence) => {
    return recurrence === 'daily' ? '📅' : '📆';
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-end">
        <button
          onClick={() => {
            setEditingGoal(null);
            setIsGoalFormOpen(true);
          }}
          className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
        >
          + New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-2">
            No goals yet
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-4">
            Create your first goal to get started
          </p>
          <button
            onClick={() => setIsGoalFormOpen(true)}
            className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
          >
            Create Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 bg-white dark:bg-neutral-900/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                      {goal.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${getPeriodColor(goal.period)}`}
                    >
                      {goal.period.charAt(0).toUpperCase() + goal.period.slice(1)}
                    </span>
                  </div>
                  {goal.targetDate && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-500">
                      Target: {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingGoal(goal);
                      setIsGoalFormOpen(true);
                    }}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    aria-label="Edit goal"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112 2L12.586 15H10v-2.586l5.293-5.293z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this goal?')) {
                        onGoalDelete(goal.id);
                      }
                    }}
                    className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    aria-label="Delete goal"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Habits
                  </h4>
                  <button
                    onClick={() => setHabitFormGoalId(goal.id)}
                    className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                  >
                    + Add Habit
                  </button>
                </div>
                {goal.habits.length === 0 ? (
                  <p className="text-sm text-neutral-500 dark:text-neutral-500 italic">
                    No habits yet. Add a habit to track progress toward this goal.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {goal.habits.map((habit) => (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between py-2 px-3 rounded bg-neutral-50 dark:bg-neutral-800/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{getRecurrenceIcon(habit.recurrence)}</span>
                          <span className="text-sm text-neutral-900 dark:text-neutral-50">
                            {habit.name}
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-500">
                            ({habit.recurrence})
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this habit?')) {
                              onHabitDelete(goal.id, habit.id);
                            }
                          }}
                          className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          aria-label="Delete habit"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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

