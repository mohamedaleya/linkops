'use client';

import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface ReferrerData {
  referrer: string;
  clicks: number;
}

interface ReferrerChartProps {
  data: ReferrerData[];
}

const chartConfig = {
  clicks: {
    label: 'Clicks',
    color: 'oklch(var(--chart-2))',
  },
} satisfies ChartConfig;

export function ReferrerChart({ data }: ReferrerChartProps) {
  const sortedData = [...data].sort((a, b) => b.clicks - a.clicks).slice(0, 5);

  return (
    <Card className="border bg-card/50 shadow-none backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Top Referrers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          {sortedData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart
                accessibilityLayer
                data={sortedData}
                layout="vertical"
                margin={{ left: 0, right: 0 }}
              >
                <XAxis type="number" dataKey="clicks" hide />
                <YAxis
                  dataKey="referrer"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={100}
                  tickFormatter={(value) =>
                    value.length > 15 ? `${value.substring(0, 15)}...` : value
                  }
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="clicks"
                  fill="var(--color-clicks)"
                  radius={4}
                  barSize={20}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No referrer data yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
