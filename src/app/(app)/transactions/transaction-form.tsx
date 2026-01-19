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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { transactionSchema, type TransactionInput } from "@/lib/validators/transaction";
import {
  createTransactionAction,
  updateTransactionAction,
  deleteTransactionAction,
} from "@/server/actions/transaction.actions";
import type { Category } from "@prisma/client";
import type {
  TransactionWithRelations,
  SerializedAccount,
  CategoryWithSubcategories,
} from "@/types";

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  transaction: TransactionWithRelations | null;
  accounts: SerializedAccount[];
  categories: CategoryWithSubcategories[];
}

export function TransactionForm({
  open,
  onClose,
  transaction,
  accounts,
  categories,
}: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [transactionType, setTransactionType] = useState<"INCOME" | "EXPENSE" | "ADJUSTMENT">(
    transaction?.type || "EXPENSE"
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      paymentMethod: "CASH",
      date: new Date(),
    },
  });

  const selectedDate = watch("date");
  const selectedCategoryId = watch("categoryId");

  useEffect(() => {
    if (transaction) {
      setTransactionType(transaction.type);
      reset({
        accountId: transaction.accountId,
        categoryId: transaction.categoryId || undefined,
        type: transaction.type,
        amount: Number(transaction.amount),
        date: new Date(transaction.date),
        description: transaction.description || "",
        paymentMethod: transaction.paymentMethod,
        notes: transaction.notes || "",
      });
    } else {
      setTransactionType("EXPENSE");
      reset({
        type: "EXPENSE",
        paymentMethod: "CASH",
        date: new Date(),
        accountId: accounts[0]?.id || "",
      });
    }
  }, [transaction, accounts, reset]);

  const filteredCategories = categories.filter((cat) => {
    if (transactionType === "INCOME") return cat.type === "INCOME";
    if (transactionType === "EXPENSE") return cat.type === "EXPENSE";
    return true;
  });

  const allCategories = filteredCategories.flatMap((cat) => [
    cat,
    ...cat.subcategories,
  ]);

  const onSubmit = async (data: TransactionInput) => {
    setIsLoading(true);
    try {
      if (transaction) {
        await updateTransactionAction(transaction.id, data);
        toast.success("Transacción actualizada");
      } else {
        await createTransactionAction(data);
        toast.success("Transacción creada");
      }
      onClose();
    } catch (error) {
      toast.error("Error al guardar la transacción");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;

    if (!confirm("¿Estás seguro de eliminar esta transacción?")) return;

    setIsDeleting(true);
    try {
      await deleteTransactionAction(transaction.id);
      toast.success("Transacción eliminada");
      onClose();
    } catch (error) {
      toast.error("Error al eliminar la transacción");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTypeChange = (type: "INCOME" | "EXPENSE" | "ADJUSTMENT") => {
    setTransactionType(type);
    setValue("type", type);
    setValue("categoryId", undefined);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {transaction ? "Editar Transacción" : "Nueva Transacción"}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-6">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Tabs
              value={transactionType}
              onValueChange={(v) =>
                handleTypeChange(v as "INCOME" | "EXPENSE" | "ADJUSTMENT")
              }
            >
              <TabsList className="w-full">
                <TabsTrigger value="EXPENSE" className="flex-1">
                  Gasto
                </TabsTrigger>
                <TabsTrigger value="INCOME" className="flex-1">
                  Ingreso
                </TabsTrigger>
                <TabsTrigger value="ADJUSTMENT" className="flex-1">
                  Ajuste
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              className="text-2xl h-14 text-center font-bold"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "PPP", { locale: es })
                    : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setValue("date", date)}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label>Cuenta</Label>
            <Select
              value={watch("accountId")}
              onValueChange={(value) => setValue("accountId", value)}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Seleccionar cuenta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.accountId && (
              <p className="text-sm text-destructive">{errors.accountId.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select
              value={selectedCategoryId || "none"}
              onValueChange={(value) => setValue("categoryId", value === "none" ? undefined : value)}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin categoría</SelectItem>
                {allCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.parentId ? "  └ " : ""}
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Método de Pago</Label>
            <Select
              value={watch("paymentMethod")}
              onValueChange={(value) =>
                setValue("paymentMethod", value as TransactionInput["paymentMethod"])
              }
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Seleccionar método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Efectivo</SelectItem>
                <SelectItem value="TRANSFER">Transferencia</SelectItem>
                <SelectItem value="CARD">Tarjeta</SelectItem>
                <SelectItem value="CHECK">Cheque</SelectItem>
                <SelectItem value="OTHER">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              placeholder="Descripción opcional"
              className="h-12"
              {...register("description")}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Input
              id="notes"
              placeholder="Notas adicionales"
              className="h-12"
              {...register("notes")}
            />
          </div>
        </form>

        <SheetFooter className="flex-col sm:flex-row gap-2">
          {transaction && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Eliminar
            </Button>
          )}
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
            ) : transaction ? (
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
