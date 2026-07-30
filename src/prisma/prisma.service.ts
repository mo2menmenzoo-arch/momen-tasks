import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private connected = false;

  constructor(configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>("DATABASE_CONFIG.url"),
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await super.$connect();
      this.connected = true;
      this.logger.log("Database connected");
    } catch (error: unknown) {
      this.logger.error(`Database connection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async onModuleDestroy() {
    if (this.connected) {
      await this.$disconnect();
    }
  }

  async ensureConnected() {
    if (!this.connected) {
      try {
        await super.$connect();
        this.connected = true;
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        this.logger.error(`Database reconnect failed: ${msg}`);
        throw error;
      }
    }
  }

  async setRlsContext(userId: string) {
    // SET LOCAL doesn't support positional parameters ($1, $2).
    // userId is always a UUID from the verified JWT, so interpolation is safe.
    await super.$executeRawUnsafe(
      `SET LOCAL app.current_user_id = '${userId}'`,
    );
  }
}
