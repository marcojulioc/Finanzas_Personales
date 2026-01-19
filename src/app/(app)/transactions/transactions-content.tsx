"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { getTransactionsAction } from "@/server/actions/transaction.actions";
import { getAccountsAction } from "@/server/actions/account.actions";
import { getCategoriesAction } from "@/server/actions/category.actions";
import { TransactionForm } from "./transaction-form";
import type { Category } from "@prisma/client";
import type {
  TransactionWithRelations,
  SerializedAccount,
  CategoryWithSubcategories,
} from "@/types";

export function TransactionsContent() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionWithRelations[]>([]);
  const [accounts, setAccounts] = useState<SerializedAccount[]>([]);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithRelations | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    accountId: "",
    categoryId: "",
    type: "",
  });

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getTransactionsAction({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.accountId && { accountId: filters.accountId }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.type && { type: filters.type }),
      });

      setTransactions(result.data);
      setPagination((prev) => ({
        ...prev,
        total: result.total,
        totalPages: result.totalPages,
      }));
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [accountsData, categoriesData] = await Promise.all([
          getAccountsAction(),
          getCategoriesAction(),
        ]);
        setAccounts(accountsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleEdit = (transaction: TransactionWithRelations) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTransaction(null);
    loadTransactions();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Movimientos</h1>
          <p className="text-muted-foreground">
            {pagination.total} transacciones
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.accountId || "all"}
              onValueChange={(value) => handleFilterChange("accountId", value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las cuentas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las cuentas</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.type || "all"}
              onValueChange={(value) => handleFilterChange("type", value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="INCOME">Ingresos</SelectItem>
                <SelectItem value="EXPENSE">Gastos</SelectItem>
                <SelectItem value="ADJUSTMENT">Ajustes</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setFilters({ search: "", accountId: "", categoryId: "", type: "" });
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      {loading ? (
        <TransactionsSkeleton />
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No hay transacciones</p>
            <Button onClick={() => setShowForm(true)}>
              Agregar primera transacción
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {transactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleEdit(transaction)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
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
                        <p className="font-medium">
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
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Fecha</th>
                    <th className="text-left p-4 font-medium">Descripción</th>
                    <th className="text-left p-4 font-medium">Categoría</th>
                    <th className="text-left p-4 font-medium">Cuenta</th>
                    <th className="text-right p-4 font-medium">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b last:border-0 hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => handleEdit(transaction)}
                    >
                      <td className="p-4">{formatDate(transaction.date)}</td>
                      <td className="p-4">
                        {transaction.description || "Sin descripción"}
                      </td>
                      <td className="p-4">
                        {transaction.category?.name || "Sin categoría"}
                      </td>
                      <td className="p-4">{transaction.account.name}</td>
                      <td
                        className={`p-4 text-right font-medium ${
                          transaction.type === "INCOME"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}
                        {formatMoney(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Transaction Form Dialog */}
      <TransactionForm
        open={showForm}
        onClose={handleFormClose}
        transaction={editingTransaction}
        accounts={accounts}
        categories={categories}
      />
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
