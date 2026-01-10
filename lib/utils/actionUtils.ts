import { ActionRecurrence, Action } from '../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatRecurrence(recurrence: ActionRecurrence): string {
  switch (recurrence.type) {
    case 'daily':
      return 'Daily';
    case 'weekdays':
      return 'Weekdays';
    case 'weekly':
      return `Every ${DAYS[recurrence.weeklyDay ?? 1]}`;
    case 'custom':
      if (recurrence.customDays && recurrence.customDays.length > 0) {
        return recurrence.customDays.map(d => DAYS[d]).join(', ');
      }
      return 'Custom';
    default:
      return 'Daily';
  }
}

// Check if an action is applicable on a specific date based on recurrence
export function isActionApplicableOnDay(action: Action, date: Date): boolean {
  const actionCreated = new Date(action.createdAt);
  // Only show dates on or after the action was created
  if (date < actionCreated) {
    return false;
  }

  const dayOfWeek = date.getDay();

  switch (action.recurrence.type) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
    case 'weekly':
      return dayOfWeek === (action.recurrence.weeklyDay ?? 1);
    case 'custom':
      return action.recurrence.customDays?.includes(dayOfWeek) ?? false;
    default:
      return false;
  }
}

// Check if an action is completed on a specific date
export function isActionCompletedOnDate(action: Action, date: string): boolean {
  return action.completions?.some(c => c.date === date && c.completed) ?? false;
}

// Format date as YYYY-MM-DD
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
