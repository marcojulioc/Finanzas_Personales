import { z } from "zod";

export const loginWithPinSchema = z.object({
  username: z.string().min(3, "Usuario debe tener al menos 3 caracteres").max(20, "Usuario muy largo"),
  pin: z.string().length(4, "PIN debe ser de 4 dígitos").regex(/^\d{4}$/, "PIN debe ser numérico"),
});

export const setupCredentialsSchema = z.object({
  username: z
    .string()
    .min(3, "Usuario debe tener al menos 3 caracteres")
    .max(20, "Usuario muy largo")
    .regex(/^[a-z0-9_]+$/, "Solo letras minúsculas, números y guion bajo"),
  pin: z.string().length(4, "PIN debe ser de 4 dígitos").regex(/^\d{4}$/, "PIN debe ser numérico"),
  confirmPin: z.string(),
}).refine((data) => data.pin === data.confirmPin, {
  message: "Los PINs no coinciden",
  path: ["confirmPin"],
});

export const changePinSchema = z.object({
  currentPin: z.string().length(4, "PIN debe ser de 4 dígitos").regex(/^\d{4}$/, "PIN debe ser numérico"),
  newPin: z.string().length(4, "PIN debe ser de 4 dígitos").regex(/^\d{4}$/, "PIN debe ser numérico"),
  confirmNewPin: z.string(),
}).refine((data) => data.newPin === data.confirmNewPin, {
  message: "Los PINs no coinciden",
  path: ["confirmNewPin"],
});

export type LoginWithPinInput = z.infer<typeof loginWithPinSchema>;
export type SetupCredentialsInput = z.infer<typeof setupCredentialsSchema>;
export type ChangePinInput = z.infer<typeof changePinSchema>;
