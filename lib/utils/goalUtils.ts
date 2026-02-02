import { Goal, Action } from '../types';
import { formatDate, isActionCompletedOnDate, isActionApplicableOnDay } from './actionUtils';

/**
 * Check if a goal is overdue (target date has passed and goal is not completed)
 */
export function isGoalOverdue(goal: Goal): boolean {
  if (!goal.targetDate || goal.completed) {
    return false;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(goal.targetDate);
  targetDate.setHours(0, 0, 0, 0);
  
  return targetDate < today;
}

/**
 * Get the number of days a goal is overdue
 */
export function getOverdueDays(goal: Goal): number {
  if (!isGoalOverdue(goal) || !goal.targetDate) {
    return 0;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(goal.targetDate);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Check if an action is overdue
 * An action is overdue if:
 * - The goal is overdue
 * - The action was applicable on the target date (based on recurrence)
 * - The action was not completed on the target date
 * 
 * Note: The `date` parameter is kept for API compatibility but the function
 * always checks against the goal's target date.
 */
export function isActionOverdue(action: Action, goal: Goal, date: Date): boolean {
  if (!goal.targetDate || goal.completed) {
    return false;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(goal.targetDate);
  targetDate.setHours(0, 0, 0, 0);
  
  // Goal must be overdue
  if (targetDate >= today) {
    return false;
  }
  
  // Check if action was applicable on the target date (based on recurrence pattern)
  if (!isActionApplicableOnDay(action, targetDate)) {
    return false;
  }
  
  // Check if action was completed on the target date
  const targetDateStr = formatDate(targetDate);
  const wasCompleted = isActionCompletedOnDate(action, targetDateStr);
  
  // Action is overdue if it wasn't completed on the target date
  return !wasCompleted;
}

/**
 * Calculate goal progress based on completed actions
 * Returns a percentage (0-100) based on how many actions are completed
 */
export function calculateGoalProgress(goal: Goal): number {
  if (goal.actions.length === 0) {
    return 0;
  }
  
  // Count completed actions
  // An action is considered completed if it has at least one completion record
  const completedActions = goal.actions.filter(action => {
    return action.completions && action.completions.some(c => c.completed);
  }).length;
  
  const progress = (completedActions / goal.actions.length) * 100;
  return Math.round(progress);
}
