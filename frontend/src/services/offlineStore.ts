import { openDB, DBSchema } from 'idb';
import { api } from './api';

interface OfflineIncident {
  offline_client_id: string;
  title: string;
  category: string;
  severity: string;
  road_segment_id?: string;
  lat: number;
  lng: number;
  state: string;
  district: string;
  description: string;
  reporter_name: string;
  reporter_phone?: string;
  image_url?: string;
  created_at: string;
  sync_attempts: number;
}

interface SmartLogisticsDB extends DBSchema {
  offline_incidents: {
    key: string;
    value: OfflineIncident;
    indexes: { 'by-date': string };
  };
}

const DB_NAME = 'ner_smartlogistics_offline';
const DB_VERSION = 1;

export async function initOfflineDB() {
  return openDB<SmartLogisticsDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('offline_incidents')) {
        const store = db.createObjectStore('offline_incidents', { keyPath: 'offline_client_id' });
        store.createIndex('by-date', 'created_at');
      }
    },
  });
}

export async function saveOfflineIncident(data: Omit<OfflineIncident, 'offline_client_id' | 'created_at' | 'sync_attempts'>): Promise<OfflineIncident> {
  const db = await initOfflineDB();
  const offline_client_id = `OFF-CLI-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const record: OfflineIncident = {
    ...data,
    offline_client_id,
    created_at: new Date().toISOString(),
    sync_attempts: 0
  };
  await db.put('offline_incidents', record);
  return record;
}

export async function getPendingIncidents(): Promise<OfflineIncident[]> {
  const db = await initOfflineDB();
  return db.getAll('offline_incidents');
}

export async function removeSyncedIncident(offline_client_id: string): Promise<void> {
  const db = await initOfflineDB();
  await db.delete('offline_incidents', offline_client_id);
}

export async function syncPendingIncidents(): Promise<{ synced: number; failed: number }> {
  const pending = await getPendingIncidents();
  if (pending.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      await api.post('/incidents', item);
      await removeSyncedIncident(item.offline_client_id);
      synced++;
    } catch (err) {
      console.error(`Failed to sync incident ${item.offline_client_id}:`, err);
      // Increment attempt
      const db = await initOfflineDB();
      item.sync_attempts += 1;
      await db.put('offline_incidents', item);
      failed++;
    }
  }

  return { synced, failed };
}

