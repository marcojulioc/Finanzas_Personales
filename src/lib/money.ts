export const DEFAULT_CURRENCY = "RD$";

interface DecimalLike {
  toNumber(): number;
}

function isDecimalLike(value: unknown): value is DecimalLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof (value as DecimalLike).toNumber === "function"
  );
}

export function formatMoney(
  amount: number | DecimalLike | string,
  currency: string = DEFAULT_CURRENCY
): string {
  const numericAmount =
    typeof amount === "string"
      ? parseFloat(amount)
      : isDecimalLike(amount)
        ? amount.toNumber()
        : amount;

  const formatted = new Intl.NumberFormat("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);

  return `${currency} ${formatted}`;
}

export function parseMoney(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function calculateBalance(
  initialBalance: number | DecimalLike,
  incomes: number | DecimalLike,
  expenses: number | DecimalLike
): number {
  const initial = isDecimalLike(initialBalance)
    ? initialBalance.toNumber()
    : initialBalance;
  const inc = isDecimalLike(incomes) ? incomes.toNumber() : incomes;
  const exp = isDecimalLike(expenses) ? expenses.toNumber() : expenses;

  return initial + inc - exp;
}

export function calculateCreditCardDebt(
  purchases: number | DecimalLike,
  payments: number | DecimalLike
): number {
  const purch = isDecimalLike(purchases) ? purchases.toNumber() : purchases;
  const pay = isDecimalLike(payments) ? payments.toNumber() : payments;

  return purch - pay;
}

export function calculateBudgetProgress(spent: number, budget: number): number {
  if (budget <= 0) return 0;
  return Math.min((spent / budget) * 100, 100);
}

export function getBudgetStatus(progress: number): "safe" | "warning" | "danger" {
  if (progress >= 100) return "danger";
  if (progress >= 80) return "warning";
  return "safe";
}

export function calculateSavings(income: number, expenses: number): number {
  return income - expenses;
}

export function calculateSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  const savings = calculateSavings(income, expenses);
  return (savings / income) * 100;
}
