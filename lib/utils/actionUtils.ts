import { ActionRecurrence } from '../types';

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

