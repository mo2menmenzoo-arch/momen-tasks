import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { RealtimeGateway } from "./realtime.gateway";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RealtimeService {
  constructor(
    @Inject(forwardRef(() => RealtimeGateway))
    private readonly realtimeGateway: RealtimeGateway,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async verifyToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
      });
      return payload;
    } catch {
      return null;
    }
  }

  broadcastToUser(userId: string, event: string, data: any): void {
    this.realtimeGateway.sendToUser(userId, event, data);
  }

  broadcastToZone(zoneId: string, event: string, data: any): void {
    this.realtimeGateway.sendToZone(zoneId, event, data);
  }

  broadcastTaskCreated(
    userId: string,
    zoneId: string | null,
    taskData: any,
  ): void {
    this.broadcastToUser(userId, "task:created", taskData);
    if (zoneId) {
      this.broadcastToZone(zoneId, "task:created", taskData);
    }
  }

  broadcastTaskUpdated(
    userId: string,
    zoneId: string | null,
    changes: any,
    updatedBy: string,
  ): void {
    this.broadcastToUser(userId, "task:updated", { changes, updatedBy });
    if (zoneId) {
      this.broadcastToZone(zoneId, "task:updated", { changes, updatedBy });
    }
  }

  broadcastTaskDeleted(
    userId: string,
    zoneId: string | null,
    taskId: string,
    deletedBy: string,
  ): void {
    this.broadcastToUser(userId, "task:deleted", { taskId, deletedBy });
    if (zoneId) {
      this.broadcastToZone(zoneId, "task:deleted", { taskId, deletedBy });
    }
  }

  broadcastZoneUpdated(
    userId: string,
    zoneId: string,
    changes: any,
    updatedBy: string,
  ): void {
    this.broadcastToUser(userId, "zone:updated", {
      zoneId,
      changes,
      updatedBy,
    });
    this.broadcastToZone(zoneId, "zone:updated", {
      zoneId,
      changes,
      updatedBy,
    });
  }

  broadcastZoneDeleted(
    userId: string,
    zoneId: string,
    deletedBy: string,
  ): void {
    this.broadcastToUser(userId, "zone:deleted", { zoneId, deletedBy });
    this.broadcastToZone(zoneId, "zone:deleted", { zoneId, deletedBy });
  }

  broadcastZoneMemberAdded(zoneId: string, userId: string, role: string): void {
    this.broadcastToZone(zoneId, "zone:member:added", { zoneId, userId, role });
  }

  broadcastZoneMemberRemoved(zoneId: string, userId: string): void {
    this.broadcastToZone(zoneId, "zone:member:removed", { zoneId, userId });
  }

  broadcastZoneMemberRoleChanged(
    zoneId: string,
    userId: string,
    oldRole: string,
    newRole: string,
  ): void {
    this.broadcastToZone(zoneId, "zone:member:role-changed", {
      zoneId,
      userId,
      oldRole,
      newRole,
    });
  }

  broadcastFocusSessionStarted(userId: string, sessionData: any): void {
    this.broadcastToUser(userId, "focus-session:started", sessionData);
  }

  broadcastFocusSessionEnded(userId: string, sessionData: any): void {
    this.broadcastToUser(userId, "focus-session:ended", sessionData);
  }

  broadcastNotification(userId: string, notificationData: any): void {
    this.broadcastToUser(userId, "notification:delivered", notificationData);
  }
}
