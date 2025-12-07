/**
 * Offline Storage using IndexedDB
 * 
 * Provides offline-first data persistence for ClearMind.
 * All data is stored locally and synced to server when online.
 * 
 * This enables:
 * - Instant load times (no network latency)
 * - Offline editing
 * - Conflict resolution
 * - Incremental sync
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

/**
 * Database schema for ClearMind offline storage.
 */
interface ClearMindDB extends DBSchema {
  pages: {
    key: number;
    value: {
      id: number;
      workspaceId: number;
      parentId: number | null;
      title: string;
      icon: string | null;
      coverImage: string | null;
      position: number;
      archived: boolean;
      createdBy: number;
      createdAt: string;
      updatedAt: string;
      _localVersion: number; // For conflict resolution
      _syncStatus: 'synced' | 'pending' | 'conflict';
    };
    indexes: { 'by-workspace': number; 'by-parent': number };
  };
  blocks: {
    key: number;
    value: {
      id: number;
      pageId: number;
      parentBlockId: number | null;
      type: string;
      content: string;
      position: number;
      createdBy: number;
      createdAt: string;
      updatedAt: string;
      _localVersion: number;
      _syncStatus: 'synced' | 'pending' | 'conflict';
    };
    indexes: { 'by-page': number };
  };
  databases: {
    key: number;
    value: {
      id: number;
      workspaceId: number;
      name: string;
      icon: string | null;
      description: string | null;
      schema: string;
      createdBy: number;
      createdAt: string;
      updatedAt: string;
      _localVersion: number;
      _syncStatus: 'synced' | 'pending' | 'conflict';
    };
    indexes: { 'by-workspace': number };
  };
  databaseItems: {
    key: number;
    value: {
      id: number;
      databaseId: number;
      properties: string;
      position: number;
      archived: boolean;
      createdBy: number;
      createdAt: string;
      updatedAt: string;
      _localVersion: number;
      _syncStatus: 'synced' | 'pending' | 'conflict';
    };
    indexes: { 'by-database': number };
  };
  timelineEvents: {
    key: number;
    value: {
      id: number;
      userId: number;
      databaseItemId: number | null;
      title: string;
      startTime: string;
      estimatedDuration: number | null;
      actualDuration: number | null;
      color: string | null;
      icon: string | null;
      completed: boolean;
      completedAt: string | null;
      createdAt: string;
      updatedAt: string;
      _localVersion: number;
      _syncStatus: 'synced' | 'pending' | 'conflict';
    };
    indexes: { 'by-user': number; 'by-date': string };
  };
  syncQueue: {
    key: number;
    value: {
      id: number;
      entityType: string;
      entityId: number;
      operation: 'create' | 'update' | 'delete';
      data: any;
      timestamp: string;
      retryCount: number;
    };
  };
}

let dbInstance: IDBPDatabase<ClearMindDB> | null = null;

/**
 * Initialize the IndexedDB database.
 */
export async function initDB(): Promise<IDBPDatabase<ClearMindDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ClearMindDB>('clearmind', 1, {
    upgrade(db) {
      // Pages store
      if (!db.objectStoreNames.contains('pages')) {
        const pageStore = db.createObjectStore('pages', { keyPath: 'id' });
        pageStore.createIndex('by-workspace', 'workspaceId');
        pageStore.createIndex('by-parent', 'parentId');
      }

      // Blocks store
      if (!db.objectStoreNames.contains('blocks')) {
        const blockStore = db.createObjectStore('blocks', { keyPath: 'id' });
        blockStore.createIndex('by-page', 'pageId');
      }

      // Databases store
      if (!db.objectStoreNames.contains('databases')) {
        const dbStore = db.createObjectStore('databases', { keyPath: 'id' });
        dbStore.createIndex('by-workspace', 'workspaceId');
      }

      // Database items store
      if (!db.objectStoreNames.contains('databaseItems')) {
        const itemStore = db.createObjectStore('databaseItems', { keyPath: 'id' });
        itemStore.createIndex('by-database', 'databaseId');
      }

      // Timeline events store
      if (!db.objectStoreNames.contains('timelineEvents')) {
        const eventStore = db.createObjectStore('timelineEvents', { keyPath: 'id' });
        eventStore.createIndex('by-user', 'userId');
        eventStore.createIndex('by-date', 'startTime');
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    },
  });

  return dbInstance;
}

/**
 * Get the database instance.
 */
export async function getDB(): Promise<IDBPDatabase<ClearMindDB>> {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
}

// ============================================================================
// PAGES
// ============================================================================

export async function getPageFromCache(id: number) {
  const db = await getDB();
  return await db.get('pages', id);
}

