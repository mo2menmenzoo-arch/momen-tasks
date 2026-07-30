import { Module } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { TasksController } from "./tasks.controller";
import { SubtasksService } from "./subtasks/subtasks.service";
import { SubtasksController } from "./subtasks/subtasks.controller";
import { DependenciesService } from "./dependencies/dependencies.service";
import { DependenciesController } from "./dependencies/dependencies.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { LoggerModule } from "../shared/logger/logger.module";

@Module({
  imports: [PrismaModule, AuthModule, LoggerModule],
  providers: [TasksService, SubtasksService, DependenciesService],
  controllers: [TasksController, SubtasksController, DependenciesController],
  exports: [TasksService, SubtasksService, DependenciesService],
})
export class TasksModule {}
