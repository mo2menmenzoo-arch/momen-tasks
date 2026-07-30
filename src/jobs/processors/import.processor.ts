import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { PrismaService } from "../../prisma/prisma.service";
import { Logger } from "@nestjs/common";

@Processor("import")
export class ImportProcessor extends WorkerHost {
  private readonly logger = new Logger(ImportProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case "process-csv-import":
        return this.handleCsvImport(job);
      case "process-todoist-import":
        return this.handleTodoistImport(job);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  private async handleCsvImport(job: Job) {
    this.logger.log(`Processing CSV import for user ${job.data.userId}`);

    try {
      const { userId, fileUrl, zoneId, columnMapping } = job.data;

      await job.updateProgress(0);

      const axios = require("axios");
      const response = await axios.get(fileUrl);
      const csvData = response.data;

      const lines = csvData.split("\n").filter((line: string) => line.trim());
      const totalLines = lines.length;

      let imported = 0;
      const batchSize = 100;

      for (let i = 1; i < totalLines; i += batchSize) {
        const batch = lines.slice(i, i + batchSize);

        for (const line of batch) {
          const values = line.split(",").map((v: string) => v.trim());
          const title = columnMapping?.title
            ? values[columnMapping.title]
            : values[0];

          if (title) {
            await this.prisma.task.create({
              data: {
                title,
                notes: columnMapping?.notes
                  ? values[columnMapping.notes]
                  : undefined,
                ownerId: userId,
                zoneId,
                source: "IMPORT",
              },
            });
            imported++;
          }
        }

        const progress = Math.round((imported / totalLines) * 100);
        await job.updateProgress(progress);
      }

      await job.updateProgress(100);

      return {
        success: true,
        imported,
        total: totalLines - 1,
      };
    } catch (error: any) {
      this.logger.error(`CSV import failed: ${error.message}`);
      throw error;
    }
  }

  private async handleTodoistImport(job: Job) {
    this.logger.log(`Processing Todoist import for user ${job.data.userId}`);

    try {
      const { userId, fileUrl, zoneId } = job.data;

      await job.updateProgress(0);

      const axios = require("axios");
      const response = await axios.get(fileUrl);
      const todoistData = response.data;

      let imported = 0;
      const tasks = todoistData.items || todoistData;

      if (Array.isArray(tasks)) {
        for (let i = 0; i < tasks.length; i++) {
          const task = tasks[i];
          const priorityMap: Record<number, string> = {
            1: "LOW",
            2: "MEDIUM",
            3: "HIGH",
            4: "CRITICAL",
          };

          await this.prisma.task.create({
            data: {
              title: task.content || task.title,
              notes: task.description,
              priority: (priorityMap[task.priority] || "MEDIUM") as any,
              ownerId: userId,
              zoneId,
              source: "IMPORT",
              tags: task.labels || [],
            },
          });
          imported++;

          if (i % 100 === 0) {
            const progress = Math.round((imported / tasks.length) * 100);
            await job.updateProgress(progress);
          }
        }
      }

      await job.updateProgress(100);

      return {
        success: true,
        imported,
        total: tasks.length,
      };
    } catch (error: any) {
      this.logger.error(`Todoist import failed: ${error.message}`);
      throw error;
    }
  }
}
