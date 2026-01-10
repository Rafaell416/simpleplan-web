export type GoalPeriod = 'weekly' | 'monthly' | 'quarterly';

export type ActionRecurrenceType = 'daily' | 'weekdays' | 'weekly' | 'custom';

export interface ActionRecurrence {
  type: ActionRecurrenceType;
  weeklyDay?: number; // 0-6 (0 = Sunday, 1 = Monday, etc.) for 'weekly' type
  customDays?: number[]; // Array of day numbers (0-6) for 'custom' type
}

export interface ActionCompletion {
  date: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
}

export interface Action {
  id: string;
  goalId: string;
  name: string;
  recurrence: ActionRecurrence;
  createdAt: string;
  completions?: ActionCompletion[]; // Array of completion records
}

export interface Goal {
  id: string;
  title: string;
  actions: Action[];
  createdAt: string;
  targetDate?: string; // Optional target date for the goal
}

