import prisma from "@/lib/db";
import type { BudgetInput } from "@/lib/validators/budget";
import { Decimal } from "@prisma/client/runtime/library";
import { startOfMonth, endOfMonth } from "date-fns";

export async function getBudgetsByUser(userId: string, month: number, year: number) {
  const budgets = await prisma.budget.findMany({
    where: { userId, month, year },
    include: {
      category: true,
    },
    orderBy: { category: { name: "asc" } },
  });

  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(new Date(year, month - 1));

  const results = await Promise.all(
    budgets.map(async (budget) => {
      const spent = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: "EXPENSE",
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      });

      const spentAmount = spent._sum.amount?.toNumber() || 0;
      const budgetAmount = budget.amount.toNumber();
      const progress = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
      const remaining = budgetAmount - spentAmount;

      return {
        ...budget,
        spent: spentAmount,
        progress: Math.min(progress, 100),
        remaining,
      };
    })
  );

  return results;
}

export async function getBudgetById(userId: string, budgetId: string) {
  return prisma.budget.findFirst({
    where: { id: budgetId, userId },
    include: { category: true },
  });
}

export async function createBudget(userId: string, data: BudgetInput) {
  return prisma.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId,
        categoryId: data.categoryId,
        month: data.month,
        year: data.year,
      },
    },
    update: {
      amount: new Decimal(data.amount),
    },
    create: {
      userId,
      categoryId: data.categoryId,
      amount: new Decimal(data.amount),
      month: data.month,
      year: data.year,
    },
    include: { category: true },
  });
}

export async function updateBudget(
  userId: string,
  budgetId: string,
  data: Partial<BudgetInput>
) {
  return prisma.budget.updateMany({
    where: { id: budgetId, userId },
    data: {
      ...(data.categoryId && { categoryId: data.categoryId }),
      ...(data.amount !== undefined && { amount: new Decimal(data.amount) }),
      ...(data.month !== undefined && { month: data.month }),
      ...(data.year !== undefined && { year: data.year }),
    },
  });
}

export async function deleteBudget(userId: string, budgetId: string) {
  return prisma.budget.deleteMany({
    where: { id: budgetId, userId },
  });
}

export async function getBudgetAlerts(userId: string, month: number, year: number) {
  const budgets = await getBudgetsByUser(userId, month, year);
  return budgets.filter((b) => b.progress >= 80);
}

export async function copyBudgetsToNextMonth(
  userId: string,
  fromMonth: number,
  fromYear: number
) {
  const currentBudgets = await prisma.budget.findMany({
    where: { userId, month: fromMonth, year: fromYear },
  });

  let toMonth = fromMonth + 1;
  let toYear = fromYear;

  if (toMonth > 12) {
    toMonth = 1;
    toYear += 1;
  }

  const created = await Promise.all(
    currentBudgets.map((budget) =>
      prisma.budget.upsert({
        where: {
          userId_categoryId_month_year: {
            userId,
            categoryId: budget.categoryId,
            month: toMonth,
            year: toYear,
          },
        },
        update: {},
        create: {
          userId,
          categoryId: budget.categoryId,
          amount: budget.amount,
          month: toMonth,
          year: toYear,
        },
      })
    )
  );

  return created;
}
