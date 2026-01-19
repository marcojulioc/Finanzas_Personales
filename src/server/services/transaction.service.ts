import prisma from "@/lib/db";
import type { TransactionType, PaymentMethod } from "@prisma/client";
import type { TransactionInput, TransactionFilterInput } from "@/lib/validators/transaction";
import { Decimal } from "@prisma/client/runtime/library";
import { startOfMonth, endOfMonth } from "date-fns";

export async function getTransactions(userId: string, filters: TransactionFilterInput) {
  const { page, limit, accountId, categoryId, type, startDate, endDate, search } = filters;

  const where = {
    userId,
    ...(accountId && { accountId }),
    ...(categoryId && { categoryId }),
    ...(type && { type }),
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        }
      : {}),
    ...(search && {
      OR: [
        { description: { contains: search, mode: "insensitive" as const } },
        { notes: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        account: true,
        category: true,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    data: transactions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getTransactionById(userId: string, transactionId: string) {
  return prisma.transaction.findFirst({
    where: { id: transactionId, userId },
    include: {
      account: true,
      category: true,
    },
  });
}

export async function createTransaction(userId: string, data: TransactionInput) {
  return prisma.transaction.create({
    data: {
      userId,
      accountId: data.accountId,
      categoryId: data.categoryId || null,
      type: data.type as TransactionType,
      amount: new Decimal(data.amount),
      date: data.date,
      description: data.description,
      paymentMethod: data.paymentMethod as PaymentMethod,
      notes: data.notes,
    },
    include: {
      account: true,
      category: true,
    },
  });
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  data: Partial<TransactionInput>
) {
  return prisma.transaction.updateMany({
    where: { id: transactionId, userId },
    data: {
      ...(data.accountId && { accountId: data.accountId }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.type && { type: data.type as TransactionType }),
      ...(data.amount !== undefined && { amount: new Decimal(data.amount) }),
      ...(data.date && { date: data.date }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.paymentMethod && { paymentMethod: data.paymentMethod as PaymentMethod }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });
}

export async function deleteTransaction(userId: string, transactionId: string) {
  return prisma.transaction.deleteMany({
    where: { id: transactionId, userId },
  });
}

export async function getMonthlyTotals(
  userId: string,
  month: number,
  year: number
) {
  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(new Date(year, month - 1));

  const totals = await prisma.transaction.groupBy({
    by: ["type"],
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });

  let income = 0;
  let expense = 0;

  for (const t of totals) {
    const amount = t._sum.amount?.toNumber() || 0;
    if (t.type === "INCOME") income = amount;
    if (t.type === "EXPENSE") expense = amount;
    if (t.type === "ADJUSTMENT") income += amount;
  }

  return {
    income,
    expense,
    savings: income - expense,
    savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0,
  };
}

export async function getExpensesByCategory(
  userId: string,
  month: number,
  year: number
) {
  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(new Date(year, month - 1));

  const expenses = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });

  const categoryIds = expenses
    .filter((e) => e.categoryId)
    .map((e) => e.categoryId!);

  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const totalExpense = expenses.reduce(
    (sum, e) => sum + (e._sum.amount?.toNumber() || 0),
    0
  );

  return expenses
    .filter((e) => e.categoryId)
    .map((e) => ({
      category: categoryMap.get(e.categoryId!),
      total: e._sum.amount?.toNumber() || 0,
      percentage: totalExpense > 0
        ? ((e._sum.amount?.toNumber() || 0) / totalExpense) * 100
        : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export async function getMonthlyTrend(userId: string, months: number = 6) {
  const results = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const totals = await getMonthlyTotals(userId, month, year);
    results.push({
      month,
      year,
      ...totals,
    });
  }

  return results;
}

export async function getRecentTransactions(userId: string, limit: number = 5) {
  return prisma.transaction.findMany({
    where: { userId },
    include: {
      account: true,
      category: true,
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}
