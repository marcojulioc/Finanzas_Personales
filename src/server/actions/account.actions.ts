"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { createSafeAction } from "@/lib/safe-action";
import { accountSchema } from "@/lib/validators/account";
import * as accountService from "@/server/services/account.service";

export const getAccountsAction = createSafeAction(
  z.void(),
  async () => {
    const user = await requireAuth();
    return accountService.getAccountsByUser(user.id!);
  }
);

export const getAccountsWithBalancesAction = createSafeAction(
  z.void(),
  async () => {
    const user = await requireAuth();
    return accountService.getAccountsWithBalances(user.id!);
  }
);

export const getAccountByIdAction = createSafeAction(
  z.string(),
  async (accountId) => {
    const user = await requireAuth();
    return accountService.getAccountWithBalance(user.id!, accountId);
  }
);

export const createAccountAction = createSafeAction(
  accountSchema,
  async (data) => {
    const user = await requireAuth();
    const result = await accountService.createAccount(user.id!, data);
    revalidatePath("/settings");
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return result;
  }
);

export const updateAccountAction = createSafeAction(
  z.object({
    id: z.string(),
    data: accountSchema.partial(),
  }),
  async ({ id, data }) => {
    const user = await requireAuth();
    const result = await accountService.updateAccount(user.id!, id, data);
    revalidatePath("/settings");
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return result;
  }
);

export const deleteAccountAction = createSafeAction(
  z.string(),
  async (accountId) => {
    const user = await requireAuth();
    const result = await accountService.deleteAccount(user.id!, accountId);
    revalidatePath("/settings");
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return result;
  }
);

export const getCreditCardDebtAction = createSafeAction(
  z.void(),
  async () => {
    const user = await requireAuth();
    const debts = await accountService.getCreditCardDebt(user.id!);
    // Serializar dates para el cliente
    return debts.map((debt) => ({
      ...debt,
      nextCutoffDate: debt.nextCutoffDate?.toISOString() ?? null,
      nextPaymentDate: debt.nextPaymentDate?.toISOString() ?? null,
    }));
  }
);
