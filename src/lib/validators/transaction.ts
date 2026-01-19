import { z } from "zod";

export const transactionSchema = z.object({
  accountId: z.string().min(1, "Cuenta es requerida"),
  categoryId: z.string().optional().nullable(),
  type: z.enum(["INCOME", "EXPENSE", "ADJUSTMENT"], {
    required_error: "Tipo es requerido",
  }),
  amount: z.coerce
    .number({ invalid_type_error: "Monto debe ser un número" })
    .positive("Monto debe ser mayor a 0"),
  date: z.coerce.date({
    required_error: "Fecha es requerida",
    invalid_type_error: "Fecha inválida",
  }),
  description: z.string().max(255, "Descripción muy larga").optional().nullable(),
  paymentMethod: z.enum(["CASH", "TRANSFER", "CARD", "CHECK", "OTHER"]).default("CASH"),
  notes: z.string().max(1000, "Notas muy largas").optional().nullable(),
});

export const transactionFilterSchema = z.object({
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE", "ADJUSTMENT"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;
