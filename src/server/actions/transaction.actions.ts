"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { transactionSchema, transactionFilterSchema } from "@/lib/validators/transaction";
import * as transactionService from "@/server/services/transaction.service";

export async function getTransactionsAction(filters: Record<string, unknown>) {
  const user = await requireAuth();
  const validatedFilters = transactionFilterSchema.parse(filters);
  return transactionService.getTransactions(user.id!, validatedFilters);
}

export async function getTransactionByIdAction(transactionId: string) {
  const user = await requireAuth();
  return transactionService.getTransactionById(user.id!, transactionId);
}

export async function createTransactionAction(data: Record<string, unknown>) {
  const user = await requireAuth();
  const validatedData = transactionSchema.parse(data);
  const result = await transactionService.createTransaction(user.id!, validatedData);
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return result;
}

export async function updateTransactionAction(
  transactionId: string,
  data: Record<string, unknown>
) {
  const user = await requireAuth();
  const validatedData = transactionSchema.partial().parse(data);
  const result = await transactionService.updateTransaction(
    user.id!,
    transactionId,
    validatedData
  );
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return result;
}

export async function deleteTransactionAction(transactionId: string) {
  const user = await requireAuth();
  const result = await transactionService.deleteTransaction(user.id!, transactionId);
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return result;
}

export async function getMonthlyTotalsAction(month: number, year: number) {
  const user = await requireAuth();
  return transactionService.getMonthlyTotals(user.id!, month, year);
}

export async function getExpensesByCategoryAction(month: number, year: number) {
  const user = await requireAuth();
  return transactionService.getExpensesByCategory(user.id!, month, year);
}

export async function getMonthlyTrendAction(months: number = 6) {
  const user = await requireAuth();
  return transactionService.getMonthlyTrend(user.id!, months);
}

export async function getRecentTransactionsAction(limit: number = 5) {
  const user = await requireAuth();
  return transactionService.getRecentTransactions(user.id!, limit);
}
