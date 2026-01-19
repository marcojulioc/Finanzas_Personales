import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  addMonths,
  parseISO,
  isValid,
  startOfDay,
  endOfDay,
} from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(date: Date | string, formatStr: string = "dd/MM/yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "";
  return format(d, formatStr, { locale: es });
}

export function formatDateLong(date: Date | string): string {
  return formatDate(date, "d 'de' MMMM, yyyy");
}

export function formatDateShort(date: Date | string): string {
  return formatDate(date, "dd MMM");
}

export function formatMonthYear(date: Date | string): string {
  return formatDate(date, "MMMM yyyy");
}

export function getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function getYearRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfYear(date),
    end: endOfYear(date),
  };
}

export function getDayRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfDay(date),
    end: endOfDay(date),
  };
}

export function getLastMonths(count: number, fromDate: Date = new Date()): Date[] {
  const months: Date[] = [];
  for (let i = 0; i < count; i++) {
    months.push(subMonths(fromDate, i));
  }
  return months.reverse();
}

export function getNextMonth(date: Date = new Date()): Date {
  return addMonths(date, 1);
}

export function getPreviousMonth(date: Date = new Date()): Date {
  return subMonths(date, 1);
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

export function parseDate(dateString: string): Date | null {
  const parsed = parseISO(dateString);
  return isValid(parsed) ? parsed : null;
}

export function toISODateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
