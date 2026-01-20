"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { createSafeAction } from "@/lib/safe-action";
import { transactionSchema, transactionFilterSchema } from "@/lib/validators/transaction";
import * as transactionService from "@/server/services/transaction.service";

export const getTransactionsAction = createSafeAction(
  transactionFilterSchema,
  async (filters) => {
    const user = await requireAuth();
    return transactionService.getTransactions(user.id!, filters);
  }
);

export const getTransactionByIdAction = createSafeAction(
  z.string(),
  async (transactionId) => {
    const user = await requireAuth();
    return transactionService.getTransactionById(user.id!, transactionId);
  }
);

export const createTransactionAction = createSafeAction(
  transactionSchema,
  async (data) => {
    const user = await requireAuth();
    const result = await transactionService.createTransaction(user.id!, data);
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return result;
  }
);

export const updateTransactionAction = createSafeAction(
  z.object({
    id: z.string(),
    data: transactionSchema.partial(),
  }),
  async ({ id, data }) => {
    const user = await requireAuth();
    const result = await transactionService.updateTransaction(user.id!, id, data);
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return result;
  }
);

export const deleteTransactionAction = createSafeAction(
  z.string(),
  async (transactionId) => {
    const user = await requireAuth();
    const result = await transactionService.deleteTransaction(user.id!, transactionId);
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return result;
  }
);

const monthlyTotalsSchema = z.object({
  month: z.number(),
  year: z.number(),
});

export const getMonthlyTotalsAction = createSafeAction(
  monthlyTotalsSchema,
  async ({ month, year }) => {
    const user = await requireAuth();
    return transactionService.getMonthlyTotals(user.id!, month, year);
  }
);

export const getExpensesByCategoryAction = createSafeAction(
  monthlyTotalsSchema,
  async ({ month, year }) => {
    const user = await requireAuth();
    return transactionService.getExpensesByCategory(user.id!, month, year);
  }
);

export const getMonthlyTrendAction = createSafeAction(
  z.number().default(6),
  async (months) => {
    const user = await requireAuth();
    return transactionService.getMonthlyTrend(user.id!, months);
  }
);

export const getRecentTransactionsAction = createSafeAction(
  z.number().default(5),
  async (limit) => {
    const user = await requireAuth();
    return transactionService.getRecentTransactions(user.id!, limit);
  }
);
