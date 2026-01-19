"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { budgetSchema } from "@/lib/validators/budget";
import * as budgetService from "@/server/services/budget.service";

export async function getBudgetsAction(month: number, year: number) {
  const user = await requireAuth();
  return budgetService.getBudgetsByUser(user.id!, month, year);
}

export async function getBudgetByIdAction(budgetId: string) {
  const user = await requireAuth();
  return budgetService.getBudgetById(user.id!, budgetId);
}

export async function createBudgetAction(data: Record<string, unknown>) {
  const user = await requireAuth();
  const validatedData = budgetSchema.parse(data);
  const result = await budgetService.createBudget(user.id!, validatedData);
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return result;
}

export async function updateBudgetAction(
  budgetId: string,
  data: Record<string, unknown>
) {
  const user = await requireAuth();
  const validatedData = budgetSchema.partial().parse(data);
  const result = await budgetService.updateBudget(user.id!, budgetId, validatedData);
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return result;
}

export async function deleteBudgetAction(budgetId: string) {
  const user = await requireAuth();
  const result = await budgetService.deleteBudget(user.id!, budgetId);
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return result;
}

export async function getBudgetAlertsAction(month: number, year: number) {
  const user = await requireAuth();
  return budgetService.getBudgetAlerts(user.id!, month, year);
}

export async function copyBudgetsToNextMonthAction(month: number, year: number) {
  const user = await requireAuth();
  const result = await budgetService.copyBudgetsToNextMonth(user.id!, month, year);
  revalidatePath("/budgets");
  return result;
}
