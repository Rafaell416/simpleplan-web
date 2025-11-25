export type GoalPeriod = 'weekly' | 'monthly' | 'quarterly';
export type HabitRecurrence = 'daily' | 'weekly';

export interface Habit {
  id: string;
  goalId: string;
  name: string;
  recurrence: HabitRecurrence;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  period: GoalPeriod;
  habits: Habit[];
  createdAt: string;
  targetDate?: string; // Optional target date for the goal
}

