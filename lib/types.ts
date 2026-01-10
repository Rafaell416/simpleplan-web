export type GoalPeriod = 'weekly' | 'monthly' | 'quarterly';

export type ActionRecurrenceType = 'daily' | 'weekdays' | 'weekly' | 'custom';

export interface ActionRecurrence {
  type: ActionRecurrenceType;
  weeklyDay?: number; // 0-6 (0 = Sunday, 1 = Monday, etc.) for 'weekly' type
  customDays?: number[]; // Array of day numbers (0-6) for 'custom' type
}

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

