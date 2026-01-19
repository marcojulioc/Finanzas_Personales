import { describe, it, expect } from "vitest";
import {
  formatMoney,
  parseMoney,
  calculateBalance,
  calculateCreditCardDebt,
  calculateBudgetProgress,
  getBudgetStatus,
  calculateSavings,
  calculateSavingsRate,
} from "../money";

describe("formatMoney", () => {
  it("should format positive numbers with default currency", () => {
    expect(formatMoney(1000)).toBe("RD$ 1,000.00");
    expect(formatMoney(1234.56)).toBe("RD$ 1,234.56");
  });

  it("should format with custom currency", () => {
    expect(formatMoney(1000, "USD")).toBe("USD 1,000.00");
    expect(formatMoney(1000, "EUR")).toBe("EUR 1,000.00");
  });

  it("should handle zero", () => {
    expect(formatMoney(0)).toBe("RD$ 0.00");
  });

  it("should handle negative numbers", () => {
    expect(formatMoney(-500)).toBe("RD$ -500.00");
  });

  it("should handle string input", () => {
    expect(formatMoney("1500.50")).toBe("RD$ 1,500.50");
  });
});

describe("parseMoney", () => {
  it("should parse formatted money strings", () => {
    expect(parseMoney("RD$ 1,000.00")).toBe(1000);
    expect(parseMoney("$1,234.56")).toBe(1234.56);
  });

  it("should handle plain numbers", () => {
    expect(parseMoney("500")).toBe(500);
    expect(parseMoney("500.50")).toBe(500.5);
  });

  it("should handle negative values", () => {
    expect(parseMoney("-500")).toBe(-500);
  });

  it("should return 0 for invalid input", () => {
    expect(parseMoney("abc")).toBe(0);
    expect(parseMoney("")).toBe(0);
  });
});

describe("calculateBalance", () => {
  it("should calculate correct balance", () => {
    expect(calculateBalance(1000, 500, 300)).toBe(1200);
  });

  it("should handle zero initial balance", () => {
    expect(calculateBalance(0, 1000, 400)).toBe(600);
  });

  it("should handle negative result", () => {
    expect(calculateBalance(100, 0, 500)).toBe(-400);
  });
});

describe("calculateCreditCardDebt", () => {
  it("should calculate debt correctly", () => {
    expect(calculateCreditCardDebt(5000, 2000)).toBe(3000);
  });

  it("should return 0 when fully paid", () => {
    expect(calculateCreditCardDebt(1000, 1000)).toBe(0);
  });

  it("should handle negative debt (overpayment)", () => {
    expect(calculateCreditCardDebt(1000, 1500)).toBe(-500);
  });
});

describe("calculateBudgetProgress", () => {
  it("should calculate progress percentage", () => {
    expect(calculateBudgetProgress(50, 100)).toBe(50);
    expect(calculateBudgetProgress(75, 100)).toBe(75);
  });

  it("should cap at 100%", () => {
    expect(calculateBudgetProgress(150, 100)).toBe(100);
  });

  it("should return 0 for zero budget", () => {
    expect(calculateBudgetProgress(50, 0)).toBe(0);
  });

  it("should handle zero spent", () => {
    expect(calculateBudgetProgress(0, 100)).toBe(0);
  });
});

describe("getBudgetStatus", () => {
  it("should return 'safe' for progress under 80%", () => {
    expect(getBudgetStatus(0)).toBe("safe");
    expect(getBudgetStatus(50)).toBe("safe");
    expect(getBudgetStatus(79)).toBe("safe");
  });

  it("should return 'warning' for progress between 80-99%", () => {
    expect(getBudgetStatus(80)).toBe("warning");
    expect(getBudgetStatus(90)).toBe("warning");
    expect(getBudgetStatus(99)).toBe("warning");
  });

  it("should return 'danger' for progress at or above 100%", () => {
    expect(getBudgetStatus(100)).toBe("danger");
    expect(getBudgetStatus(150)).toBe("danger");
  });
});

describe("calculateSavings", () => {
  it("should calculate savings correctly", () => {
    expect(calculateSavings(5000, 3000)).toBe(2000);
  });

  it("should return negative for overspending", () => {
    expect(calculateSavings(3000, 5000)).toBe(-2000);
  });

  it("should return 0 when income equals expenses", () => {
    expect(calculateSavings(1000, 1000)).toBe(0);
  });
});

describe("calculateSavingsRate", () => {
  it("should calculate savings rate correctly", () => {
    expect(calculateSavingsRate(5000, 4000)).toBe(20);
    expect(calculateSavingsRate(10000, 5000)).toBe(50);
  });

  it("should return 0 for zero income", () => {
    expect(calculateSavingsRate(0, 1000)).toBe(0);
  });

  it("should handle negative savings", () => {
    expect(calculateSavingsRate(1000, 1500)).toBe(-50);
  });
});
