import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class RlsMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = req.user as { sub?: string };
    if (user?.sub) {
      await this.prisma.setRlsContext(user.sub);
    }
    next();
  }
}
