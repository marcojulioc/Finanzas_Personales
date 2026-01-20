"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { createSafeAction } from "@/lib/safe-action";
import { categorySchema } from "@/lib/validators/category";
import * as categoryService from "@/server/services/category.service";

const categoryTypeSchema = z.enum(["INCOME", "EXPENSE"]);

export const getCategoriesAction = createSafeAction(
  z.void(),
  async () => {
    const user = await requireAuth();
    return categoryService.getCategoriesByUser(user.id!);
  }
);

export const getCategoriesByTypeAction = createSafeAction(
  categoryTypeSchema,
  async (type) => {
    const user = await requireAuth();
    return categoryService.getCategoriesByType(user.id!, type);
  }
);

export const getAllCategoriesFlatAction = createSafeAction(
  z.void(),
  async () => {
    const user = await requireAuth();
    return categoryService.getAllCategoriesFlat(user.id!);
  }
);

export const getCategoryByIdAction = createSafeAction(
  z.string(),
  async (categoryId) => {
    const user = await requireAuth();
    return categoryService.getCategoryById(user.id!, categoryId);
  }
);

export const createCategoryAction = createSafeAction(
  categorySchema,
  async (data) => {
    const user = await requireAuth();
    const result = await categoryService.createCategory(user.id!, data);
    revalidatePath("/settings");
    revalidatePath("/transactions");
    return result;
  }
);

export const updateCategoryAction = createSafeAction(
  z.object({
    id: z.string(),
    data: categorySchema.partial(),
  }),
  async ({ id, data }) => {
    const user = await requireAuth();
    const result = await categoryService.updateCategory(user.id!, id, data);
    revalidatePath("/settings");
    revalidatePath("/transactions");
    return result;
  }
);

export const deleteCategoryAction = createSafeAction(
  z.string(),
  async (categoryId) => {
    const user = await requireAuth();
    const result = await categoryService.deleteCategory(user.id!, categoryId);
    revalidatePath("/settings");
    revalidatePath("/transactions");
    return result;
  }
);
