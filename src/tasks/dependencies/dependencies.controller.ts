import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { DependenciesService } from "./dependencies.service";
import { AddDependencyDto } from "./dto/add-dependency.dto";
import { DependencyQueryDto } from "./dto/dependency-query.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RlsContextGuard } from "../../common/guards/rls-context.guard";
import { User } from "../../common/decorators/user.decorator";

@Controller("tasks/:taskId/dependencies")
@UseGuards(JwtAuthGuard, RlsContextGuard)
export class DependenciesController {
  constructor(private readonly dependenciesService: DependenciesService) {}

  @Get()
  async findAll(
    @User("sub") userId: string,
    @Param("taskId") taskId: string,
    @Query() query: DependencyQueryDto,
  ) {
    return this.dependenciesService.findAll(
      userId,
      taskId,
      query.includeTransitive,
    );
  }

  @Post()
  async addDependency(
    @User("sub") userId: string,
    @Param("taskId") taskId: string,
    @Body() addDependencyDto: AddDependencyDto,
  ) {
    return this.dependenciesService.addDependency(
      userId,
      taskId,
      addDependencyDto.dependencyId,
    );
  }

  @Delete(":dependencyId")
  @HttpCode(HttpStatus.OK)
  async removeDependency(
    @User("sub") userId: string,
    @Param("taskId") taskId: string,
    @Param("dependencyId") dependencyId: string,
  ) {
    return this.dependenciesService.removeDependency(
      userId,
      taskId,
      dependencyId,
    );
  }
}
