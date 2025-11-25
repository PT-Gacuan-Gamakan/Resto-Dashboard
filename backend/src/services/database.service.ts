import { PrismaClient } from '@prisma/client';
import { DashboardData, HourlyStats } from '../types';
import { TimezoneUtil } from '../utils/timezone.util';

export class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async initialize() {
    try {
      await this.prisma.$connect();
      console.log('[Database] Connected to PostgreSQL');

      // Initialize current status if not exists
      await this.initializeCurrentStatus();
    } catch (error) {
      console.error('[Database] Connection failed:', error);
      throw error;
    }
  }

  private async initializeCurrentStatus() {
    const status = await this.prisma.currentStatus.findUnique({
      where: { id: 'singleton' }
    });

    if (!status) {
      const maxCapacity = parseInt(process.env.DEFAULT_MAX_CAPACITY || '100');
      await this.prisma.currentStatus.create({
        data: {
          id: 'singleton',
          currentVisitors: 0,
          maxCapacity,
          isOpen: true
        }
      });
      console.log('[Database] Initialized current status');
    }

    // ALWAYS recover count on startup (critical fix for visitor count bug)
    const { RecoveryService } = await import('./recovery.service');
    const recovery = new RecoveryService(this.prisma);
    await recovery.syncCurrentStatus();
  }

  async logVisitor(type: 'entry' | 'exit'): Promise<void> {
    await this.prisma.visitorLog.create({
      data: { type }
    });
  }

  async updateCurrentVisitors(delta: number): Promise<number> {
    const status = await this.prisma.currentStatus.findUnique({
      where: { id: 'singleton' }
    });

    if (!status) throw new Error('Status not initialized');

    let newCount = Math.max(0, status.currentVisitors + delta);

    // If open and count would drop to 0, keep at 1 (minimum visitor validation)
    if (status.isOpen && newCount === 0 && delta < 0) {
      newCount = 1;
      console.log('[Database] Maintaining minimum visitor count of 1');
    }

    await this.prisma.currentStatus.update({
      where: { id: 'singleton' },
      data: { currentVisitors: newCount }
    });

    return newCount;
  }

  async getCurrentStatus(): Promise<DashboardData> {
    const status = await this.prisma.currentStatus.findUnique({
      where: { id: 'singleton' }
    });

    if (!status) throw new Error('Status not initialized');

    const availableSeats = Math.max(0, status.maxCapacity - status.currentVisitors);
    const occupancyRate = status.maxCapacity > 0
      ? Math.round((status.currentVisitors / status.maxCapacity) * 100)
      : 0;

    let statusText: 'open' | 'full' | 'closed' = 'closed';
    if (status.isOpen) {
      statusText = status.currentVisitors >= status.maxCapacity ? 'full' : 'open';
    }

    return {
      currentVisitors: status.currentVisitors,
      maxCapacity: status.maxCapacity,
      availableSeats,
      occupancyRate,
      status: statusText,
      isOpen: status.isOpen
    };
  }

  async updateMaxCapacity(capacity: number): Promise<void> {
    await this.prisma.currentStatus.update({
      where: { id: 'singleton' },
      data: { maxCapacity: capacity }
    });
  }

  async toggleOpenStatus(isOpen: boolean): Promise<void> {
    await this.prisma.currentStatus.update({
      where: { id: 'singleton' },
      data: { isOpen }
    });
  }

  async updateHourlyStats(date: Date, hour: number, type: 'entry' | 'exit', currentVisitors: number): Promise<void> {
    const dateOnly = TimezoneUtil.getDateOnlyJakarta(date);

    const existing = await this.prisma.hourlyStatistic.findUnique({
      where: {
        date_hour: {
          date: dateOnly,
          hour
        }
      }
    });

    if (existing) {
      const updateData: any = {};
      if (type === 'entry') {
        updateData.entryCount = existing.entryCount + 1;
        updateData.peakVisitors = Math.max(existing.peakVisitors, currentVisitors);
      } else {
        updateData.exitCount = existing.exitCount + 1;
      }

      await this.prisma.hourlyStatistic.update({
        where: {
          date_hour: {
            date: dateOnly,
            hour
          }
        },
        data: updateData
      });
    } else {
      await this.prisma.hourlyStatistic.create({
        data: {
          date: dateOnly,
          hour,
          entryCount: type === 'entry' ? 1 : 0,
          exitCount: type === 'exit' ? 1 : 0,
          peakVisitors: currentVisitors
        }
      });
    }
  }

  async getTodayHourlyStats(): Promise<HourlyStats[]> {
    const today = TimezoneUtil.nowInJakarta();
    const dateOnly = TimezoneUtil.getDateOnlyJakarta(today);

    const stats = await this.prisma.hourlyStatistic.findMany({
      where: { date: dateOnly },
      orderBy: { hour: 'asc' }
    });

    // Fill in missing hours with zeros
    const result: HourlyStats[] = [];
    for (let i = 0; i < 24; i++) {
      const stat = stats.find(s => s.hour === i);
      result.push({
        hour: i,
        entryCount: stat?.entryCount || 0,
        exitCount: stat?.exitCount || 0,
        peakVisitors: stat?.peakVisitors || 0
      });
    }

    return result;
  }

  async getRecentEvents(limit: number = 20) {
    return this.prisma.visitorLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}
