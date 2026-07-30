import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { FocusSessionsService } from "./focus-sessions.service";
import { StartSessionDto } from "./dto/start-session.dto";
import { EndSessionDto } from "./dto/end-session.dto";
import { SessionQueryDto } from "./dto/session-query.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RlsContextGuard } from "../common/guards/rls-context.guard";
import { User } from "../common/decorators/user.decorator";
import { FocusSessionEntity } from "./entities/focus-session.entity";

@Controller("focus-sessions")
@UseGuards(JwtAuthGuard, RlsContextGuard)
export class FocusSessionsController {
  constructor(private readonly focusSessionsService: FocusSessionsService) {}

  @Get()
  async findAll(
    @User("sub") userId: string,
    @Query() query: SessionQueryDto,
  ): Promise<FocusSessionEntity[]> {
    return this.focusSessionsService.findAll(userId, query);
  }

  @Get("active")
  async findActive(
    @User("sub") userId: string,
  ): Promise<FocusSessionEntity | null> {
    return this.focusSessionsService.findActive(userId);
  }

  @Post()
  async startSession(
    @User("sub") userId: string,
    @Body() startSessionDto: StartSessionDto,
  ): Promise<FocusSessionEntity> {
    return this.focusSessionsService.startSession(userId, startSessionDto);
  }

  @Patch(":id/end")
  async endSession(
    @User("sub") userId: string,
    @Param("id") sessionId: string,
    @Body() endSessionDto: EndSessionDto,
  ): Promise<FocusSessionEntity> {
    return this.focusSessionsService.endSession(
      userId,
      sessionId,
      endSessionDto,
    );
  }
}
