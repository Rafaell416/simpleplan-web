'use client';

import { Bar, BarChart, XAxis, YAxis, Cell } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { type GoalProgressItem } from '@/lib/useStats';

interface GoalProgressComparisonProps {
  data: GoalProgressItem[];
}

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

const chartConfig = {
  progress: {
    label: 'Progress',
  },
} satisfies ChartConfig;

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '...' : str;
}

export function GoalProgressComparison({ data }: GoalProgressComparisonProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-neutral-500 dark:text-neutral-400">
        No active goals
      </div>
    );
  }

  const chartData = data.map((g) => ({
    name: g.title,
    progress: g.progress,
  }));

  const barHeight = 36;
  const chartHeight = Math.max(120, chartData.length * barHeight + 40);

  return (
    <ChartContainer config={chartConfig} className="w-full" style={{ height: chartHeight }}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 4, bottom: 0, left: 0 }}
      >
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={100}
          tickFormatter={(v) => truncate(v, 14)}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip
          content={<ChartTooltipContent formatter={(value) => `${value}%`} />}
        />
        <Bar dataKey="progress" radius={[0, 6, 6, 0]} barSize={20}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