export async function getPagesByWorkspace(workspaceId: number) {
  const db = await getDB();
  return await db.getAllFromIndex('pages', 'by-workspace', workspaceId);
}

export async function savePageToCache(page: any) {
  const db = await getDB();
  await db.put('pages', {
    ...page,
    _localVersion: (page._localVersion || 0) + 1,
    _syncStatus: 'pending',
  });
}

export async function deletePageFromCache(id: number) {
  const db = await getDB();
  await db.delete('pages', id);
}

// ============================================================================
// BLOCKS
// ============================================================================

export async function getBlocksByPage(pageId: number) {
  const db = await getDB();
  return await db.getAllFromIndex('blocks', 'by-page', pageId);
}

export async function saveBlockToCache(block: any) {
  const db = await getDB();
  await db.put('blocks', {
    ...block,
    _localVersion: (block._localVersion || 0) + 1,
    _syncStatus: 'pending',
  });
}

export async function deleteBlockFromCache(id: number) {
  const db = await getDB();
  await db.delete('blocks', id);
}

// ============================================================================
// DATABASES
// ============================================================================

export async function getDatabaseFromCache(id: number) {
  const db = await getDB();
  return await db.get('databases', id);
}

export async function getDatabasesByWorkspace(workspaceId: number) {
  const db = await getDB();
  return await db.getAllFromIndex('databases', 'by-workspace', workspaceId);
}

export async function saveDatabaseToCache(database: any) {
  const db = await getDB();
  await db.put('databases', {
    ...database,
    _localVersion: (database._localVersion || 0) + 1,
    _syncStatus: 'pending',
  });
}

// ============================================================================
// DATABASE ITEMS
// ============================================================================

export async function getDatabaseItemsByDatabase(databaseId: number) {
  const db = await getDB();
  return await db.getAllFromIndex('databaseItems', 'by-database', databaseId);
}

export async function saveDatabaseItemToCache(item: any) {
  const db = await getDB();
  await db.put('databaseItems', {
    ...item,
    _localVersion: (item._localVersion || 0) + 1,
    _syncStatus: 'pending',
  });
}

export async function deleteDatabaseItemFromCache(id: number) {
  const db = await getDB();
  await db.delete('databaseItems', id);
}

// ============================================================================
// TIMELINE EVENTS
// ============================================================================

export async function getTimelineEventsByUser(userId: number) {
  const db = await getDB();
  return await db.getAllFromIndex('timelineEvents', 'by-user', userId);
}

export async function saveTimelineEventToCache(event: any) {
  const db = await getDB();
  await db.put('timelineEvents', {
    ...event,
    _localVersion: (event._localVersion || 0) + 1,
    _syncStatus: 'pending',
  });
}

export async function deleteTimelineEventFromCache(id: number) {
  const db = await getDB();
  await db.delete('timelineEvents', id);
}

// ============================================================================
// SYNC QUEUE
// ============================================================================

/**
 * Add an operation to the sync queue.
 */
export async function addToSyncQueue(
  entityType: string,
  entityId: number,
  operation: 'create' | 'update' | 'delete',
  data: any
) {
  const db = await getDB();
  await db.add('syncQueue', {
    id: Date.now(),
    entityType,
    entityId,
    operation,
    data,
    timestamp: new Date().toISOString(),
    retryCount: 0,
  });
}

/**
 * Get all pending sync operations.
 */
export async function getSyncQueue() {
  const db = await getDB();
  return await db.getAll('syncQueue');
}

/**
 * Remove an operation from the sync queue.
 */
export async function removeFromSyncQueue(id: number) {
  const db = await getDB();
  await db.delete('syncQueue', id);
}

/**
 * Clear the entire sync queue (after successful sync).
 */
export async function clearSyncQueue() {
  const db = await getDB();
  const tx = db.transaction('syncQueue', 'readwrite');
  await tx.store.clear();
  await tx.done;
}

// ============================================================================
// SYNC UTILITIES
// ============================================================================

/**
 * Mark entity as synced.
 */
export async function markAsSynced(storeName: keyof ClearMindDB, id: number) {
  const db = await getDB();
  const entity = await db.get(storeName as any, id);
  if (entity) {
    (entity as any)._syncStatus = 'synced';
    await db.put(storeName as any, entity);
  }
}

/**
 * Check if there are pending changes to sync.
 */
export async function hasPendingChanges(): Promise<boolean> {
  const db = await getDB();
  const queue = await db.getAll('syncQueue');
  return queue.length > 0;
}

/**
 * Initialize offline storage when app loads.
 */
export async function initOfflineStorage() {
  try {
    await initDB();
    console.log('[OfflineStorage] Initialized successfully');
  } catch (error) {
    console.error('[OfflineStorage] Failed to initialize:', error);
  }
}
