'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { type TodoDailyData } from '@/lib/useStats';
import { autoAggregation } from '@/lib/utils/statsUtils';

interface TodosCompletedChartProps {
  data: TodoDailyData[];
  startDate: string;
  endDate: string;
}

const chartConfig = {
  completed: {
    label: 'Completed',
    color: 'var(--chart-2)',
  },
  incomplete: {
    label: 'Incomplete',
    color: 'hsl(var(--muted))',
  },
} satisfies ChartConfig;

function formatXLabel(dateStr: string): string {
  if (dateStr.length === 7) {
    const [y, m] = dateStr.split('-');
    const d = new Date(Number(y), Number(m) - 1);
    return d.toLocaleDateString('en-US', { month: 'short' });
  }
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function aggregateTodos(
  data: TodoDailyData[],
  startDate: string,
  endDate: string
): { date: string; completed: number; incomplete: number }[] {
  const period = autoAggregation(startDate, endDate);
  if (period === 'day') {
    return data.map(d => ({
      date: d.date,
      completed: d.completed,
      incomplete: Math.max(0, d.total - d.completed),
    }));
  }

  const buckets = new Map<string, { completed: number; incomplete: number }>();
  for (const point of data) {
    const d = new Date(point.date + 'T00:00:00');
    let key: string;
    if (period === 'week') {
      const day = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((day + 6) % 7));
      const y = monday.getFullYear();
      const m = String(monday.getMonth() + 1).padStart(2, '0');
      const dd = String(monday.getDate()).padStart(2, '0');
      key = `${y}-${m}-${dd}`;
    } else {
      key = point.date.slice(0, 7);
    }
    const bucket = buckets.get(key) || { completed: 0, incomplete: 0 };
    bucket.completed += point.completed;
    bucket.incomplete += Math.max(0, point.total - point.completed);
    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }));
}

export function TodosCompletedChart({ data, startDate, endDate }: TodosCompletedChartProps) {
  const chartData = aggregateTodos(data, startDate, endDate);
  const hasData = chartData.some(d => d.completed > 0 || d.incomplete > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-neutral-500 dark:text-neutral-400">
        No todo data for this period
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-56 w-full">
      <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
        <XAxis
          dataKey="date"
          tickFormatter={formatXLabel}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="completed" stackId="a" fill="var(--chart-2)" radius={[0, 0, 0, 0]} />
        <Bar dataKey="incomplete" stackId="a" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
