import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RealtimeService } from "./realtime.service";
import { Logger, Inject, forwardRef } from "@nestjs/common";

@WebSocketGateway({
  namespace: "/sync",
  cors: {
    origin: (process.env.FRONTEND_URL || "http://localhost:5173").trimEnd(),
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private userSockets: Map<string, Set<string>> = new Map();
  private socketUsers: Map<string, string> = new Map();
  private zoneRooms: Map<string, Set<string>> = new Map();

  constructor(
    @Inject(forwardRef(() => RealtimeService))
    private readonly realtimeService: RealtimeService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`);

    const token = client.handshake.auth?.token || client.handshake.query?.token;
    if (!token) {
      this.logger.warn(`Client ${client.id} connected without token`);
      client.disconnect();
      return;
    }

    const user = await this.realtimeService.verifyToken(token as string);
    if (!user) {
      this.logger.warn(`Client ${client.id} provided invalid token`);
      client.disconnect();
      return;
    }

    const userId = user.sub;
    this.socketUsers.set(client.id, userId);

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);

    client.join(`user:${userId}`);
    this.logger.log(`User ${userId} joined room user:${userId}`);

    client.emit("connected", {
      userId,
      message: "Connected to Momen Tasks sync",
    });
  }

  handleDisconnect(client: Socket): void {
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
      this.socketUsers.delete(client.id);
      this.logger.log(`User ${userId} disconnected from client ${client.id}`);
    }
  }

  @SubscribeMessage("zone:join")
  handleZoneJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { zoneId: string },
  ): void {
    const userId = this.socketUsers.get(client.id);
    if (!userId) return;

    const room = `zone:${data.zoneId}`;
    client.join(room);
    this.logger.log(`User ${userId} joined zone room ${room}`);

    if (!this.zoneRooms.has(data.zoneId)) {
      this.zoneRooms.set(data.zoneId, new Set());
    }
    this.zoneRooms.get(data.zoneId)!.add(userId);

    this.server.to(room).emit("zone:member:added", {
      zoneId: data.zoneId,
      userId,
    });
  }

  @SubscribeMessage("zone:leave")
  handleZoneLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { zoneId: string },
  ): void {
    const userId = this.socketUsers.get(client.id);
    if (!userId) return;

    const room = `zone:${data.zoneId}`;
    client.leave(room);
    this.logger.log(`User ${userId} left zone room ${room}`);

    this.zoneRooms.get(data.zoneId)?.delete(userId);

    this.server.to(room).emit("zone:member:removed", {
      zoneId: data.zoneId,
      userId,
    });
  }

  @SubscribeMessage("sync:reconnect")
  handleSyncReconnect(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { clientId: string },
  ): void {
    const userId = this.socketUsers.get(client.id);
    if (!userId) return;

    this.logger.log(
      `User ${userId} requested sync reconnect for client ${data.clientId}`,
    );
    client.emit("sync:reconnect", {
      userId,
      message: "Sync reconnection initiated",
    });
  }

  sendToUser(userId: string, event: string, data: any): void {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendToZone(zoneId: string, event: string, data: any): void {
    this.server.to(`zone:${zoneId}`).emit(event, data);
  }
}
