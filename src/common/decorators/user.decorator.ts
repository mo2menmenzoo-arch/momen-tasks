import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../guards/jwt-auth.guard';

export const User = createParamDecorator(
  (data: keyof JwtPayload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: JwtPayload = request.user;
    return data ? user?.[data] : user;
  },
);
