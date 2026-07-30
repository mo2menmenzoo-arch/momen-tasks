import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { PrismaService } from "../../prisma/prisma.service";
import { Logger } from "@nestjs/common";

@Processor("export")
export class ExportProcessor extends WorkerHost {
  private readonly logger = new Logger(ExportProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case "generate-export":
        return this.handleGenerateExport(job);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  private async handleGenerateExport(
    job: Job<{ userId: string; exportId: string; format: "json" | "csv" }>,
  ) {
    this.logger.log(`Generating data export for user ${job.data.userId}`);

    try {
      const { userId, exportId, format } = job.data;

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          ownedZones: true,
          tasks: true,
          focusSessions: true,
          clarityMetrics: true,
          templates: true,
          notifications: true,
        },
      });

      if (!user) {
        throw new Error(`User ${userId} not found for export`);
      }

      const exportData = {
        user: {
          email: user.email,
          displayName: user.displayName,
          timezone: user.timezone,
          createdAt: user.createdAt,
        },
        zones: user.ownedZones,
        tasks: user.tasks,
        focusSessions: user.focusSessions,
        clarityMetrics: user.clarityMetrics,
        templates: user.templates,
        exportedAt: new Date().toISOString(),
      };

      this.logger.log(
        `Data export generated for user ${userId}: ${JSON.stringify(exportData).length} bytes`,
      );

      return {
        exportId,
        data: exportData,
        format,
        size: JSON.stringify(exportData).length,
      };
    } catch (error: unknown) {
      this.logger.error(`Export generation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
