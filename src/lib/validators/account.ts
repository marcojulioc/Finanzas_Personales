import { z } from "zod";

export const accountSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nombre es requerido")
      .max(100, "Nombre muy largo"),
    type: z.enum(["CASH", "BANK", "CREDIT_CARD"], {
      message: "Tipo es requerido",
    }),
    initialBalance: z.coerce
      .number({ message: "Balance debe ser un número" })
      .default(0),
    color: z.string().optional().nullable(),
    icon: z.string().optional().nullable(),
    // Campos solo para tarjetas de crédito
    creditLimit: z.coerce
      .number({ message: "Límite debe ser un número" })
      .positive("Límite debe ser mayor a 0")
      .optional()
      .nullable(),
    cutoffDay: z.coerce
      .number({ message: "Día de corte debe ser un número" })
      .min(1, "Día debe ser entre 1 y 31")
      .max(31, "Día debe ser entre 1 y 31")
      .optional()
      .nullable(),
    paymentDueDay: z.coerce
      .number({ message: "Día de pago debe ser un número" })
      .min(1, "Día debe ser entre 1 y 31")
      .max(31, "Día debe ser entre 1 y 31")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      // Límite de crédito es requerido solo para tarjetas de crédito
      if (data.type === "CREDIT_CARD") {
        return data.creditLimit !== undefined && data.creditLimit !== null;
      }
      return true;
    },
    {
      message: "Límite de crédito es requerido para tarjetas",
      path: ["creditLimit"],
    }
  );

export type AccountInput = z.infer<typeof accountSchema>;
