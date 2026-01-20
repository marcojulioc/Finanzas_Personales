"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { budgetSchema, type BudgetInput } from "@/lib/validators/budget";
import {
  createBudgetAction,
  updateBudgetAction,
} from "@/server/actions/budget.actions";
import type { Category } from "@prisma/client";
import type { SerializedBudget } from "@/types";

interface BudgetWithCategory extends SerializedBudget {}

interface BudgetFormProps {
  open: boolean;
  onClose: () => void;
  budget: BudgetWithCategory | null;
  categories: Category[];
  month: number;
  year: number;
}

export function BudgetForm({
  open,
  onClose,
  budget,
  categories,
  month,
  year,
}: BudgetFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      month,
      year,
    },
  });

  useEffect(() => {
    if (budget) {
      reset({
        categoryId: budget.categoryId,
        amount: budget.amount,
        month: budget.month,
        year: budget.year,
      });
    } else {
      reset({
        categoryId: "",
        amount: 0,
        month,
        year,
      });
    }
  }, [budget, month, year, reset]);

  const onSubmit = async (data: BudgetInput) => {
    setIsLoading(true);
    try {
      let result;
      if (budget) {
        result = await updateBudgetAction({ id: budget.id, data });
        if (result.success) {
          toast.success("Presupuesto actualizado");
          onClose();
        } else {
          toast.error(result.error || "Error al actualizar el presupuesto");
        }
      } else {
        result = await createBudgetAction(data);
        if (result.success) {
          toast.success("Presupuesto creado");
          onClose();
        } else {
          toast.error(result.error || "Error al crear el presupuesto");
        }
      }
    } catch (error) {
      toast.error("Error al guardar el presupuesto");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const usedCategoryIds = new Set();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-auto">
        <SheetHeader>
          <SheetTitle>
            {budget ? "Editar Presupuesto" : "Nuevo Presupuesto"}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-6">
          {/* Category */}
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select
              value={watch("categoryId")}
              onValueChange={(value) => setValue("categoryId", value)}
              disabled={!!budget}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((cat) => !usedCategoryIds.has(cat.id) || cat.id === budget?.categoryId)
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto del Presupuesto</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              className="text-xl h-14 text-center font-bold"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <input type="hidden" {...register("month", { valueAsNumber: true })} />
          <input type="hidden" {...register("year", { valueAsNumber: true })} />
        </form>

        <SheetFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : budget ? (
              "Actualizar"
            ) : (
              "Guardar"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
