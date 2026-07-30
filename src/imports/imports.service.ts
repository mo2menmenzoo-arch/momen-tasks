import { Injectable, Optional } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CsvImportDto } from "./dto/csv-import.dto";
import { TodoistImportDto } from "./dto/todoist-import.dto";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class ImportsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() @InjectQueue("import") private readonly importQueue: Queue,
  ) {}

  async importCsv(
    userId: string,
    csvImportDto: CsvImportDto,
  ): Promise<{ jobId: string; message: string }> {
    const jobId = `csv-import-${userId}-${Date.now()}`;

    if (!this.importQueue) {
      return { jobId, message: "Import not available in serverless mode." };
    }

    await this.importQueue.add(
      "process-csv-import",
      {
        userId,
        jobId,
        fileUrl: csvImportDto.fileUrl,
        zoneId: csvImportDto.zoneId,
        columnMapping: csvImportDto.columnMapping,
      },
      {
        jobId,
      },
    );

    return {
      jobId,
      message:
        "CSV import job queued. Check status with GET /imports/:jobId/status",
    };
  }

  async importTodoist(
    userId: string,
    todoistImportDto: TodoistImportDto,
  ): Promise<{ jobId: string; message: string }> {
    const jobId = `todoist-import-${userId}-${Date.now()}`;

    if (!this.importQueue) {
      return { jobId, message: "Import not available in serverless mode." };
    }

    await this.importQueue.add(
      "process-todoist-import",
      {
        userId,
        jobId,
        fileUrl: todoistImportDto.fileUrl,
        zoneId: todoistImportDto.zoneId,
      },
      {
        jobId,
      },
    );

    return {
      jobId,
      message:
        "Todoist import job queued. Check status with GET /imports/:jobId/status",
    };
  }

  async getJobStatus(jobId: string): Promise<any> {
    if (!this.importQueue) {
      return null;
    }
    const job = await this.importQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    return {
      jobId: job.id,
      status: job.progress || 0,
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }
}
