import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { SyncService } from "./sync.service";
import { PushChangesDto } from "./dto/push-changes.dto";
import { PullChangesDto } from "./dto/pull-changes.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RlsContextGuard } from "../common/guards/rls-context.guard";
import { User } from "../common/decorators/user.decorator";

@Controller("sync")
@UseGuards(JwtAuthGuard, RlsContextGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post("push")
  @HttpCode(HttpStatus.OK)
  async pushChanges(
    @User("sub") userId: string,
    @Body() pushChangesDto: PushChangesDto,
  ) {
    return this.syncService.pushChanges(userId, pushChangesDto);
  }

  @Post("pull")
  @HttpCode(HttpStatus.OK)
  async pullChanges(
    @User("sub") userId: string,
    @Body() pullChangesDto: PullChangesDto,
  ) {
    return this.syncService.pullChanges(userId, pullChangesDto);
  }
}
