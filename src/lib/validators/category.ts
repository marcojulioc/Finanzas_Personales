import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Nombre es requerido")
    .max(100, "Nombre muy largo"),
  type: z.enum(["INCOME", "EXPENSE"], {
    required_error: "Tipo es requerido",
  }),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
