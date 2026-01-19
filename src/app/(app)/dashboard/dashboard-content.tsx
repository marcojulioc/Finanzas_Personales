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
import type { Transaction, FinanceAccount, Category } from "@prisma/client";

interface AccountWithBalance extends FinanceAccount {
  currentBalance: number;
}

interface TransactionWithRelations extends Transaction {
  account: FinanceAccount;
  category: Category | null;
}

interface BudgetAlert {
  id: string;
  category: Category;
  spent: number;
  progress: number;
  amount: { toNumber: () => number };
}

interface CreditCardDebt {
  card: FinanceAccount;
  debt: number;
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
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);
  const [creditCardDebt, setCreditCardDebt] = useState<CreditCardDebt[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseByCategory[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const [
          accountsData,
          totals,
          transactions,
          alerts,
          debt,
          expenses,
        ] = await Promise.all([
          getAccountsWithBalancesAction(),
          getMonthlyTotalsAction(month, year),
          getRecentTransactionsAction(5),
          getBudgetAlertsAction(month, year),
          getCreditCardDebtAction(),
          getExpensesByCategoryAction(month, year),
        ]);

        setAccounts(accountsData);
        setMonthlyTotals(totals);
        setRecentTransactions(transactions);
        setBudgetAlerts(alerts);
        setCreditCardDebt(debt);
        setExpensesByCategory(expenses.slice(0, 5));
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tus finanzas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              En {accounts.filter((a) => a.type !== "CREDIT_CARD").length} cuentas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatMoney(monthlyTotals.income)}
            </div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos del Mes</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatMoney(monthlyTotals.expense)}
            </div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deuda TC</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalDebt)}</div>
            <p className="text-xs text-muted-foreground">
              En {creditCardDebt.length} tarjetas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Savings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ahorro del Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div
                className={`text-3xl font-bold ${
                  monthlyTotals.savings >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatMoney(monthlyTotals.savings)}
              </div>
              <p className="text-sm text-muted-foreground">
                Tasa de ahorro: {monthlyTotals.savingsRate.toFixed(1)}%
              </p>
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${
                monthlyTotals.savings >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {monthlyTotals.savings >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {Math.abs(monthlyTotals.savingsRate).toFixed(1)}%
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Movimientos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay movimientos recientes
                </p>
              ) : (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === "INCOME"
                            ? "bg-green-100 text-green-600"
                            : transaction.type === "EXPENSE"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {transaction.type === "INCOME" ? (
                          <ArrowUpRight className="h-5 w-5" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.description || transaction.category?.name || "Sin categoría"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.date)} · {transaction.account.name}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold ${
                        transaction.type === "INCOME"
                          ? "text-green-600"
                          : "text-red-600"
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expensesByCategory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay gastos este mes
                </p>
              ) : (
                expensesByCategory.map((expense, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{expense.category?.name || "Sin categoría"}</span>
                      <span className="font-medium">{formatMoney(expense.total)}</span>
                    </div>
                    <Progress value={expense.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                      {expense.percentage.toFixed(1)}% del total
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg text-orange-800">
              Alertas de Presupuesto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgetAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg"
                >
                  <div>
                    <p className="font-medium">{alert.category.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatMoney(alert.spent)} de {formatMoney(alert.amount.toNumber())}
                    </p>
                  </div>
                  <Badge
                    variant={alert.progress >= 100 ? "destructive" : "secondary"}
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
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-48" />
        </CardContent>
      </Card>
    </div>
  );
}
