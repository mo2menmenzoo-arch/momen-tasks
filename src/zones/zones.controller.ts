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
import { ZonesService } from './zones.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { ZoneQueryDto } from './dto/zone-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RlsContextGuard } from '../common/guards/rls-context.guard';
import { User } from '../common/decorators/user.decorator';
import { ZoneEntity } from './entities/zone.entity';

@Controller('zones')
@UseGuards(JwtAuthGuard, RlsContextGuard)
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Get()
  async findAll(
    @User('sub') userId: string,
    @Query() query: ZoneQueryDto,
  ): Promise<ZoneEntity[]> {
    return this.zonesService.findAll(userId, query);
  }

  @Post()
  async create(
    @User('sub') userId: string,
    @Body() createZoneDto: CreateZoneDto,
  ): Promise<ZoneEntity> {
    return this.zonesService.create(userId, createZoneDto);
  }

  @Get(':id')
  async findOne(
    @User('sub') userId: string,
    @Param('id') zoneId: string,
  ): Promise<ZoneEntity> {
    return this.zonesService.findOne(userId, zoneId);
  }

  @Patch(':id')
  async update(
    @User('sub') userId: string,
    @Param('id') zoneId: string,
    @Body() updateZoneDto: UpdateZoneDto,
  ): Promise<ZoneEntity> {
    return this.zonesService.update(userId, zoneId, updateZoneDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @User('sub') userId: string,
    @Param('id') zoneId: string,
  ) {
    return this.zonesService.remove(userId, zoneId);
  }
}
