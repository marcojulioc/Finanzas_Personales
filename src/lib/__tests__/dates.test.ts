import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatDateLong,
  formatDateShort,
  formatMonthYear,
  getMonthRange,
  getCurrentMonthYear,
  parseDate,
  toISODateString,
} from "../dates";

describe("formatDate", () => {
  it("should format date with default format", () => {
    const date = new Date(2024, 0, 15);
    expect(formatDate(date)).toBe("15/01/2024");
  });

  it("should format date with custom format", () => {
    const date = new Date(2024, 0, 15);
    expect(formatDate(date, "yyyy-MM-dd")).toBe("2024-01-15");
  });

  it("should handle string dates", () => {
    expect(formatDate("2024-01-15")).toBe("15/01/2024");
  });

  it("should return empty string for invalid dates", () => {
    expect(formatDate("invalid")).toBe("");
  });
});

describe("formatDateLong", () => {
  it("should format date in long format", () => {
    const date = new Date(2024, 0, 15);
    const result = formatDateLong(date);
    expect(result).toContain("15");
    expect(result).toContain("enero");
    expect(result).toContain("2024");
  });
});

describe("formatDateShort", () => {
  it("should format date in short format", () => {
    const date = new Date(2024, 0, 15);
    const result = formatDateShort(date);
    expect(result).toContain("15");
  });
});

describe("formatMonthYear", () => {
  it("should format month and year", () => {
    const date = new Date(2024, 5, 15);
    const result = formatMonthYear(date);
    expect(result.toLowerCase()).toContain("junio");
    expect(result).toContain("2024");
  });
});

describe("getMonthRange", () => {
  it("should return start and end of month", () => {
    const date = new Date(2024, 5, 15);
    const range = getMonthRange(date);

    expect(range.start.getDate()).toBe(1);
    expect(range.start.getMonth()).toBe(5);
    expect(range.end.getDate()).toBe(30);
    expect(range.end.getMonth()).toBe(5);
  });
});

describe("getCurrentMonthYear", () => {
  it("should return current month and year", () => {
    const result = getCurrentMonthYear();
    const now = new Date();

    expect(result.month).toBe(now.getMonth() + 1);
    expect(result.year).toBe(now.getFullYear());
  });
});

describe("parseDate", () => {
  it("should parse valid ISO date string", () => {
    const result = parseDate("2024-01-15");
    expect(result).not.toBeNull();
    expect(result?.getFullYear()).toBe(2024);
    expect(result?.getMonth()).toBe(0);
    expect(result?.getDate()).toBe(15);
  });

  it("should return null for invalid date", () => {
    expect(parseDate("invalid")).toBeNull();
    expect(parseDate("")).toBeNull();
  });
});

describe("toISODateString", () => {
  it("should convert date to ISO string format", () => {
    const date = new Date(2024, 0, 15);
    expect(toISODateString(date)).toBe("2024-01-15");
  });
});
