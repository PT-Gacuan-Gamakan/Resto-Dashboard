'use client';

import { RealtimeEvent } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { formatTime } from '@/lib/utils';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface RealtimeEventFeedProps {
  events: RealtimeEvent[];
}

export function RealtimeEventFeed({ events }: RealtimeEventFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Real-time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada aktivitas hari ini
            </p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                {event.type === 'entry' ? (
                  <ArrowDownCircle className="h-5 w-5 text-primary flex-shrink-0" />
                ) : (
                  <ArrowUpCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {event.type === 'entry' ? 'Pengunjung Masuk' : 'Pengunjung Keluar'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(event.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
