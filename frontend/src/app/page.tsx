'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { DashboardData, HourlyStats, RealtimeEvent } from '@/types';
import { StatCard } from '@/components/StatCard';
import { HourlyChart } from '@/components/HourlyChart';
import { RealtimeEventFeed } from '@/components/RealtimeEventFeed';
import { CapacityControl } from '@/components/CapacityControl';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Users,
  UserCheck,
  TrendingUp,
  Activity,
  CircleAlert,
  CircleCheck,
  CircleX
} from 'lucide-react';
import Logo from '../images/Desain tanpa judul (3)(1).png'

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    currentVisitors: 0,
    maxCapacity: 100,
    availableSeats: 100,
    occupancyRate: 0,
    status: 'closed',
    isOpen: false,
  });

  const [hourlyStats, setHourlyStats] = useState<HourlyStats[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('dashboard:update', (data: DashboardData) => {
      setDashboardData(data);
    });

    socket.on('stats:hourly', (stats: HourlyStats[]) => {
      setHourlyStats(stats);
    });

    socket.on('visitor:event', (event: RealtimeEvent) => {
      setRealtimeEvents((prev) => [event, ...prev].slice(0, 20));
    });

    // Fetch initial data
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`)
      .then(res => res.json())
      .then(data => setDashboardData(data))
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats/hourly`)
      .then(res => res.json())
      .then(stats => setHourlyStats(stats))
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/recent`)
      .then(res => res.json())
      .then(events => {
        const formattedEvents = events.map((e: any) => ({
          id: e.id,
          type: e.type,
          timestamp: e.timestamp,
          currentVisitors: 0
        }));
        setRealtimeEvents(formattedEvents);
      })
      .catch(console.error);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('dashboard:update');
      socket.off('stats:hourly');
      socket.off('visitor:event');
    };
  }, []);

  const isAlmostFull =
    dashboardData.isOpen &&
    dashboardData.status !== 'full' &&
    dashboardData.occupancyRate > 80;

  const handleCapacityUpdate = async (capacity: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/capacity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ capacity }),
      });

      if (response.ok) {
        console.log('Capacity updated successfully');
      }
    } catch (error) {
      console.error('Failed to update capacity:', error);
    }
  };

  const getStatusIcon = () => {
    if (!dashboardData.isOpen) {
      return <CircleX className="h-6 w-6 text-muted-foreground" />;
    }
    if (dashboardData.status === 'full') {
      return <CircleAlert className="h-6 w-6 text-destructive" />;
    }
    if (isAlmostFull) {
      return <CircleAlert className="h-6 w-6 text-yellow-500" />;
    }
    return <CircleCheck className="h-6 w-6 text-primary" />;
  };

  const getStatusText = () => {
    if (!dashboardData.isOpen) return 'Tutup';
    if (dashboardData.status === 'full') return 'Penuh';
    if (isAlmostFull) return 'Hampir Penuh';
    return 'Tersedia';
  };

  const getStatusColor = () => {
    if (!dashboardData.isOpen) return 'text-muted-foreground';
    if (dashboardData.status === 'full') return 'text-destructive';
    if (isAlmostFull) return 'text-yellow-500';
    return 'text-primary';
  };

  const peakHour = hourlyStats.reduce((max, stat) =>
    stat.peakVisitors > max.peakVisitors ? stat : max
  , { hour: 0, peakVisitors: 0, entryCount: 0, exitCount: 0 });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo Placeholder */}
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <Image src={Logo} alt="Resto Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mie Gacuan Dashboard</h1>
              <p className="text-sm text-muted-foreground">Monitoring Pengunjung Real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="text-sm text-muted-foreground capitalize">
                {connectionStatus === 'connected' ? 'Terhubung' :
                 connectionStatus === 'connecting' ? 'Menghubungkan...' :
                 'Terputus'}
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Pengunjung Saat Ini"
            value={dashboardData.currentVisitors}
            subtitle={`dari ${dashboardData.maxCapacity} kapasitas`}
            icon={Users}
            iconColor="text-primary"
          />
          <StatCard
            title="Kursi Tersedia"
            value={dashboardData.availableSeats}
            subtitle="kursi kosong"
            icon={UserCheck}
            iconColor="text-green-500"
          />
          <StatCard
            title="Tingkat Hunian"
            value={`${dashboardData.occupancyRate}%`}
            subtitle="dari kapasitas total"
            icon={TrendingUp}
            iconColor="text-blue-500"
          />
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Status</span>
              {getStatusIcon()}
            </div>
            <div className={`text-2xl font-bold ${getStatusColor()}`}>
              {getStatusText()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Status restoran
            </p>
          </div>
        </div>

        {/* Peak Hour Info */}
        {peakHour.peakVisitors > 0 && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span className="font-medium">Jam Tersibuk Hari Ini:</span>
              <span className="font-bold">
                {peakHour.hour.toString().padStart(2, '0')}:00
              </span>
              <span className="text-muted-foreground">dengan</span>
              <span className="font-bold">{peakHour.peakVisitors} pengunjung</span>
            </div>
          </div>
        )}

        {/* Charts and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <HourlyChart data={hourlyStats} />
          </div>
          <div>
            <CapacityControl
              currentCapacity={dashboardData.maxCapacity}
              onUpdate={handleCapacityUpdate}
            />
          </div>
        </div>

        {/* Realtime Feed */}
        <div>
          <RealtimeEventFeed events={realtimeEvents} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Tugas Akhir IOT Kelompok 3</p>
        </div>
      </footer>
    </div>
  );
}
