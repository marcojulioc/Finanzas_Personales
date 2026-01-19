"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Copy,
  Pencil,
  Trash2,
} from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { formatMoney } from "@/lib/money";
import {
  getBudgetsAction,
  deleteBudgetAction,
  copyBudgetsToNextMonthAction,
} from "@/server/actions/budget.actions";
import { getCategoriesByTypeAction } from "@/server/actions/category.actions";
import { BudgetForm } from "./budget-form";
import type { Category } from "@prisma/client";
import type { BudgetWithProgress } from "@/types";

export function BudgetsContent() {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<BudgetWithProgress[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithProgress | null>(null);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const [budgetsData, categoriesData] = await Promise.all([
        getBudgetsAction(month, year),
        getCategoriesByTypeAction("EXPENSE"),
      ]);
      setBudgets(budgetsData);
      setCategories(categoriesData.flatMap((c) => [c, ...c.subcategories]));
    } catch (error) {
      console.error("Error loading budgets:", error);
      toast.error("Error al cargar presupuestos");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const handleEdit = (budget: BudgetWithProgress) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleDelete = async (budgetId: string) => {
    if (!confirm("¿Estás seguro de eliminar este presupuesto?")) return;

    try {
      await deleteBudgetAction(budgetId);
      toast.success("Presupuesto eliminado");
      loadBudgets();
    } catch (error) {
      toast.error("Error al eliminar presupuesto");
      console.error(error);
    }
  };

  const handleCopyToNextMonth = async () => {
    try {
      await copyBudgetsToNextMonthAction(month, year);
      toast.success("Presupuestos copiados al próximo mes");
    } catch (error) {
      toast.error("Error al copiar presupuestos");
      console.error(error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBudget(null);
    loadBudgets();
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-red-500";
    if (progress >= 80) return "bg-orange-500";
    return "bg-green-500";
  };

  const getBadgeVariant = (progress: number): "default" | "secondary" | "destructive" => {
    if (progress >= 100) return "destructive";
    if (progress >= 80) return "secondary";
    return "default";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Presupuestos</h1>
          <p className="text-muted-foreground">
            Controla tus gastos mensuales
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo</span>
        </Button>
      </div>

      {/* Month Selector */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-medium capitalize">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen del Mes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Gastado</span>
            <span className="font-medium">{formatMoney(totalSpent)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Presupuestado</span>
            <span className="font-medium">{formatMoney(totalBudget)}</span>
          </div>
          <Progress
            value={Math.min(overallProgress, 100)}
            className={`h-3 ${getProgressColor(overallProgress)}`}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{overallProgress.toFixed(1)}% utilizado</span>
            <span>
              {formatMoney(totalBudget - totalSpent)} disponible
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Copy Budgets Button */}
      {budgets.length > 0 && (
        <Button
          variant="outline"
          onClick={handleCopyToNextMonth}
          className="w-full gap-2"
        >
          <Copy className="h-4 w-4" />
          Copiar presupuestos al próximo mes
        </Button>
      )}

      {/* Budgets List */}
      {loading ? (
        <BudgetsSkeleton />
      ) : budgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No hay presupuestos para este mes
            </p>
            <Button onClick={() => setShowForm(true)}>
              Crear primer presupuesto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {budgets.map((budget) => (
            <Card key={budget.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: budget.category.color || "#6366f1" }}
                    />
                    <span className="font-medium">{budget.category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getBadgeVariant(budget.progress)}>
                      {budget.progress.toFixed(0)}%
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(budget)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Progress
                  value={Math.min(budget.progress, 100)}
                  className={`h-2 ${getProgressColor(budget.progress)}`}
                />

                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>{formatMoney(budget.spent)} gastado</span>
                  <span>de {formatMoney(budget.amount)}</span>
                </div>

                {budget.remaining < 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    Excedido por {formatMoney(Math.abs(budget.remaining))}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Budget Form */}
      <BudgetForm
        open={showForm}
        onClose={handleFormClose}
        budget={editingBudget}
        categories={categories}
        month={month}
        year={year}
      />
    </div>
  );
}

function BudgetsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
            <div className="flex justify-between mt-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
