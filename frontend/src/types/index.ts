export interface DashboardData {
  currentVisitors: number;
  maxCapacity: number;
  availableSeats: number;
  occupancyRate: number;
  status: 'open' | 'full' | 'closed';
  isOpen: boolean;
}

export interface HourlyStats {
  hour: number;
  entryCount: number;
  exitCount: number;
  peakVisitors: number;
}

export interface RealtimeEvent {
  id: string;
  type: 'entry' | 'exit';
  timestamp: string;
  currentVisitors: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
  photo: string;
}
