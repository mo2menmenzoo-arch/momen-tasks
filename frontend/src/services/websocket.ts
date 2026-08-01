import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

const WS_URL = import.meta.env.VITE_WS_URL || '';

class WebSocketManager {
  private socket: Socket | null = null;
  private queryClient: ReturnType<typeof useQueryClient> | null = null;

  setQueryClient(qc: ReturnType<typeof useQueryClient>) {
    this.queryClient = qc;
  }

  connect(token: string) {
    if (this.socket?.connected) return;

    const wsEndpoint = WS_URL ? `${WS_URL}/sync` : '/sync';
    this.socket = io(wsEndpoint, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    this.socket.on('connect', () => console.log('[WS] Connected'));

    this.socket.on('task:created', (data) => {
      this.queryClient?.setQueryData(['tasks'], (old: any) => {
        if (!Array.isArray(old)) return old;
        return [...old, data.data];
      });
    });

    this.socket.on('task:updated', (data) => {
      this.queryClient?.setQueryData(['tasks'], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((t: any) => t.id === data.taskId ? { ...t, ...data.changes } : t);
      });
    });

    this.socket.on('task:deleted', (data) => {
      this.queryClient?.setQueryData(['tasks'], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.filter((t: any) => t.id !== data.taskId);
      });
    });

    this.socket.on('zone:updated', () => this.queryClient?.invalidateQueries({ queryKey: ['zones'] }));
    this.socket.on('zone:deleted', () => this.queryClient?.invalidateQueries({ queryKey: ['zones'] }));
    this.socket.on('focus-session:started', () => this.queryClient?.invalidateQueries({ queryKey: ['focus-sessions'] }));
    this.socket.on('focus-session:ended', () => this.queryClient?.invalidateQueries({ queryKey: ['focus-sessions'] }));
  }

  joinZone(zoneId: string) { this.socket?.emit('zone:join', { zoneId }); }
  leaveZone(zoneId: string) { this.socket?.emit('zone:leave', { zoneId }); }
  disconnect() { this.socket?.disconnect(); this.socket = null; }
}

export const wsManager = new WebSocketManager();
