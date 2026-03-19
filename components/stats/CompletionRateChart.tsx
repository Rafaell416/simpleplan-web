'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { type DailyDataPoint, aggregateByPeriod, autoAggregation } from '@/lib/utils/statsUtils';

interface CompletionRateChartProps {
  data: DailyDataPoint[];
  startDate: string;
  endDate: string;
}

const chartConfig = {
  value: {
    label: 'Completion Rate',
    color: 'var(--chart-1)',
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

export function CompletionRateChart({ data, startDate, endDate }: CompletionRateChartProps) {
  const period = autoAggregation(startDate, endDate);
  const chartData = aggregateByPeriod(data, period);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-neutral-500 dark:text-neutral-400">
        No data for this period
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-56 w-full">
      <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
        <XAxis
          dataKey="date"
          tickFormatter={formatXLabel}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          className="text-neutral-500 dark:text-neutral-400"
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          className="text-neutral-500 dark:text-neutral-400"
        />
        <ChartTooltip
          content={<ChartTooltipContent formatter={(value) => `${value}%`} />}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--chart-1)"
          fill="url(#completionGrad)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
