import { z } from "zod";

export const accountSchema = z.object({
  name: z
    .string()
    .min(1, "Nombre es requerido")
    .max(100, "Nombre muy largo"),
  type: z.enum(["CASH", "BANK", "CREDIT_CARD"], {
    required_error: "Tipo es requerido",
  }),
  initialBalance: z.coerce
    .number({ invalid_type_error: "Balance debe ser un número" })
    .default(0),
  color: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
});

export type AccountInput = z.infer<typeof accountSchema>;
