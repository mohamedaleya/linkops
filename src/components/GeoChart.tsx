'use client';

import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface GeoData {
  country: string;
  clicks: number;
}

interface GeoChartProps {
  data: GeoData[];
}

const chartConfig = {
  clicks: {
    label: 'Clicks',
    color: 'oklch(var(--chart-1))',
  },
} satisfies ChartConfig;

export function GeoChart({ data }: GeoChartProps) {
  const sortedData = [...data].sort((a, b) => b.clicks - a.clicks).slice(0, 5);

  return (
    <Card className="border bg-card/50 shadow-none backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Top Locations</CardTitle>
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
                  dataKey="country"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={100}
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
              No location data yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
