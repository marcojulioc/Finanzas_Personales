import "dotenv/config";
import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { PrismaClient, TransactionType, PaymentMethod } from "@prisma/client";
import Papa from "papaparse";
import { Decimal } from "@prisma/client/runtime/library";
import type { ImportJobData } from "../lib/queue";

const prisma = new PrismaClient();

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

console.log("Starting CSV import worker...");

const worker = new Worker<ImportJobData>(
  "csv-import",
  async (job: Job<ImportJobData>) => {
    const { jobId, userId, csvData, mapping } = job.data;

    console.log(`Processing import job: ${jobId}`);

    await prisma.importJob.update({
      where: { id: jobId },
      data: { status: "PROCESSING" },
    });

    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    const rows = parsed.data as Record<string, string>[];
    const totalRows = rows.length;
    let processedRows = 0;
    let successRows = 0;
    let errorRows = 0;
    const errorDetails: { row: number; error: string }[] = [];

    await prisma.importJob.update({
      where: { id: jobId },
      data: { totalRows },
    });

    const accounts = await prisma.financeAccount.findMany({
      where: { userId, isActive: true },
    });

    const categories = await prisma.category.findMany({
      where: { userId, isActive: true },
    });

    const defaultAccount = accounts[0];
    if (!defaultAccount) {
      throw new Error("No hay cuentas disponibles para importar");
    }

    const accountMap = new Map(
      accounts.map((a) => [a.name.toLowerCase(), a.id])
    );
    const categoryMap = new Map(
      categories.map((c) => [c.name.toLowerCase(), c.id])
    );

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        const dateStr = row[mapping.date];
        const amountStr = row[mapping.amount];
        const description = row[mapping.description] || "";
        const typeStr = row[mapping.type] || "";

        if (!dateStr || !amountStr) {
          throw new Error("Fecha o monto vacío");
        }

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          throw new Error(`Fecha inválida: ${dateStr}`);
        }

        const amount = parseFloat(amountStr.replace(/[^0-9.-]/g, ""));
        if (isNaN(amount) || amount === 0) {
          throw new Error(`Monto inválido: ${amountStr}`);
        }

        let type: TransactionType = "EXPENSE";
        const typeLower = typeStr.toLowerCase();
        if (
          typeLower.includes("ingreso") ||
          typeLower.includes("income") ||
          amount > 0
        ) {
          type = "INCOME";
        } else if (
          typeLower.includes("gasto") ||
          typeLower.includes("expense") ||
          amount < 0
        ) {
          type = "EXPENSE";
        }

        let accountId = defaultAccount.id;
        if (mapping.account && row[mapping.account]) {
          const mappedAccountId = accountMap.get(
            row[mapping.account].toLowerCase()
          );
          if (mappedAccountId) accountId = mappedAccountId;
        }

        let categoryId: string | null = null;
        if (mapping.category && row[mapping.category]) {
          categoryId =
            categoryMap.get(row[mapping.category].toLowerCase()) || null;
        }

        await prisma.transaction.create({
          data: {
            userId,
            accountId,
            categoryId,
            type,
            amount: new Decimal(Math.abs(amount)),
            date,
            description: description.slice(0, 255),
            paymentMethod: PaymentMethod.OTHER,
          },
        });

        successRows++;
      } catch (error) {
        errorRows++;
        errorDetails.push({
          row: i + 2,
          error: error instanceof Error ? error.message : "Error desconocido",
        });
      }

      processedRows++;
      await job.updateProgress(Math.round((processedRows / totalRows) * 100));

      if (processedRows % 50 === 0) {
        await prisma.importJob.update({
          where: { id: jobId },
          data: {
            processedRows,
            successRows,
            errorRows,
          },
        });
      }
    }

    await prisma.importJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        processedRows,
        successRows,
        errorRows,
        errorDetails: errorDetails.length > 0 ? errorDetails : undefined,
      },
    });

    console.log(
      `Import job ${jobId} completed: ${successRows} success, ${errorRows} errors`
    );

    return { successRows, errorRows, totalRows };
  },
  {
    connection: connection as any,
    concurrency: 2,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", async (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);

  if (job) {
    await prisma.importJob.update({
      where: { id: job.data.jobId },
      data: {
        status: "FAILED",
        errorDetails: { message: err.message },
      },
    });
  }
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down worker...");
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

console.log("CSV import worker is running");
