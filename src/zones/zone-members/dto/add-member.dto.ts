import { IsEmail, IsEnum } from 'class-validator';
import { ZoneRole } from '@prisma/client';

export class AddMemberDto {
  @IsEmail()
  email: string;

  @IsEnum(ZoneRole)
  role: ZoneRole;
}
