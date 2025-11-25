'use client';

import { HourlyStats } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatHour, formatDateForDisplay, formatDateForAPI, isToday } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';

interface HourlyChartProps {
  data: HourlyStats[];
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

export function HourlyChart({ data, selectedDate, onDateChange }: HourlyChartProps) {
  // Dynamic title based on selected date
  const title = selectedDate && !isToday(selectedDate)
    ? `Statistik Per Jam - ${formatDateForDisplay(selectedDate)}`
    : 'Statistik Per Jam Hari Ini';

  const chartData = data.map(stat => ({
    hour: formatHour(stat.hour),
    'Masuk': stat.entryCount,
    'Keluar': stat.exitCount,
  }));

  const currentDate = selectedDate || new Date();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={formatDateForAPI(currentDate)}
              onChange={(e) => onDateChange?.(new Date(e.target.value))}
              max={formatDateForAPI(new Date())}
              className="px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground [color-scheme:light] dark:[color-scheme:dark]"
            />
            {!isToday(currentDate) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDateChange?.(new Date())}
              >
                Hari Ini
              </Button>
            )}
          </div>
        </div>
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
