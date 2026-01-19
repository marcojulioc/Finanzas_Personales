"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import * as importService from "@/server/services/import.service";

interface ImportMapping {
  date: string;
  amount: string;
  description: string;
  type: string;
  category?: string;
  account?: string;
}

export async function createImportJobAction(
  filename: string,
  csvData: string,
  mapping: ImportMapping
) {
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

export async function getImportJobsAction() {
  const user = await requireAuth();
  return importService.getImportJobsByUser(user.id!);
}

export async function getImportJobByIdAction(jobId: string) {
  const user = await requireAuth();
  return importService.getImportJobById(user.id!, jobId);
}

export async function deleteImportJobAction(jobId: string) {
  const user = await requireAuth();
  const result = await importService.deleteImportJob(user.id!, jobId);
  revalidatePath("/import");
  return result;
}
