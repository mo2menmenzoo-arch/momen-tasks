import { Module } from "@nestjs/common";
import { ImportsService } from "./imports.service";
import { ImportsController } from "./imports.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { LoggerModule } from "../shared/logger/logger.module";

@Module({
  imports: [PrismaModule, AuthModule, LoggerModule],
  providers: [ImportsService],
  controllers: [ImportsController],
  exports: [ImportsService],
})
export class ImportsModule {}
