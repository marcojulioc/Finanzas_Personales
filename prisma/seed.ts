import { PrismaClient, AccountType, CategoryType } from "@prisma/client";

const prisma = new PrismaClient();

const defaultAccounts = [
  { name: "Efectivo", type: AccountType.CASH, icon: "wallet", color: "#22c55e" },
  { name: "Banco Principal", type: AccountType.BANK, icon: "building", color: "#3b82f6" },
  { name: "Tarjeta de Crédito", type: AccountType.CREDIT_CARD, icon: "credit-card", color: "#ef4444" },
];

const defaultCategories = [
  // Gastos
  {
    name: "Alimentos",
    type: CategoryType.EXPENSE,
    icon: "utensils",
    color: "#f97316",
    subcategories: ["Supermercado", "Restaurantes", "Delivery", "Cafetería"],
  },
  {
    name: "Transporte",
    type: CategoryType.EXPENSE,
    icon: "car",
    color: "#8b5cf6",
    subcategories: ["Combustible", "Transporte Público", "Uber/Taxi", "Mantenimiento"],
  },
  {
    name: "Hogar",
    type: CategoryType.EXPENSE,
    icon: "home",
    color: "#06b6d4",
    subcategories: ["Alquiler", "Electricidad", "Agua", "Internet", "Gas", "Mantenimiento"],
  },
  {
    name: "Salud",
    type: CategoryType.EXPENSE,
    icon: "heart-pulse",
    color: "#ec4899",
    subcategories: ["Medicamentos", "Consultas", "Seguro Médico", "Gimnasio"],
  },
  {
    name: "Entretenimiento",
    type: CategoryType.EXPENSE,
    icon: "gamepad-2",
    color: "#a855f7",
    subcategories: ["Streaming", "Cine", "Videojuegos", "Salidas"],
  },
  {
    name: "Educación",
    type: CategoryType.EXPENSE,
    icon: "graduation-cap",
    color: "#14b8a6",
    subcategories: ["Cursos", "Libros", "Material escolar"],
  },
  {
    name: "Ropa",
    type: CategoryType.EXPENSE,
    icon: "shirt",
    color: "#f43f5e",
    subcategories: ["Vestimenta", "Calzado", "Accesorios"],
  },
  {
    name: "Servicios",
    type: CategoryType.EXPENSE,
    icon: "smartphone",
    color: "#6366f1",
    subcategories: ["Teléfono", "Suscripciones", "Seguros"],
  },
  {
    name: "Otros Gastos",
    type: CategoryType.EXPENSE,
    icon: "more-horizontal",
    color: "#71717a",
    subcategories: [],
  },
  // Ingresos
  {
    name: "Salario",
    type: CategoryType.INCOME,
    icon: "briefcase",
    color: "#22c55e",
    subcategories: ["Sueldo Fijo", "Bonos", "Comisiones"],
  },
  {
    name: "Freelance",
    type: CategoryType.INCOME,
    icon: "laptop",
    color: "#10b981",
    subcategories: [],
  },
  {
    name: "Inversiones",
    type: CategoryType.INCOME,
    icon: "trending-up",
    color: "#059669",
    subcategories: ["Dividendos", "Intereses", "Ganancias"],
  },
  {
    name: "Otros Ingresos",
    type: CategoryType.INCOME,
    icon: "plus-circle",
    color: "#84cc16",
    subcategories: ["Regalos", "Reembolsos", "Ventas"],
  },
];

async function seedUserData(userId: string) {
  console.log(`Seeding data for user: ${userId}`);

  // Create accounts
  for (const account of defaultAccounts) {
    const existing = await prisma.financeAccount.findFirst({
      where: { userId, name: account.name },
    });

    if (!existing) {
      await prisma.financeAccount.create({
        data: {
          userId,
          name: account.name,
          type: account.type,
          icon: account.icon,
          color: account.color,
          initialBalance: 0,
        },
      });
    }
  }

  // Create categories with subcategories
  for (const category of defaultCategories) {
    let parentCategory = await prisma.category.findFirst({
      where: { userId, name: category.name, parentId: null },
    });

    if (!parentCategory) {
      parentCategory = await prisma.category.create({
        data: {
          userId,
          name: category.name,
          type: category.type,
          icon: category.icon,
          color: category.color,
        },
      });
    }

    for (const subName of category.subcategories) {
      const existingSub = await prisma.category.findFirst({
        where: { userId, name: subName, parentId: parentCategory.id },
      });

      if (!existingSub) {
        await prisma.category.create({
          data: {
            userId,
            name: subName,
            type: category.type,
            parentId: parentCategory.id,
          },
        });
      }
    }
  }

  console.log(`Seeding completed for user: ${userId}`);
}

async function main() {
  const testEmail = process.argv[2] || "test@example.com";

  // Check if user exists, create if not
  let user = await prisma.user.findUnique({ where: { email: testEmail } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: testEmail,
        name: "Usuario de Prueba",
      },
    });
    console.log(`Created test user: ${user.email}`);
  }

  await seedUserData(user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { seedUserData };
