"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { accountSchema } from "@/lib/validators/account";
import * as accountService from "@/server/services/account.service";

export async function getAccountsAction() {
  const user = await requireAuth();
  return accountService.getAccountsByUser(user.id!);
}

export async function getAccountsWithBalancesAction() {
  const user = await requireAuth();
  return accountService.getAccountsWithBalances(user.id!);
}

export async function getAccountByIdAction(accountId: string) {
  const user = await requireAuth();
  return accountService.getAccountWithBalance(user.id!, accountId);
}

export async function createAccountAction(data: Record<string, unknown>) {
  const user = await requireAuth();
  const validatedData = accountSchema.parse(data);
  const result = await accountService.createAccount(user.id!, validatedData);
  revalidatePath("/settings");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return result;
}

export async function updateAccountAction(
  accountId: string,
  data: Record<string, unknown>
) {
  const user = await requireAuth();
  const validatedData = accountSchema.partial().parse(data);
  const result = await accountService.updateAccount(user.id!, accountId, validatedData);
  revalidatePath("/settings");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return result;
}

export async function deleteAccountAction(accountId: string) {
  const user = await requireAuth();
  const result = await accountService.deleteAccount(user.id!, accountId);
  revalidatePath("/settings");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return result;
}

export async function getCreditCardDebtAction() {
  const user = await requireAuth();
  return accountService.getCreditCardDebt(user.id!);
}
