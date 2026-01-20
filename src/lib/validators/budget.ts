import { z } from "zod";

export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Categoría es requerida"),
  amount: z
    .number({ message: "Monto debe ser un número" })
    .positive("Monto debe ser mayor a 0"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

export type BudgetInput = z.infer<typeof budgetSchema>;
