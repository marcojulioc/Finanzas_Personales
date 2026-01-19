import {
  PrismaClient,
  TransactionType,
  PaymentMethod,
  AccountType,
  CategoryType,
} from "@prisma/client";

const prisma = new PrismaClient();

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysAgo));
  date.setHours(randomInt(8, 22), randomInt(0, 59), 0, 0);
  return date;
}

const defaultAccounts = [
  { name: "Efectivo", type: AccountType.CASH, icon: "wallet", color: "#22c55e" },
  { name: "Banco Principal", type: AccountType.BANK, icon: "building", color: "#3b82f6" },
  { name: "Tarjeta de Crédito", type: AccountType.CREDIT_CARD, icon: "credit-card", color: "#ef4444" },
];

const defaultCategories = [
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

async function ensureAccountsAndCategories(userId: string) {
  // Create accounts if not exist
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

  // Create categories
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
}

const transactionTemplates = [
  // Gastos - Alimentos
  { desc: "Supermercado Nacional", category: "Supermercado", amount: [1500, 5000], method: PaymentMethod.CARD },
  { desc: "Jumbo", category: "Supermercado", amount: [2000, 8000], method: PaymentMethod.CARD },
  { desc: "Colmado", category: "Supermercado", amount: [200, 800], method: PaymentMethod.CASH },
  { desc: "McDonald's", category: "Restaurantes", amount: [400, 1200], method: PaymentMethod.CARD },
  { desc: "Adrian Tropical", category: "Restaurantes", amount: [800, 2500], method: PaymentMethod.CARD },
  { desc: "PedidosYa", category: "Delivery", amount: [500, 1500], method: PaymentMethod.CARD },
  { desc: "Uber Eats", category: "Delivery", amount: [600, 1800], method: PaymentMethod.CARD },
  { desc: "Starbucks", category: "Cafetería", amount: [250, 600], method: PaymentMethod.CARD },

  // Gastos - Transporte
  { desc: "Gasolina", category: "Combustible", amount: [1500, 3500], method: PaymentMethod.CARD },
  { desc: "Shell", category: "Combustible", amount: [1000, 3000], method: PaymentMethod.CARD },
  { desc: "Uber", category: "Uber/Taxi", amount: [200, 800], method: PaymentMethod.CARD },
  { desc: "OMSA", category: "Transporte Público", amount: [25, 50], method: PaymentMethod.CASH },
  { desc: "Lavado de carro", category: "Mantenimiento", amount: [300, 600], method: PaymentMethod.CASH },

  // Gastos - Hogar
  { desc: "Alquiler apartamento", category: "Alquiler", amount: [15000, 25000], method: PaymentMethod.TRANSFER },
  { desc: "EDENORTE", category: "Electricidad", amount: [2000, 5000], method: PaymentMethod.TRANSFER },
  { desc: "CORAASAN", category: "Agua", amount: [300, 800], method: PaymentMethod.TRANSFER },
  { desc: "Claro Internet", category: "Internet", amount: [1500, 2500], method: PaymentMethod.CARD },

  // Gastos - Entretenimiento
  { desc: "Netflix", category: "Streaming", amount: [450, 650], method: PaymentMethod.CARD },
  { desc: "Spotify", category: "Streaming", amount: [150, 250], method: PaymentMethod.CARD },
  { desc: "Disney+", category: "Streaming", amount: [300, 400], method: PaymentMethod.CARD },
  { desc: "Cine Caribbean", category: "Cine", amount: [500, 1200], method: PaymentMethod.CARD },
  { desc: "PlayStation Store", category: "Videojuegos", amount: [500, 3000], method: PaymentMethod.CARD },

  // Gastos - Salud
  { desc: "Farmacia Carol", category: "Medicamentos", amount: [300, 1500], method: PaymentMethod.CARD },
  { desc: "Consulta médica", category: "Consultas", amount: [1500, 3000], method: PaymentMethod.CARD },
  { desc: "Gimnasio Gold's", category: "Gimnasio", amount: [2000, 3500], method: PaymentMethod.CARD },

  // Gastos - Servicios
  { desc: "Claro móvil", category: "Teléfono", amount: [800, 1500], method: PaymentMethod.CARD },
  { desc: "Altice móvil", category: "Teléfono", amount: [600, 1200], method: PaymentMethod.CARD },
];

const incomeTemplates = [
  { desc: "Salario quincenal", category: "Sueldo Fijo", amount: [25000, 45000], method: PaymentMethod.TRANSFER },
  { desc: "Bono trimestral", category: "Bonos", amount: [10000, 25000], method: PaymentMethod.TRANSFER },
  { desc: "Proyecto freelance", category: "Freelance", amount: [5000, 20000], method: PaymentMethod.TRANSFER },
  { desc: "Intereses bancarios", category: "Intereses", amount: [100, 500], method: PaymentMethod.TRANSFER },
  { desc: "Reembolso", category: "Reembolsos", amount: [500, 2000], method: PaymentMethod.TRANSFER },
];

async function main() {
  const userEmail = process.argv[2] || "marcojulioc@gmail.com";

  let user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    console.log("Usuario no encontrado:", userEmail);
    return;
  }

  console.log(`Creando datos para: ${user.email} (ID: ${user.id})`);

  // Create accounts and categories first
  console.log("Creando cuentas y categorías...");
  await ensureAccountsAndCategories(user.id);

  // Reload user with accounts and categories
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      financeAccounts: true,
      categories: true,
    },
  });

  if (!userData) {
    console.log("Error al recargar usuario");
    return;
  }

  // Build category map
  const categoryMap = new Map<string, string>();
  for (const cat of userData.categories) {
    categoryMap.set(cat.name, cat.id);
  }

  const accounts = userData.financeAccounts;
  const cashAccount = accounts.find((a) => a.type === "CASH");
  const bankAccount = accounts.find((a) => a.type === "BANK");
  const creditCard = accounts.find((a) => a.type === "CREDIT_CARD");

  if (!cashAccount || !bankAccount || !creditCard) {
    console.log("Faltan cuentas necesarias");
    console.log("Cuentas encontradas:", accounts.map(a => `${a.name} (${a.type})`));
    return;
  }

  const transactions: {
    userId: string;
    accountId: string;
    categoryId: string | null;
    type: TransactionType;
    amount: number;
    date: Date;
    description: string;
    paymentMethod: PaymentMethod;
  }[] = [];

  // Generate expenses (last 90 days)
  for (let i = 0; i < 80; i++) {
    const template = transactionTemplates[randomInt(0, transactionTemplates.length - 1)];
    const categoryId = categoryMap.get(template.category);

    if (!categoryId) continue;

    let accountId = bankAccount.id;
    if (template.method === PaymentMethod.CASH) {
      accountId = cashAccount.id;
    } else if (template.method === PaymentMethod.CARD) {
      accountId = randomInt(0, 1) === 0 ? creditCard.id : bankAccount.id;
    }

    transactions.push({
      userId: user.id,
      accountId,
      categoryId,
      type: TransactionType.EXPENSE,
      amount: randomInt(template.amount[0], template.amount[1]),
      date: randomDate(90),
      description: template.desc,
      paymentMethod: template.method,
    });
  }

  // Generate income (salaries every 15 days for last 3 months)
  const salaryCategory = categoryMap.get("Sueldo Fijo");
  if (salaryCategory) {
    for (let month = 0; month < 3; month++) {
      const date1 = new Date();
      date1.setMonth(date1.getMonth() - month);
      date1.setDate(15);

      const date2 = new Date();
      date2.setMonth(date2.getMonth() - month);
      date2.setDate(30);

      const salaryAmount = randomInt(30000, 45000);

      transactions.push({
        userId: user.id,
        accountId: bankAccount.id,
        categoryId: salaryCategory,
        type: TransactionType.INCOME,
        amount: salaryAmount,
        date: date1,
        description: "Salario quincenal",
        paymentMethod: PaymentMethod.TRANSFER,
      });

      transactions.push({
        userId: user.id,
        accountId: bankAccount.id,
        categoryId: salaryCategory,
        type: TransactionType.INCOME,
        amount: salaryAmount,
        date: date2,
        description: "Salario quincenal",
        paymentMethod: PaymentMethod.TRANSFER,
      });
    }
  }

  // Add a few random incomes
  for (let i = 0; i < 5; i++) {
    const template = incomeTemplates[randomInt(1, incomeTemplates.length - 1)];
    const categoryId = categoryMap.get(template.category);

    if (!categoryId) continue;

    transactions.push({
      userId: user.id,
      accountId: bankAccount.id,
      categoryId,
      type: TransactionType.INCOME,
      amount: randomInt(template.amount[0], template.amount[1]),
      date: randomDate(90),
      description: template.desc,
      paymentMethod: template.method,
    });
  }

  // Create budgets for current month
  const now = new Date();
  const budgetCategories = [
    { name: "Alimentos", amount: 15000 },
    { name: "Transporte", amount: 8000 },
    { name: "Entretenimiento", amount: 5000 },
    { name: "Hogar", amount: 30000 },
    { name: "Salud", amount: 5000 },
  ];

  for (const budget of budgetCategories) {
    const categoryId = categoryMap.get(budget.name);
    if (!categoryId) continue;

    await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: user.id,
          categoryId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      },
      update: { amount: budget.amount },
      create: {
        userId: user.id,
        categoryId,
        amount: budget.amount,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    });
  }

  // Insert all transactions
  await prisma.transaction.createMany({
    data: transactions,
  });

  console.log(`✓ Creadas ${transactions.length} transacciones`);
  console.log(`✓ Creados ${budgetCategories.length} presupuestos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
