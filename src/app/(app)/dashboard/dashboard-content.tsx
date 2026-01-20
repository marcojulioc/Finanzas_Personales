"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
} from "lucide-react";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import {
  getAccountsWithBalancesAction,
  getCreditCardDebtAction,
} from "@/server/actions/account.actions";
import {
  getMonthlyTotalsAction,
  getRecentTransactionsAction,
  getExpensesByCategoryAction,
} from "@/server/actions/transaction.actions";
import { getBudgetAlertsAction } from "@/server/actions/budget.actions";
import type { Category } from "@prisma/client";
import type {
  AccountWithBalance,
  TransactionWithRelations,
  BudgetWithProgress,
  SerializedAccount,
} from "@/types";

interface CreditCardDebt {
  card: SerializedAccount & { creditLimit: number };
  debt: number;
  creditAvailable: number;
  purchases: number;
  payments: number;
  cutoffDay: number | null;
  paymentDueDay: number | null;
  nextCutoffDate: string | null;
  nextPaymentDate: string | null;
}

interface ExpenseByCategory {
  category: Category | undefined;
  total: number;
  percentage: number;
}

export function DashboardContent() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState({
    income: 0,
    expense: 0,
    savings: 0,
    savingsRate: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<TransactionWithRelations[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetWithProgress[]>([]);
  const [creditCardDebt, setCreditCardDebt] = useState<CreditCardDebt[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseByCategory[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const [
          accountsResult,
          totalsResult,
          transactionsResult,
          alertsResult,
          debtResult,
          expensesResult,
        ] = await Promise.all([
          getAccountsWithBalancesAction(undefined),
          getMonthlyTotalsAction({ month, year }),
          getRecentTransactionsAction(5),
          getBudgetAlertsAction({ month, year }),
          getCreditCardDebtAction(undefined),
          getExpensesByCategoryAction({ month, year }),
        ]);

        if (accountsResult.success && accountsResult.data) setAccounts(accountsResult.data);
        if (totalsResult.success && totalsResult.data) setMonthlyTotals(totalsResult.data);
        if (transactionsResult.success && transactionsResult.data) setRecentTransactions(transactionsResult.data);
        if (alertsResult.success && alertsResult.data) setBudgetAlerts(alertsResult.data);
        if (debtResult.success && debtResult.data) setCreditCardDebt(debtResult.data);
        if (expensesResult.success && expensesResult.data) setExpensesByCategory(expensesResult.data.slice(0, 5));
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => {
    if (acc.type === "CREDIT_CARD") return sum;
    return sum + acc.currentBalance;
  }, 0);

  const totalDebt = creditCardDebt.reduce((sum, card) => sum + card.debt, 0);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards - New Design */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Balance Total */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="stat-icon-purple w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Balance Total
                </p>
                <p className="text-xl font-bold mt-1 truncate">
                  {formatMoney(totalBalance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingresos */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="stat-icon-green w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Ingresos
                </p>
                <p className="text-xl font-bold mt-1 text-emerald-600 truncate">
                  {formatMoney(monthlyTotals.income)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gastos */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="stat-icon-orange w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                <TrendingDown className="w-6 h-6 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Gastos
                </p>
                <p className="text-xl font-bold mt-1 text-orange-600 truncate">
                  {formatMoney(monthlyTotals.expense)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ahorro */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="stat-icon-blue w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                <PiggyBank className="w-6 h-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Ahorro
                </p>
                <p
                  className={`text-xl font-bold mt-1 truncate ${monthlyTotals.savings >= 0 ? "text-emerald-600" : "text-red-500"
                    }`}
                >
                  {formatMoney(monthlyTotals.savings)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Card Section - Show if there are credit cards */}
      {creditCardDebt.length > 0 && (
        <div className="space-y-4">
          {/* Total Debt Summary */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300 mb-1">
                    Deuda Total en Tarjetas
                  </p>
                  <p className="text-3xl font-bold">{formatMoney(totalDebt)}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {creditCardDebt.length} tarjeta{creditCardDebt.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-white/80" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Credit Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {creditCardDebt.map((card) => {
              const usagePercent = card.card.creditLimit > 0
                ? Math.min((card.debt / card.card.creditLimit) * 100, 100)
                : 0;
              const usageColor = usagePercent >= 80
                ? "bg-red-500"
                : usagePercent >= 50
                  ? "bg-orange-500"
                  : "bg-emerald-500";

              const formatCardDate = (dateStr: string | null) => {
                if (!dateStr) return null;
                const date = new Date(dateStr);
                return date.toLocaleDateString("es-DO", {
                  day: "numeric",
                  month: "short",
                });
              };

              const getDaysUntil = (dateStr: string | null) => {
                if (!dateStr) return null;
                const date = new Date(dateStr);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return diff;
              };

              const cutoffDays = getDaysUntil(card.nextCutoffDate);
              const paymentDays = getDaysUntil(card.nextPaymentDate);

              return (
                <Card key={card.card.id} className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      {/* Card Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{card.card.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Límite: {formatMoney(card.card.creditLimit)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Usage Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Utilizado</span>
                          <span className="font-semibold">{usagePercent.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${usageColor}`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Amounts */}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Deuda</p>
                          <p className="font-semibold text-red-600">{formatMoney(card.debt)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Disponible</p>
                          <p className="font-semibold text-emerald-600">
                            {formatMoney(card.creditAvailable)}
                          </p>
                        </div>
                      </div>

                      {/* Dates */}
                      {(card.cutoffDay || card.paymentDueDay) && (
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                          {card.cutoffDay && (
                            <div>
                              <p className="text-xs text-muted-foreground">Fecha de corte</p>
                              <p className="font-medium text-sm">
                                {formatCardDate(card.nextCutoffDate)}
                                {cutoffDays !== null && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    ({cutoffDays === 0 ? "Hoy" : cutoffDays === 1 ? "Mañana" : `${cutoffDays} días`})
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                          {card.paymentDueDay && (
                            <div>
                              <p className="text-xs text-muted-foreground">Fecha de pago</p>
                              <p className="font-medium text-sm">
                                {formatCardDate(card.nextPaymentDate)}
                                {paymentDays !== null && (
                                  <span className={`text-xs ml-1 ${paymentDays <= 3 ? "text-orange-600 font-semibold" : "text-muted-foreground"}`}>
                                    ({paymentDays === 0 ? "Hoy" : paymentDays === 1 ? "Mañana" : `${paymentDays} días`})
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Movimientos Recientes
              </CardTitle>
              <a
                href="/transactions"
                className="text-sm font-medium text-primary hover:underline"
              >
                Ver Todo
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-2xl stat-icon-purple mx-auto mb-3 flex items-center justify-center">
                    <ArrowUpRight className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No hay movimientos recientes
                  </p>
                </div>
              ) : (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${transaction.type === "INCOME"
                            ? "stat-icon-green"
                            : transaction.type === "EXPENSE"
                              ? "stat-icon-orange"
                              : "stat-icon-blue"
                          }`}
                      >
                        {transaction.type === "INCOME" ? (
                          <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <ArrowDownRight
                            className={`h-5 w-5 ${transaction.type === "EXPENSE"
                                ? "text-orange-600"
                                : "text-blue-600"
                              }`}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.description ||
                            transaction.category?.name ||
                            "Sin categoría"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.date)} · {transaction.account.name}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold text-sm ${transaction.type === "INCOME"
                          ? "text-emerald-600"
                          : "text-foreground"
                        }`}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatMoney(transaction.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Expenses by Category */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              Gastos por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {expensesByCategory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-2xl stat-icon-orange mx-auto mb-3 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No hay gastos este mes
                  </p>
                </div>
              ) : (
                expensesByCategory.map((expense, index) => {
                  const colors = [
                    "bg-pink-500",
                    "bg-emerald-500",
                    "bg-orange-500",
                    "bg-purple-500",
                    "bg-blue-500",
                  ];
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${colors[index % colors.length]}`}
                          />
                          <span className="text-sm font-medium">
                            {expense.category?.name || "Sin categoría"}
                          </span>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatMoney(expense.total)}
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${colors[index % colors.length]}`}
                          style={{ width: `${expense.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <Card className="border-0 shadow-sm border-l-4 border-l-orange-500 bg-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-orange-800 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              Alertas de Presupuesto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgetAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-sm">{alert.category.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatMoney(alert.spent)} de {formatMoney(alert.amount)}
                    </p>
                  </div>
                  <Badge
                    className={`${alert.progress >= 100
                        ? "bg-red-100 text-red-700 hover:bg-red-100"
                        : "bg-orange-100 text-orange-700 hover:bg-orange-100"
                      } font-semibold`}
                  >
                    {alert.progress.toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-28" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
