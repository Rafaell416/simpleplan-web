'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { GoalsList } from '@/components/GoalsList';
import { Goal, Habit } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function GoalsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [goals, setGoals] = useState<Goal[]>([
    // Example goal for demonstration
    {
      id: '1',
      title: 'Read "Atomic Habits" book',
      period: 'monthly',
      habits: [
        {
          id: '1',
          goalId: '1',
          name: 'Read 10 pages',
          recurrence: 'daily',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    },
  ]);

  const handleGoalCreate = (goalData: Omit<Goal, 'id' | 'createdAt' | 'habits'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      habits: [],
      createdAt: new Date().toISOString(),
    };
    setGoals([...goals, newGoal]);
  };

  const handleGoalUpdate = (id: string, goalData: Partial<Goal>) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, ...goalData } : goal
      )
    );
  };

  const handleGoalDelete = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  const handleHabitAdd = (goalId: string, habitData: Omit<Habit, 'id' | 'goalId' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      goalId,
      createdAt: new Date().toISOString(),
    };
    setGoals(
      goals.map((goal) =>
        goal.id === goalId
          ? { ...goal, habits: [...goal.habits, newHabit] }
          : goal
      )
    );
  };

  const handleHabitDelete = (goalId: string, habitId: string) => {
    setGoals(
      goals.map((goal) =>
        goal.id === goalId
          ? { ...goal, habits: goal.habits.filter((h) => h.id !== habitId) }
          : goal
      )
    );
  };

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 font-sans text-neutral-900 dark:bg-black dark:text-white">
      <Header title="Goals" />
      <div className="flex-1 flex items-start justify-center pt-24 pb-20 md:pb-32">
        <div className="w-full max-w-3xl mx-auto px-6 py-8">
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <GoalsList
                goals={goals}
                onGoalCreate={handleGoalCreate}
                onGoalUpdate={handleGoalUpdate}
                onGoalDelete={handleGoalDelete}
                onHabitAdd={handleHabitAdd}
                onHabitDelete={handleHabitDelete}
              />
            </TabsContent>
            <TabsContent value="weekly">
              <GoalsList
                goals={goals.filter((goal) => goal.period === 'weekly')}
                onGoalCreate={handleGoalCreate}
                onGoalUpdate={handleGoalUpdate}
                onGoalDelete={handleGoalDelete}
                onHabitAdd={handleHabitAdd}
                onHabitDelete={handleHabitDelete}
              />
            </TabsContent>
            <TabsContent value="monthly">
              <GoalsList
                goals={goals.filter((goal) => goal.period === 'monthly')}
                onGoalCreate={handleGoalCreate}
                onGoalUpdate={handleGoalUpdate}
                onGoalDelete={handleGoalDelete}
                onHabitAdd={handleHabitAdd}
                onHabitDelete={handleHabitDelete}
              />
            </TabsContent>
            <TabsContent value="quarterly">
              <GoalsList
                goals={goals.filter((goal) => goal.period === 'quarterly')}
                onGoalCreate={handleGoalCreate}
                onGoalUpdate={handleGoalUpdate}
                onGoalDelete={handleGoalDelete}
                onHabitAdd={handleHabitAdd}
                onHabitDelete={handleHabitDelete}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
