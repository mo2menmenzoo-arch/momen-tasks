import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateNotificationPrefsDto } from './dto/update-notification-prefs.dto';
import { ExportRequestDto } from './dto/export-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RlsContextGuard } from '../common/guards/rls-context.guard';
import { User } from '../common/decorators/user.decorator';
import { UserEntity } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RlsContextGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@User('sub') userId: string): Promise<UserEntity> {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  async updateProfile(
    @User('sub') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.usersService.updateProfile(userId, updateUserDto);
  }

  @Patch('me/notification-prefs')
  async updateNotificationPrefs(
    @User('sub') userId: string,
    @Body() updateNotificationPrefsDto: UpdateNotificationPrefsDto,
  ): Promise<UserEntity> {
    return this.usersService.updateNotificationPrefs(
      userId,
      updateNotificationPrefsDto,
    );
  }

  @Post('me/export')
  async requestDataExport(
    @User('sub') userId: string,
    @Body() exportRequestDto: ExportRequestDto,
  ) {
    return this.usersService.requestDataExport(
      userId,
      exportRequestDto.format || 'json',
    );
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@User('sub') userId: string) {
    return this.usersService.deleteAccount(userId);
  }
}
