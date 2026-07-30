import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const user = request.user;

    if (!user?.sub) {
      return next.handle();
    }

    const method = request.method;
    const url = request.url;
    const actionMap: Record<string, string> = {
      POST: "CREATED",
      PATCH: "UPDATED",
      PUT: "UPDATED",
      DELETE: "DELETED",
    };

    const action = actionMap[method] || "ACCESSED";

    return next.handle().pipe(
      tap(async () => {
        if (action !== "ACCESSED") {
          try {
            await this.prisma.auditLog.create({
              data: {
                actorId: user.sub,
                action: `${action}_${url}`,
                targetType: "API",
                targetId: request.params?.id || "unknown",
                metadata: {
                  method,
                  url,
                  ipAddress: request.ip,
                  userAgent: request.get("user-agent"),
                },
              },
            });
          } catch {
            // Audit log failures should not break the request
          }
        }
      }),
    );
  }
}
