import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { SubtasksService } from "./subtasks.service";
import { CreateSubtaskDto } from "./dto/create-subtask.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RlsContextGuard } from "../../common/guards/rls-context.guard";
import { User } from "../../common/decorators/user.decorator";
import { TaskEntity } from "../entities/task.entity";

@Controller("tasks/:taskId/subtasks")
@UseGuards(JwtAuthGuard, RlsContextGuard)
export class SubtasksController {
  constructor(private readonly subtasksService: SubtasksService) {}

  @Get()
  async findAll(
    @User("sub") userId: string,
    @Param("taskId") taskId: string,
  ): Promise<TaskEntity[]> {
    return this.subtasksService.findAll(userId, taskId);
  }

  @Post()
  async create(
    @User("sub") userId: string,
    @Param("taskId") taskId: string,
    @Body() createSubtaskDto: CreateSubtaskDto,
  ): Promise<TaskEntity> {
    return this.subtasksService.create(userId, taskId, createSubtaskDto);
  }

  @Delete(":subtaskId")
  @HttpCode(HttpStatus.OK)
  async remove(
    @User("sub") userId: string,
    @Param("taskId") taskId: string,
    @Param("subtaskId") subtaskId: string,
  ) {
    return this.subtasksService.remove(userId, taskId, subtaskId);
  }
}
