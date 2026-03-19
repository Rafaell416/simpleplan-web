import { formatDate } from './actionUtils';

export type DatePreset = '7d' | '30d' | '3m' | '1y' | 'custom';

export function getDateRange(
  preset: DatePreset,
  custom?: { start: string; end: string }
): { startDate: string; endDate: string } {
  if (preset === 'custom' && custom) {
    return { startDate: custom.start, endDate: custom.end };
  }

  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);

  switch (preset) {
    case '7d':
      start.setDate(start.getDate() - 6);
      break;
    case '30d':
      start.setDate(start.getDate() - 29);
      break;
    case '3m':
      start.setMonth(start.getMonth() - 3);
      break;
    case '1y':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return { startDate: formatDate(start), endDate: formatDate(end) };
}

/**
 * Walk a sorted array of date strings and compute streaks.
 * `activeDates` is a Set of YYYY-MM-DD strings where the user was active.
 * `allDates` is every date in range (sorted ascending).
 */
export function computeStreaks(
  activeDates: Set<string>,
  allDates: string[]
): { current: number; longest: number } {
  let longest = 0;
  let running = 0;

  for (const d of allDates) {
    if (activeDates.has(d)) {
      running++;
      if (running > longest) longest = running;
    } else {
      running = 0;
    }
  }

  // Current streak: walk backwards from today
  const today = formatDate(new Date());
  let current = 0;
  for (let i = allDates.length - 1; i >= 0; i--) {
    if (allDates[i] > today) continue;
    if (activeDates.has(allDates[i])) {
      current++;
    } else {
      break;
    }
  }

  return { current, longest };
}

export function computeConsistencyScore(activeDays: number, totalDays: number): number {
  if (totalDays === 0) return 0;
  return Math.round((activeDays / totalDays) * 100);
}

export interface DailyDataPoint {
  date: string;
  value: number;
}

export type AggregationPeriod = 'day' | 'week' | 'month';

export function aggregateByPeriod(
  data: DailyDataPoint[],
  period: AggregationPeriod
): DailyDataPoint[] {
  if (period === 'day') return data;

  const buckets = new Map<string, { sum: number; count: number }>();

  for (const point of data) {
    const d = new Date(point.date + 'T00:00:00');
    let key: string;

    if (period === 'week') {
      const day = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((day + 6) % 7));
      key = formatDate(monday);
    } else {
      key = point.date.slice(0, 7);
    }

    const bucket = buckets.get(key) || { sum: 0, count: 0 };
    bucket.sum += point.value;
    bucket.count++;
    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { sum, count }]) => ({
      date: key,
      value: Math.round(sum / count),
    }));
}

/**
 * Pick an appropriate aggregation period based on the number of days in range.
 */
export function autoAggregation(startDate: string, endDate: string): AggregationPeriod {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  if (days <= 31) return 'day';
  if (days <= 120) return 'week';
  return 'month';
}

/**
 * Generate all dates (YYYY-MM-DD) between start and end inclusive.
 */
export function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  while (cursor <= end) {
    dates.push(formatDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}
