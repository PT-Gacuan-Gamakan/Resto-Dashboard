'use client';

import { HourlyStats } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatHour, formatDateForDisplay, isToday } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface HourlyChartProps {
  data: HourlyStats[];
  selectedDate?: Date;
}

export function HourlyChart({ data, selectedDate }: HourlyChartProps) {
  // Dynamic title based on selected date
  const title = selectedDate && !isToday(selectedDate)
    ? `Statistik Per Jam - ${formatDateForDisplay(selectedDate)}`
    : 'Statistik Per Jam Hari Ini';

  const chartData = data.map(stat => ({
    hour: formatHour(stat.hour),
    'Masuk': stat.entryCount,
    'Keluar': stat.exitCount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="hour"
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Bar dataKey="Masuk" fill="hsl(var(--primary))" />
            <Bar dataKey="Keluar" fill="hsl(var(--destructive))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
