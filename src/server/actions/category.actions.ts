"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { categorySchema } from "@/lib/validators/category";
import * as categoryService from "@/server/services/category.service";
import type { CategoryType } from "@prisma/client";

export async function getCategoriesAction() {
  const user = await requireAuth();
  return categoryService.getCategoriesByUser(user.id!);
}

export async function getCategoriesByTypeAction(type: CategoryType) {
  const user = await requireAuth();
  return categoryService.getCategoriesByType(user.id!, type);
}

export async function getAllCategoriesFlatAction() {
  const user = await requireAuth();
  return categoryService.getAllCategoriesFlat(user.id!);
}

export async function getCategoryByIdAction(categoryId: string) {
  const user = await requireAuth();
  return categoryService.getCategoryById(user.id!, categoryId);
}

export async function createCategoryAction(data: Record<string, unknown>) {
  const user = await requireAuth();
  const validatedData = categorySchema.parse(data);
  const result = await categoryService.createCategory(user.id!, validatedData);
  revalidatePath("/settings");
  revalidatePath("/transactions");
  return result;
}

export async function updateCategoryAction(
  categoryId: string,
  data: Record<string, unknown>
) {
  const user = await requireAuth();
  const validatedData = categorySchema.partial().parse(data);
  const result = await categoryService.updateCategory(user.id!, categoryId, validatedData);
  revalidatePath("/settings");
  revalidatePath("/transactions");
  return result;
}

export async function deleteCategoryAction(categoryId: string) {
  const user = await requireAuth();
  const result = await categoryService.deleteCategory(user.id!, categoryId);
  revalidatePath("/settings");
  revalidatePath("/transactions");
  return result;
}
