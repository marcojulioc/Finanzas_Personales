"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import {
  setupCredentialsSchema,
  changePinSchema,
  type SetupCredentialsInput,
  type ChangePinInput,
} from "@/lib/validators/auth";
import { revalidatePath } from "next/cache";

export type ActionState = {
  success: boolean;
  message: string;
};

export async function setupCredentialsAction(
  data: SetupCredentialsInput
): Promise<ActionState> {
  try {
    const user = await requireAuth();

    const validated = setupCredentialsSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Datos inválidos",
      };
    }

    // Verificar que el username no esté en uso
    const existingUser = await prisma.user.findUnique({
      where: { username: validated.data.username },
    });

    if (existingUser && existingUser.id !== user.id) {
      return {
        success: false,
        message: "Este nombre de usuario ya está en uso",
      };
    }

    // Hash del PIN
    const hashedPin = await bcrypt.hash(validated.data.pin, 10);

    // Actualizar usuario
    await prisma.user.update({
      where: { id: user.id },
      data: {
        username: validated.data.username,
        pin: hashedPin,
      },
    });

    revalidatePath("/settings");
    return {
      success: true,
      message: "Credenciales configuradas correctamente",
    };
  } catch (error) {
    console.error("Error setting up credentials:", error);
    return {
      success: false,
      message: "Error al configurar credenciales",
    };
  }
}

export async function changePinAction(
  data: ChangePinInput
): Promise<ActionState> {
  try {
    const user = await requireAuth();

    const validated = changePinSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Datos inválidos",
      };
    }

    // Obtener usuario con PIN actual
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser?.pin) {
      return {
        success: false,
        message: "No tienes un PIN configurado",
      };
    }

    // Verificar PIN actual
    const isValidPin = await bcrypt.compare(
      validated.data.currentPin,
      dbUser.pin
    );

    if (!isValidPin) {
      return {
        success: false,
        message: "PIN actual incorrecto",
      };
    }

    // Hash del nuevo PIN
    const hashedPin = await bcrypt.hash(validated.data.newPin, 10);

    // Actualizar PIN
    await prisma.user.update({
      where: { id: user.id },
      data: { pin: hashedPin },
    });

    revalidatePath("/settings");
    return {
      success: true,
      message: "PIN actualizado correctamente",
    };
  } catch (error) {
    console.error("Error changing PIN:", error);
    return {
      success: false,
      message: "Error al cambiar el PIN",
    };
  }
}

export async function getCredentialsStatusAction(): Promise<{
  hasCredentials: boolean;
  username: string | null;
}> {
  try {
    const user = await requireAuth();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { username: true, pin: true },
    });

    return {
      hasCredentials: !!(dbUser?.username && dbUser?.pin),
      username: dbUser?.username || null,
    };
  } catch {
    return {
      hasCredentials: false,
      username: null,
    };
  }
}
