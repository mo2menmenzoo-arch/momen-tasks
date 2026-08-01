import { IsString, IsNotEmpty } from "class-validator";

export class MemberLoginDto {
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
