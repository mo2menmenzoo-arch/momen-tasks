import { Module } from "@nestjs/common";
import { ZonesService } from "./zones.service";
import { ZonesController } from "./zones.controller";
import { ZoneMembersService } from "./zone-members/zone-members.service";
import { ZoneMembersController } from "./zone-members/zone-members.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { LoggerModule } from "../shared/logger/logger.module";

@Module({
  imports: [PrismaModule, AuthModule, LoggerModule],
  providers: [ZonesService, ZoneMembersService],
  controllers: [ZonesController, ZoneMembersController],
  exports: [ZonesService, ZoneMembersService],
})
export class ZonesModule {}
