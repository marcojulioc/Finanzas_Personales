import type {
  User,
  FinanceAccount,
  Category,
  Transaction,
  Budget,
  ImportJob,
} from "@prisma/client";

export type {
  User,
  FinanceAccount,
  Category,
  Transaction,
  Budget,
  ImportJob,
};

export type AccountType = "CASH" | "BANK" | "CREDIT_CARD";
export type TransactionType = "INCOME" | "EXPENSE" | "ADJUSTMENT";
export type PaymentMethod = "CASH" | "TRANSFER" | "CARD" | "CHECK" | "OTHER";
export type CategoryType = "INCOME" | "EXPENSE";
export type ImportStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

// Serialized types (Decimal -> number) for client components
export interface SerializedAccount
  extends Omit<FinanceAccount, "initialBalance" | "creditLimit"> {
  initialBalance: number;
  creditLimit: number | null;
}

export interface SerializedTransaction extends Omit<Transaction, "amount"> {
  amount: number;
  account: SerializedAccount;
  category: Category | null;
}

export interface SerializedBudget extends Omit<Budget, "amount"> {
  amount: number;
  category: Category;
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Category[];
}

export interface TransactionWithRelations extends SerializedTransaction {}

export interface AccountWithBalance extends SerializedAccount {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  creditAvailable: number | null;
}

export interface BudgetWithProgress extends SerializedBudget {
  spent: number;
  progress: number;
  remaining: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  savings: number;
  savingsRate: number;
  topExpenseCategories: {
    category: Category;
    total: number;
    percentage: number;
  }[];
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySavings: number;
  creditCardDebt: number;
  budgetAlerts: BudgetWithProgress[];
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  dateRange?: DateRange;
  search?: string;
}
