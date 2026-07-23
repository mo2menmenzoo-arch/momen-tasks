import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RlsContextGuard } from '../common/guards/rls-context.guard';
import { User } from '../common/decorators/user.decorator';
import { TaskEntity } from './entities/task.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RlsContextGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(
    @User('sub') userId: string,
    @Query() query: TaskQueryDto,
  ): Promise<TaskEntity[]> {
    return this.tasksService.findAll(userId, query);
  }

  @Post()
  async create(
    @User('sub') userId: string,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<TaskEntity> {
    return this.tasksService.create(userId, createTaskDto);
  }

  @Get(':id')
  async findOne(
    @User('sub') userId: string,
    @Param('id') taskId: string,
  ): Promise<TaskEntity> {
    return this.tasksService.findOne(userId, taskId);
  }

  @Patch(':id')
  async update(
    @User('sub') userId: string,
    @Param('id') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<TaskEntity> {
    return this.tasksService.update(userId, taskId, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @User('sub') userId: string,
    @Param('id') taskId: string,
  ) {
    return this.tasksService.remove(userId, taskId);
  }
}
