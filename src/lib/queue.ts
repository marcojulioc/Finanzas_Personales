import { Queue } from "bullmq";
import redis from "./redis";

export const importQueue = new Queue("csv-import", {
  connection: redis as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export interface ImportJobData {
  jobId: string;
  userId: string;
  filename: string;
  csvData: string;
  mapping: {
    date: string;
    amount: string;
    description: string;
    type: string;
    category?: string;
    account?: string;
  };
}

export async function addImportJob(data: ImportJobData) {
  return importQueue.add("import-csv", data, {
    jobId: data.jobId,
  });
}

export async function getJobStatus(jobId: string) {
  const job = await importQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  const progress = job.progress;

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
    returnvalue: job.returnvalue,
    failedReason: job.failedReason,
  };
}
