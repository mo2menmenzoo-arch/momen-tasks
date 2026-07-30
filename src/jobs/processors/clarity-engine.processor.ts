import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { ClarityEngineService } from "../../clarity-engine/clarity-engine.service";
import { Logger } from "@nestjs/common";

@Processor("clarity-engine")
export class ClarityEngineProcessor extends WorkerHost {
  private readonly logger = new Logger(ClarityEngineProcessor.name);

  constructor(private readonly clarityEngineService: ClarityEngineService) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case "compute-clarity-metric":
        return this.handleComputeClarityMetric(
          job as Job<{ userId: string; date: string }>,
        );
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  private async handleComputeClarityMetric(
    job: Job<{ userId: string; date: string }>,
  ) {
    this.logger.log(
      `Processing clarity metric computation for user ${job.data.userId} on ${job.data.date}`,
    );

    try {
      const date = new Date(job.data.date);
      await this.clarityEngineService.computeMetrics(job.data.userId, date);

      this.logger.log(
        `Clarity metric computed for user ${job.data.userId} on ${job.data.date}`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Failed to compute clarity metric for user ${job.data.userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
