export type GoalPeriod = 'weekly' | 'monthly' | 'quarterly';
export type ActionRecurrence = 'daily' | 'weekly';

export interface Action {
  id: string;
  goalId: string;
  name: string;
  recurrence: ActionRecurrence;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  actions: Action[];
  createdAt: string;
  targetDate?: string; // Optional target date for the goal
}

