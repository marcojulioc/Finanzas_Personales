import prisma from "@/lib/db";
import { addImportJob, getJobStatus } from "@/lib/queue";

interface ImportMapping {
  date: string;
  amount: string;
  description: string;
  type: string;
  category?: string;
  account?: string;
}

export async function createImportJob(
  userId: string,
  filename: string,
  csvData: string,
  mapping: ImportMapping
) {
  const importJob = await prisma.importJob.create({
    data: {
      userId,
      filename,
      status: "PENDING",
      mapping: mapping as object,
    },
  });

  await addImportJob({
    jobId: importJob.id,
    userId,
    filename,
    csvData,
    mapping,
  });

  return importJob;
}

export async function getImportJobsByUser(userId: string) {
  return prisma.importJob.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getImportJobById(userId: string, jobId: string) {
  const dbJob = await prisma.importJob.findFirst({
    where: { id: jobId, userId },
  });

  if (!dbJob) return null;

  const queueStatus = await getJobStatus(jobId);

  return {
    ...dbJob,
    queueProgress: queueStatus?.progress || 0,
    queueState: queueStatus?.state || dbJob.status.toLowerCase(),
  };
}

export async function deleteImportJob(userId: string, jobId: string) {
  return prisma.importJob.deleteMany({
    where: { id: jobId, userId },
  });
}
