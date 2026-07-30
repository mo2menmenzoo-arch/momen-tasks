import { Module } from "@nestjs/common";
import { AppLoggerService } from "./logger.service";

@Module({
  providers: [
    {
      provide: AppLoggerService,
      useFactory: () => new AppLoggerService(),
    },
  ],
  exports: [AppLoggerService],
})
export class LoggerModule {}
