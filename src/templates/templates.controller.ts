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
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateQueryDto } from './dto/template-query.dto';
import { ApplyTemplateDto } from './dto/apply-template.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RlsContextGuard } from '../common/guards/rls-context.guard';
import { User } from '../common/decorators/user.decorator';
import { TemplateEntity } from './entities/template.entity';

@Controller('templates')
@UseGuards(JwtAuthGuard, RlsContextGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  async findAll(
    @User('sub') userId: string,
    @Query() query: TemplateQueryDto,
  ): Promise<TemplateEntity[]> {
    return this.templatesService.findAll(userId, query);
  }

  @Post()
  async create(
    @User('sub') userId: string,
    @Body() createTemplateDto: CreateTemplateDto,
  ): Promise<TemplateEntity> {
    return this.templatesService.create(userId, createTemplateDto);
  }

  @Get(':id')
  async findOne(
    @User('sub') userId: string,
    @Param('id') templateId: string,
  ): Promise<TemplateEntity> {
    return this.templatesService.findOne(userId, templateId);
  }

  @Patch(':id')
  async update(
    @User('sub') userId: string,
    @Param('id') templateId: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ): Promise<TemplateEntity> {
    return this.templatesService.update(userId, templateId, updateTemplateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @User('sub') userId: string,
    @Param('id') templateId: string,
  ) {
    return this.templatesService.remove(userId, templateId);
  }

  @Post(':id/apply')
  async apply(
    @User('sub') userId: string,
    @Param('id') templateId: string,
    @Body() applyTemplateDto: ApplyTemplateDto,
  ) {
    return this.templatesService.apply(userId, templateId, applyTemplateDto);
  }
}
