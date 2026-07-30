import { Module } from "@nestjs/common";
import { FocusSessionsService } from "./focus-sessions.service";
import { FocusSessionsController } from "./focus-sessions.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { LoggerModule } from "../shared/logger/logger.module";

@Module({
  imports: [PrismaModule, AuthModule, LoggerModule],
  providers: [FocusSessionsService],
  controllers: [FocusSessionsController],
  exports: [FocusSessionsService],
})
export class FocusSessionsModule {}
