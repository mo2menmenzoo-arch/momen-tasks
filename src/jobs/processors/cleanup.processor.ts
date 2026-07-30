import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { PrismaService } from "../../prisma/prisma.service";
import { Logger } from "@nestjs/common";

@Processor("cleanup")
export class CleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(CleanupProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case "cleanup-expired-tokens":
        return this.handleCleanupExpiredTokens();
      case "purge-soft-deleted-data":
        return this.handlePurgeSoftDeletedData();
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  private async handleCleanupExpiredTokens() {
    this.logger.log("Starting expired token cleanup");

    try {
      const result = await this.prisma.refreshToken.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired refresh tokens`);

      await this.prisma.$executeRaw`
        DELETE FROM "EmailVerificationToken"
        WHERE "expiresAt" < NOW()
      `;

      await this.prisma.$executeRaw`
        DELETE FROM "MagicLinkToken"
        WHERE "expiresAt" < NOW()
      `;

      await this.prisma.$executeRaw`
        DELETE FROM "PasswordResetToken"
        WHERE "expiresAt" < NOW()
      `;

      this.logger.log("Expired token cleanup completed");
    } catch (error: unknown) {
      this.logger.error(`Token cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private async handlePurgeSoftDeletedData() {
    this.logger.log("Starting soft-deleted data purge");

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const users = await this.prisma.user.deleteMany({
        where: {
          deletedAt: { lt: thirtyDaysAgo },
        },
      });

      this.logger.log(`Purged ${users.count} soft-deleted users`);

      const zones = await this.prisma.zone.deleteMany({
        where: {
          deletedAt: { lt: thirtyDaysAgo },
        },
      });

      this.logger.log(`Purged ${zones.count} soft-deleted zones`);

      const tasks = await this.prisma.task.deleteMany({
        where: {
          deletedAt: { lt: thirtyDaysAgo },
        },
      });

      this.logger.log(`Purged ${tasks.count} soft-deleted tasks`);

      this.logger.log("Soft-deleted data purge completed");
    } catch (error: unknown) {
      this.logger.error(`Data purge failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
