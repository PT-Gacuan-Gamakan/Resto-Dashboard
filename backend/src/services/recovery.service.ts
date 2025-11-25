import { PrismaClient } from '@prisma/client';
import { TimezoneUtil } from '../utils/timezone.util';

export class RecoveryService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Recovers current visitor count from visitor logs
   * Calculates net visitors from today's entry/exit events
   */
  async recoverCurrentVisitorCount(): Promise<number> {
    const startOfDay = TimezoneUtil.getStartOfDayJakarta();

    const entries = await this.prisma.visitorLog.count({
      where: {
        type: 'entry',
        timestamp: { gte: startOfDay }
      }
    });

    const exits = await this.prisma.visitorLog.count({
      where: {
        type: 'exit',
        timestamp: { gte: startOfDay }
      }
    });

    // Calculate net visitors, ensure minimum of 0
    const netVisitors = Math.max(0, entries - exits);

    // REMOVED: Minimum visitor validation - allow count to be 0

    return netVisitors;
  }

  /**
   * Synchronizes database with recovered count
   */
  async syncCurrentStatus(): Promise<void> {
    const recoveredCount = await this.recoverCurrentVisitorCount();

    await this.prisma.currentStatus.update({
      where: { id: 'singleton' },
      data: { currentVisitors: recoveredCount }
    });

    console.log(`[Recovery] Synced visitor count: ${recoveredCount}`);
  }
}
