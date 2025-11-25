import { toZonedTime, format } from 'date-fns-tz';

const JAKARTA_TZ = 'Asia/Jakarta';

export class TimezoneUtil {
  /**
   * Get current time in Jakarta timezone
   */
  static nowInJakarta(): Date {
    return toZonedTime(new Date(), JAKARTA_TZ);
  }

  /**
   * Convert any Date to Jakarta timezone
   */
  static toJakarta(date: Date): Date {
    return toZonedTime(date, JAKARTA_TZ);
  }

  /**
   * Get Jakarta hour (0-23) from Date
   */
  static getJakartaHour(date: Date): number {
    const jakartaDate = toZonedTime(date, JAKARTA_TZ);
    return jakartaDate.getHours();
  }

  /**
   * Get start of day in Jakarta timezone
   */
  static getStartOfDayJakarta(date: Date = new Date()): Date {
    const jakartaDate = toZonedTime(date, JAKARTA_TZ);
    return new Date(jakartaDate.getFullYear(), jakartaDate.getMonth(), jakartaDate.getDate());
  }

  /**
   * Format date to ISO string with Jakarta timezone
   */
  static toISOStringJakarta(date: Date): string {
    const jakartaDate = toZonedTime(date, JAKARTA_TZ);
    return format(jakartaDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", { timeZone: JAKARTA_TZ });
  }

  /**
   * Get date only (without time) in Jakarta timezone
   */
  static getDateOnlyJakarta(date: Date = new Date()): Date {
    const jakarta = toZonedTime(date, JAKARTA_TZ);
    // Return date at midnight UTC for consistent storage
    return new Date(Date.UTC(jakarta.getFullYear(), jakarta.getMonth(), jakarta.getDate()));
  }
}
