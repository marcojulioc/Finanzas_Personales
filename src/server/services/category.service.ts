import prisma from "@/lib/db";
import type { CategoryType } from "@prisma/client";
import type { CategoryInput } from "@/lib/validators/category";

export async function getCategoriesByUser(userId: string) {
  return prisma.category.findMany({
    where: { userId, isActive: true, parentId: null },
    include: {
      subcategories: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getCategoriesByType(userId: string, type: CategoryType) {
  return prisma.category.findMany({
    where: { userId, type, isActive: true, parentId: null },
    include: {
      subcategories: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getAllCategoriesFlat(userId: string) {
  return prisma.category.findMany({
    where: { userId, isActive: true },
    include: {
      parent: true,
    },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });
}

export async function getCategoryById(userId: string, categoryId: string) {
  return prisma.category.findFirst({
    where: { id: categoryId, userId },
    include: {
      subcategories: {
        where: { isActive: true },
      },
      parent: true,
    },
  });
}

export async function createCategory(userId: string, data: CategoryInput) {
  return prisma.category.create({
    data: {
      userId,
      name: data.name,
      type: data.type as CategoryType,
      icon: data.icon,
      color: data.color,
      parentId: data.parentId,
    },
  });
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  data: Partial<CategoryInput>
) {
  return prisma.category.updateMany({
    where: { id: categoryId, userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.type && { type: data.type as CategoryType }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
    },
  });
}

export async function deleteCategory(userId: string, categoryId: string) {
  return prisma.category.updateMany({
    where: { id: categoryId, userId },
    data: { isActive: false },
  });
}
