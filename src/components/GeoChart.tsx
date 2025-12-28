'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GeoData {
  country: string;
  clicks: number;
}

interface GeoChartProps {
  data: GeoData[];
}

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export function GeoChart({ data }: GeoChartProps) {
  const sortedData = [...data].sort((a, b) => b.clicks - a.clicks).slice(0, 5);

  return (
    <Card className="bg-card/50 border shadow-none backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Top Locations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          {sortedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedData}
                layout="vertical"
                margin={{ left: -20 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="country"
                  type="category"
                  tick={{ fontSize: 12 }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background/90 rounded-lg border p-2 shadow-xl backdrop-blur-md">
                          <p className="text-xs font-medium">
                            {payload[0].payload.country}
                          </p>
                          <p className="text-xs text-primary">
                            {payload[0].value} clicks
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="clicks" radius={[0, 4, 4, 0]} barSize={20}>
                  {sortedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      opacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
