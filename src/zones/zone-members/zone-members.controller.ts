import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ZoneMembersService } from "./zone-members.service";
import { AddMemberDto } from "./dto/add-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RlsContextGuard } from "../../common/guards/rls-context.guard";
import { User } from "../../common/decorators/user.decorator";

@Controller("zones/:zoneId/members")
@UseGuards(JwtAuthGuard, RlsContextGuard)
export class ZoneMembersController {
  constructor(private readonly zoneMembersService: ZoneMembersService) {}

  @Get()
  async findAll(@Param("zoneId") zoneId: string, @User("sub") userId: string) {
    return this.zoneMembersService.findAll(zoneId, userId);
  }

  @Post()
  async addMember(
    @Param("zoneId") zoneId: string,
    @User("sub") userId: string,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.zoneMembersService.addMember(zoneId, userId, addMemberDto);
  }

  @Patch(":userId")
  async updateMember(
    @Param("zoneId") zoneId: string,
    @Param("userId") targetUserId: string,
    @User("sub") userId: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.zoneMembersService.updateMember(
      zoneId,
      userId,
      targetUserId,
      updateMemberDto,
    );
  }

  @Delete(":userId")
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param("zoneId") zoneId: string,
    @Param("userId") targetUserId: string,
    @User("sub") userId: string,
  ) {
    return this.zoneMembersService.removeMember(zoneId, userId, targetUserId);
  }
}
