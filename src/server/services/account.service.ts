import prisma from "@/lib/db";
import type { AccountType } from "@prisma/client";
import type { AccountInput } from "@/lib/validators/account";
import { Decimal } from "@prisma/client/runtime/library";

export async function getAccountsByUser(userId: string) {
  const accounts = await prisma.financeAccount.findMany({
    where: { userId, isActive: true },
    orderBy: { name: "asc" },
  });

  return accounts.map((account) => ({
    ...account,
    initialBalance: account.initialBalance.toNumber(),
    creditLimit: account.creditLimit?.toNumber() ?? null,
  }));
}

export async function getAccountWithBalance(userId: string, accountId: string) {
  const account = await prisma.financeAccount.findFirst({
    where: { id: accountId, userId },
  });

  if (!account) return null;

  const transactions = await prisma.transaction.groupBy({
    by: ["type"],
    where: { userId, accountId },
    _sum: { amount: true },
  });

  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of transactions) {
    const amount = t._sum.amount?.toNumber() || 0;
    if (t.type === "INCOME") totalIncome = amount;
    if (t.type === "EXPENSE") totalExpense = amount;
    if (t.type === "ADJUSTMENT") totalIncome += amount;
  }

  const initialBalance = account.initialBalance.toNumber();
  const currentBalance = initialBalance + totalIncome - totalExpense;

  // Para tarjetas de crédito
  const creditLimit = account.creditLimit?.toNumber() ?? null;
  const creditAvailable =
    account.type === "CREDIT_CARD" && creditLimit
      ? creditLimit - Math.abs(currentBalance)
      : null;

  return {
    ...account,
    initialBalance,
    currentBalance,
    totalIncome,
    totalExpense,
    creditLimit,
    creditAvailable,
  };
}

export async function getAccountsWithBalances(userId: string) {
  const accounts = await prisma.financeAccount.findMany({
    where: { userId, isActive: true },
    orderBy: { name: "asc" },
  });

  const results = await Promise.all(
    accounts.map(async (account) => {
      const transactions = await prisma.transaction.groupBy({
        by: ["type"],
        where: { userId, accountId: account.id },
        _sum: { amount: true },
      });

      let totalIncome = 0;
      let totalExpense = 0;

      for (const t of transactions) {
        const amount = t._sum.amount?.toNumber() || 0;
        if (t.type === "INCOME") totalIncome = amount;
        if (t.type === "EXPENSE") totalExpense = amount;
        if (t.type === "ADJUSTMENT") totalIncome += amount;
      }

      const initialBalance = account.initialBalance.toNumber();
      const currentBalance = initialBalance + totalIncome - totalExpense;

      // Para tarjetas de crédito, calcular crédito disponible
      const creditLimit = account.creditLimit?.toNumber() ?? null;
      const creditAvailable =
        account.type === "CREDIT_CARD" && creditLimit
          ? creditLimit - Math.abs(currentBalance)
          : null;

      return {
        ...account,
        initialBalance,
        currentBalance,
        totalIncome,
        totalExpense,
        creditLimit,
        creditAvailable,
      };
    })
  );

  return results;
}

export async function createAccount(userId: string, data: AccountInput) {
  return prisma.financeAccount.create({
    data: {
      userId,
      name: data.name,
      type: data.type as AccountType,
      initialBalance: new Decimal(data.initialBalance || 0),
      color: data.color,
      icon: data.icon,
      // Campos de tarjeta de crédito
      creditLimit: data.creditLimit ? new Decimal(data.creditLimit) : null,
      cutoffDay: data.cutoffDay ?? null,
      paymentDueDay: data.paymentDueDay ?? null,
    },
  });
}

export async function updateAccount(
  userId: string,
  accountId: string,
  data: Partial<AccountInput>
) {
  return prisma.financeAccount.updateMany({
    where: { id: accountId, userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.type && { type: data.type as AccountType }),
      ...(data.initialBalance !== undefined && {
        initialBalance: new Decimal(data.initialBalance),
      }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.icon !== undefined && { icon: data.icon }),
      // Campos de tarjeta de crédito
      ...(data.creditLimit !== undefined && {
        creditLimit: data.creditLimit ? new Decimal(data.creditLimit) : null,
      }),
      ...(data.cutoffDay !== undefined && { cutoffDay: data.cutoffDay }),
      ...(data.paymentDueDay !== undefined && {
        paymentDueDay: data.paymentDueDay,
      }),
    },
  });
}

export async function deleteAccount(userId: string, accountId: string) {
  return prisma.financeAccount.updateMany({
    where: { id: accountId, userId },
    data: { isActive: false },
  });
}

export async function getCreditCardDebt(userId: string) {
  const creditCards = await prisma.financeAccount.findMany({
    where: { userId, type: "CREDIT_CARD", isActive: true },
  });

  const debts = await Promise.all(
    creditCards.map(async (card) => {
      const transactions = await prisma.transaction.groupBy({
        by: ["type"],
        where: { userId, accountId: card.id },
        _sum: { amount: true },
      });

      let purchases = 0;
      let payments = 0;

      for (const t of transactions) {
        const amount = t._sum.amount?.toNumber() || 0;
        if (t.type === "EXPENSE") purchases = amount;
        if (t.type === "INCOME") payments = amount;
      }

      const creditLimit = card.creditLimit?.toNumber() ?? 0;
      const debt = purchases - payments;
      const creditAvailable = creditLimit - debt;

      // Calcular próximas fechas de corte y pago
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const currentDay = today.getDate();

      let nextCutoffDate: Date | null = null;
      let nextPaymentDate: Date | null = null;

      if (card.cutoffDay) {
        const cutoffThisMonth = new Date(currentYear, currentMonth, card.cutoffDay);
        nextCutoffDate =
          currentDay <= card.cutoffDay
            ? cutoffThisMonth
            : new Date(currentYear, currentMonth + 1, card.cutoffDay);
      }

      if (card.paymentDueDay) {
        const paymentThisMonth = new Date(
          currentYear,
          currentMonth,
          card.paymentDueDay
        );
        nextPaymentDate =
          currentDay <= card.paymentDueDay
            ? paymentThisMonth
            : new Date(currentYear, currentMonth + 1, card.paymentDueDay);
      }

      return {
        card: {
          ...card,
          initialBalance: card.initialBalance.toNumber(),
          creditLimit,
        },
        debt,
        creditAvailable,
        purchases,
        payments,
        cutoffDay: card.cutoffDay,
        paymentDueDay: card.paymentDueDay,
        nextCutoffDate,
        nextPaymentDate,
      };
    })
  );

  return debts;
}
