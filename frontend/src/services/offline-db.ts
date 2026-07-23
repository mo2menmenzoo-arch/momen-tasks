import { openDB, type IDBPDatabase } from 'idb';
import type { Task, Zone } from '@/types';

export interface SyncOutboxEntry {
  id?: number;
  entityType: string;
  entityId: string;
  operation: string;
  timestamp: string;
  data: Record<string, unknown>;
}

interface MomenDB {
  tasks: { key: string; value: Task; indexes: { 'by-zone': string; 'by-status': string } };
  zones: { key: string; value: Zone };
  outbox: { key: number; value: SyncOutboxEntry; autoIncrement: true };
  meta: { key: string; value: { key: string; value: string } };
}

let dbPromise: Promise<IDBPDatabase<MomenDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MomenDB>('momen-tasks', 1, {
      upgrade(db) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-zone', 'zoneId');
        taskStore.createIndex('by-status', 'status');
        db.createObjectStore('zones', { keyPath: 'id' });
        db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
        db.createObjectStore('meta', { keyPath: 'key' });
      },
    });
  }
  return dbPromise;
}

export async function cacheTasks(tasks: Task[]) {
  const db = await getDB();
  const tx = db.transaction('tasks', 'readwrite');
  for (const task of tasks) {
    await tx.store.put(task);
  }
  await tx.done;
}

export async function getCachedTasks(): Promise<Task[]> {
  const db = await getDB();
  return db.getAll('tasks');
}

export async function cacheZones(zones: Zone[]) {
  const db = await getDB();
  const tx = db.transaction('zones', 'readwrite');
  for (const zone of zones) {
    await tx.store.put(zone);
  }
  await tx.done;
}

export async function getCachedZones(): Promise<Zone[]> {
  const db = await getDB();
  return db.getAll('zones');
}

export async function addToOutbox(entry: Omit<SyncOutboxEntry, 'id'>) {
  const db = await getDB();
  await db.add('outbox', entry);
}

export async function getOutboxEntries(): Promise<SyncOutboxEntry[]> {
  const db = await getDB();
  return db.getAll('outbox');
}

export async function clearOutbox() {
  const db = await getDB();
  await db.clear('outbox');
}

export async function setMeta(key: string, value: string) {
  const db = await getDB();
  await db.put('meta', { key, value });
}

export async function getMeta(key: string): Promise<string | null> {
  const db = await getDB();
  const entry = await db.get('meta', key);
  return entry?.value || null;
}

export async function getTask(id: string): Promise<Task | undefined> {
  const db = await getDB();
  return db.get('tasks', id);
}

export async function putTask(task: Task) {
  const db = await getDB();
  await db.put('tasks', task);
}

export async function deleteTask(id: string) {
  const db = await getDB();
  await db.delete('tasks', id);
}

export async function getZone(id: string): Promise<Zone | undefined> {
  const db = await getDB();
  return db.get('zones', id);
}

export async function putZone(zone: Zone) {
  const db = await getDB();
  await db.put('zones', zone);
}

export async function deleteZone(id: string) {
  const db = await getDB();
  await db.delete('zones', id);
}
