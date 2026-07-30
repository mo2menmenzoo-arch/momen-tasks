import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";

export class SignupDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}
