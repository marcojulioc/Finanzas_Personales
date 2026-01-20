"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { createSafeAction } from "@/lib/safe-action";
import * as importService from "@/server/services/import.service";

const importMappingSchema = z.object({
  date: z.string(),
  amount: z.string(),
  description: z.string(),
  type: z.string(),
  category: z.string().optional(),
  account: z.string().optional(),
});

const createImportJobSchema = z.object({
  filename: z.string().min(1, "Nombre de archivo requerido"),
  csvData: z.string().min(1, "Datos CSV requeridos"),
  mapping: importMappingSchema,
});

export const createImportJobAction = createSafeAction(
  createImportJobSchema,
  async ({ filename, csvData, mapping }) => {
    const user = await requireAuth();
    const result = await importService.createImportJob(
      user.id!,
      filename,
      csvData,
      mapping
    );
    revalidatePath("/import");
    return result;
  }
);

export const getImportJobsAction = createSafeAction(
  z.void(),
  async () => {
    const user = await requireAuth();
    return importService.getImportJobsByUser(user.id!);
  }
);

export const getImportJobByIdAction = createSafeAction(
  z.string(),
  async (jobId) => {
    const user = await requireAuth();
    return importService.getImportJobById(user.id!, jobId);
  }
);

export const deleteImportJobAction = createSafeAction(
  z.string(),
  async (jobId) => {
    const user = await requireAuth();
    const result = await importService.deleteImportJob(user.id!, jobId);
    revalidatePath("/import");
    return result;
  }
);
