'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ActionRecurrence } from '@/lib/types';

interface ActionRecurrenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (recurrence: ActionRecurrence) => void;
  actionName: string;
  initialRecurrence?: ActionRecurrence;
}

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export function ActionRecurrenceDialog({
  open,
  onOpenChange,
  onConfirm,
  actionName,
  initialRecurrence,
}: ActionRecurrenceDialogProps) {
  const [recurrenceType, setRecurrenceType] = useState<ActionRecurrence['type']>('daily');
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [weeklyDay, setWeeklyDay] = useState<number>(new Date().getDay());

  useEffect(() => {
    if (open) {
      // Use initial recurrence if provided, otherwise reset to defaults
      if (initialRecurrence) {
        setRecurrenceType(initialRecurrence.type);
        setCustomDays(initialRecurrence.customDays ?? []);
        setWeeklyDay(initialRecurrence.weeklyDay ?? new Date().getDay());
      } else {
        setRecurrenceType('daily');
        setCustomDays([]);
        setWeeklyDay(new Date().getDay());
      }
    }
  }, [open, initialRecurrence]);

  const handleDayToggle = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleConfirm = () => {
    let recurrence: ActionRecurrence;

    switch (recurrenceType) {
      case 'daily':
        recurrence = { type: 'daily' };
        break;
      case 'weekdays':
        recurrence = { type: 'weekdays' };
        break;
      case 'weekly':
        recurrence = { type: 'weekly', weeklyDay };
        break;
      case 'custom':
        if (customDays.length === 0) {
          // Don't allow empty custom days
          return;
        }
        recurrence = { type: 'custom', customDays };
        break;
      default:
        recurrence = { type: 'daily' };
    }

    onConfirm(recurrence);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Recurrence for "{actionName}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recurrence Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
              How often should this action repeat?
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                <input
                  type="radio"
                  name="recurrence"
                  value="daily"
                  checked={recurrenceType === 'daily'}
                  onChange={(e) => setRecurrenceType(e.target.value as ActionRecurrence['type'])}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-neutral-900 dark:text-neutral-50">Daily (all days)</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                <input
                  type="radio"
                  name="recurrence"
                  value="weekdays"
                  checked={recurrenceType === 'weekdays'}
                  onChange={(e) => setRecurrenceType(e.target.value as ActionRecurrence['type'])}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-neutral-900 dark:text-neutral-50">Weekdays (Mon - Fri)</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                <input
                  type="radio"
                  name="recurrence"
                  value="weekly"
                  checked={recurrenceType === 'weekly'}
                  onChange={(e) => setRecurrenceType(e.target.value as ActionRecurrence['type'])}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-neutral-900 dark:text-neutral-50">
                  Weekly on {DAYS[weeklyDay].label}
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                <input
                  type="radio"
                  name="recurrence"
                  value="custom"
                  checked={recurrenceType === 'custom'}
                  onChange={(e) => setRecurrenceType(e.target.value as ActionRecurrence['type'])}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-neutral-900 dark:text-neutral-50">Custom</span>
              </label>
            </div>
          </div>

          {/* Weekly Day Selection */}
          {recurrenceType === 'weekly' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                Select day of the week:
              </label>
              <select
                value={weeklyDay}
                onChange={(e) => setWeeklyDay(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DAYS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Days Selection */}
          {recurrenceType === 'custom' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                Select days:
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      customDays.includes(day.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              {customDays.length === 0 && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  Please select at least one day
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={recurrenceType === 'custom' && customDays.length === 0}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

