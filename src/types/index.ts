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

export interface CategoryWithSubcategories extends Category {
  subcategories: Category[];
}

export interface TransactionWithRelations extends Transaction {
  account: FinanceAccount;
  category: Category | null;
}

export interface AccountWithBalance extends FinanceAccount {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export interface BudgetWithProgress extends Budget {
  category: Category;
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
