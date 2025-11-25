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

    // If restaurant is open and count is 0, set to 1
    const status = await this.prisma.currentStatus.findUnique({
      where: { id: 'singleton' }
    });

    if (status?.isOpen && netVisitors === 0) {
      console.log('[Recovery] Restaurant is open but count is 0, setting to minimum 1 visitor');
      return 1; // Minimum 1 visitor during operating hours
    }

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
