import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { ClarityEngineService } from "../../clarity-engine/clarity-engine.service";
import { PrismaService } from "../../prisma/prisma.service";
import { Logger } from "@nestjs/common";

@Processor("weekly-review")
export class WeeklyReviewProcessor extends WorkerHost {
  private readonly logger = new Logger(WeeklyReviewProcessor.name);

  constructor(
    private readonly clarityEngineService: ClarityEngineService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case "generate-weekly-review":
        return this.handleGenerateWeeklyReview(
          job as Job<{ userId: string; weekStart: string }>,
        );
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  private async handleGenerateWeeklyReview(
    job: Job<{ userId: string; weekStart: string }>,
  ) {
    this.logger.log(
      `Generating weekly review for user ${job.data.userId} for week starting ${job.data.weekStart}`,
    );

    try {
      const review = await this.clarityEngineService.getWeeklyReview(
        job.data.userId,
      );

      await this.prisma.notification.create({
        data: {
          userId: job.data.userId,
          type: "WEEKLY_REVIEW",
          scheduledAt: new Date(),
          payload: {
            title: "Weekly Clarity Review",
            body: `You completed ${review.completedTasks} tasks this week. Your clarity score: ${review.averageClarityScore}`,
            data: review,
          },
          status: "PENDING",
        },
      });

      this.logger.log(`Weekly review generated for user ${job.data.userId}`);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to generate weekly review for user ${job.data.userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
