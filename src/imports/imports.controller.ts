import { Controller, Post, Get, Body, Param, UseGuards } from "@nestjs/common";
import { ImportsService } from "./imports.service";
import { CsvImportDto } from "./dto/csv-import.dto";
import { TodoistImportDto } from "./dto/todoist-import.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RlsContextGuard } from "../common/guards/rls-context.guard";
import { User } from "../common/decorators/user.decorator";

@Controller("imports")
@UseGuards(JwtAuthGuard, RlsContextGuard)
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post("csv")
  async importCsv(
    @User("sub") userId: string,
    @Body() csvImportDto: CsvImportDto,
  ) {
    return this.importsService.importCsv(userId, csvImportDto);
  }

  @Post("todoist")
  async importTodoist(
    @User("sub") userId: string,
    @Body() todoistImportDto: TodoistImportDto,
  ) {
    return this.importsService.importTodoist(userId, todoistImportDto);
  }

  @Get(":jobId/status")
  async getJobStatus(@Param("jobId") jobId: string) {
    return this.importsService.getJobStatus(jobId);
  }
}
