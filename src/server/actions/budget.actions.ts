"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { createSafeAction } from "@/lib/safe-action";
import { budgetSchema } from "@/lib/validators/budget";
import * as budgetService from "@/server/services/budget.service";

const monthYearSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

export const getBudgetsAction = createSafeAction(
  monthYearSchema,
  async ({ month, year }) => {
    const user = await requireAuth();
    return budgetService.getBudgetsByUser(user.id!, month, year);
  }
);

export const getBudgetByIdAction = createSafeAction(
  z.string(),
  async (budgetId) => {
    const user = await requireAuth();
    return budgetService.getBudgetById(user.id!, budgetId);
  }
);

export const createBudgetAction = createSafeAction(
  budgetSchema,
  async (data) => {
    const user = await requireAuth();
    const result = await budgetService.createBudget(user.id!, data);
    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    return result;
  }
);

export const updateBudgetAction = createSafeAction(
  z.object({
    id: z.string(),
    data: budgetSchema.partial(),
  }),
  async ({ id, data }) => {
    const user = await requireAuth();
    const result = await budgetService.updateBudget(user.id!, id, data);
    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    return result;
  }
);

export const deleteBudgetAction = createSafeAction(
  z.string(),
  async (budgetId) => {
    const user = await requireAuth();
    const result = await budgetService.deleteBudget(user.id!, budgetId);
    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    return result;
  }
);

export const getBudgetAlertsAction = createSafeAction(
  monthYearSchema,
  async ({ month, year }) => {
    const user = await requireAuth();
    return budgetService.getBudgetAlerts(user.id!, month, year);
  }
);

export const copyBudgetsToNextMonthAction = createSafeAction(
  monthYearSchema,
  async ({ month, year }) => {
    const user = await requireAuth();
    const result = await budgetService.copyBudgetsToNextMonth(user.id!, month, year);
    revalidatePath("/budgets");
    return result;
  }
);
