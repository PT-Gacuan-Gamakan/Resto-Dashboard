import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { toZonedTime, format } from 'date-fns-tz';

const JAKARTA_TZ = 'Asia/Jakarta';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const jakartaDate = toZonedTime(date, JAKARTA_TZ);

  return format(jakartaDate, 'HH:mm:ss', { timeZone: JAKARTA_TZ });
}

export function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00 WIB`;
}

export function formatDateTimeJakarta(timestamp: string): string {
  const date = new Date(timestamp);
  const jakartaDate = toZonedTime(date, JAKARTA_TZ);

  return format(jakartaDate, 'dd MMM yyyy HH:mm:ss', { timeZone: JAKARTA_TZ });
}

export function formatDateForAPI(date: Date): string {
  const jakartaDate = toZonedTime(date, JAKARTA_TZ);
  return format(jakartaDate, 'yyyy-MM-dd', { timeZone: JAKARTA_TZ });
}

export function formatDateForDisplay(date: Date): string {
  const jakartaDate = toZonedTime(date, JAKARTA_TZ);
  return format(jakartaDate, 'dd MMMM yyyy', { timeZone: JAKARTA_TZ });
}

export function isToday(date: Date): boolean {
  const today = new Date();
  const jakartaToday = toZonedTime(today, JAKARTA_TZ);
  const jakartaDate = toZonedTime(date, JAKARTA_TZ);

  return jakartaToday.getDate() === jakartaDate.getDate() &&
         jakartaToday.getMonth() === jakartaDate.getMonth() &&
         jakartaToday.getFullYear() === jakartaDate.getFullYear();
}
