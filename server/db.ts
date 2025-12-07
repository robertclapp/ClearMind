import { eq, and, desc, asc, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  workspaces,
  InsertWorkspace,
  pages,
  InsertPage,
  blocks,
  InsertBlock,
  databases,
  InsertDatabase,
  databaseViews,
  InsertDatabaseView,
  databaseItems,
  InsertDatabaseItem,
  timelineEvents,
  InsertTimelineEvent,
  moodEntries,
  InsertMoodEntry,
  automations,
  InsertAutomation,
  notifications,
  InsertNotification,
  comments,
  InsertComment,
  pageShares,
  InsertPageShare,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

/**
 * Lazily create the drizzle instance so local tooling can run without a DB.
 */
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER FUNCTIONS
// ============================================================================

/**
 * Upsert user from OAuth callback.
 * Creates new user or updates existing user based on openId.
 * Automatically assigns admin role to owner.
 */
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

/**
 * Get user by Manus OAuth openId.
 */
export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user by ID.
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Update user sensory profile preference.
 */
export async function updateUserSensoryProfile(
  userId: number,
  sensoryProfile: "adhd" | "highContrast" | "dyslexia" | "lowStim" | "standard"
) {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ sensoryProfile }).where(eq(users.id, userId));
}

/**
 * Update user notification settings.
 */
export async function updateUserNotificationSettings(
  userId: number,
  settings: string // JSON string
) {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ notificationSettings: settings }).where(eq(users.id, userId));
}

// ============================================================================
// WORKSPACE FUNCTIONS
// ============================================================================

/**
 * Create a new workspace for a user.
 */
export async function createWorkspace(workspace: InsertWorkspace) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(workspaces).values(workspace);
  const insertId = (result as any).insertId;
  return { id: Number(insertId), ...workspace };
}

/**
 * Get workspace by ID.
 */
export async function getWorkspaceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all workspaces owned by a user.
 */
export async function getWorkspacesByOwner(ownerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(workspaces).where(eq(workspaces.ownerId, ownerId));
}

/**
 * Get or create default workspace for a user.
 * For MVP, each user has a single default workspace.
 */
export async function getOrCreateDefaultWorkspace(userId: number, userName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if user already has a workspace
  const existing = await getWorkspacesByOwner(userId);
  if (existing.length > 0) {
    return existing[0];
  }

  // Create default workspace
  return await createWorkspace({
    name: `${userName}'s Workspace`,
    icon: "🏠",
    ownerId: userId,
  });
}

// ============================================================================
// PAGE FUNCTIONS
// ============================================================================

/**
 * Create a new page.
 */
export async function createPage(page: InsertPage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(pages).values(page);
  const insertId = (result as any).insertId;
  return { id: Number(insertId), ...page };
}

/**
 * Get page by ID.
 */
export async function getPageById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(pages)
    .where(and(eq(pages.id, id), eq(pages.archived, false)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all root pages in a workspace (pages without parent).
 */
export async function getRootPages(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(pages)
    .where(and(eq(pages.workspaceId, workspaceId), isNull(pages.parentId), eq(pages.archived, false)))
    .orderBy(asc(pages.position));
}

/**
 * Get child pages of a parent page.
 */
export async function getChildPages(parentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(pages)
    .where(and(eq(pages.parentId, parentId), eq(pages.archived, false)))
    .orderBy(asc(pages.position));
}

/**
 * Get page hierarchy for a workspace.
 * Returns nested structure of pages.
 */
export async function getPageHierarchy(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];

  const allPages = await db
    .select()
    .from(pages)
    .where(and(eq(pages.workspaceId, workspaceId), eq(pages.archived, false)))
    .orderBy(asc(pages.position));

  // Build hierarchy
  const pageMap = new Map();
  const rootPages: any[] = [];

  allPages.forEach(page => {
    pageMap.set(page.id, { ...page, children: [] });
  });

  allPages.forEach(page => {
    const pageWithChildren = pageMap.get(page.id);
    if (page.parentId === null) {
      rootPages.push(pageWithChildren);
    } else {
      const parent = pageMap.get(page.parentId);
      if (parent) {
        parent.children.push(pageWithChildren);
      }
    }
  });

  return rootPages;
}

/**
 * Update page properties.
 */
export async function updatePage(id: number, updates: Partial<InsertPage>, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(pages).set(updates).where(eq(pages.id, id));
  return await getPageById(id, userId);
}

/**
 * Archive a page (soft delete).
 */
export async function archivePage(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(pages).set({ archived: true }).where(eq(pages.id, id));
  return { success: true };
}

/**
 * Get recent pages for a user.
 */
export async function getRecentPages(workspaceId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(pages)
    .where(and(eq(pages.workspaceId, workspaceId), eq(pages.archived, false)))
    .orderBy(desc(pages.updatedAt))
    .limit(limit);
}

// ============================================================================
// BLOCK FUNCTIONS
// ============================================================================

/**
 * Create a new block.
 */
export async function createBlock(block: InsertBlock) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(blocks).values(block);
  const insertId = (result as any).insertId;
  return { id: Number(insertId), ...block };
}

/**
 * Get all blocks for a page.
 */
export async function getBlocksByPage(pageId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(blocks)
    .where(eq(blocks.pageId, pageId))
    .orderBy(asc(blocks.position));
}

/**
 * Update block content.
 */
export async function updateBlock(id: number, updates: Partial<InsertBlock>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(blocks).set(updates).where(eq(blocks.id, id));
}

/**
 * Delete a block.
 */
export async function deleteBlock(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(blocks).where(eq(blocks.id, id));
  return { success: true };
}

// ============================================================================
// DATABASE FUNCTIONS
// ============================================================================

/**
 * Create a new database.
 */
export async function createDatabase(database: InsertDatabase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(databases).values(database);
  const insertId = (result as any).insertId;
  return { id: Number(insertId), ...database };
}

/**
 * Get database by ID.
 */
export async function getDatabaseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(databases).where(eq(databases.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all databases in a workspace.
 */
export async function getDatabasesByWorkspace(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(databases).where(eq(databases.workspaceId, workspaceId));
}

/**
 * Update database schema.
 */
export async function updateDatabase(id: number, updates: Partial<InsertDatabase>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(databases).set(updates).where(eq(databases.id, id));
  return await getDatabaseById(id);
}

// ============================================================================
// DATABASE VIEW FUNCTIONS
// ============================================================================

/**
 * Create a new database view.
 */
export async function createDatabaseView(view: InsertDatabaseView) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(databaseViews).values(view);
  const insertId = (result as any).insertId;
  return { id: Number(insertId), ...view };
}

/**
 * Get all views for a database.
 */
export async function getDatabaseViews(databaseId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(databaseViews)
    .where(eq(databaseViews.databaseId, databaseId))
    .orderBy(asc(databaseViews.position));
}

/**
 * Update database view configuration.
 */
export async function updateDatabaseView(id: number, updates: Partial<InsertDatabaseView>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(databaseViews).set(updates).where(eq(databaseViews.id, id));
}

// ============================================================================
// DATABASE ITEM FUNCTIONS
// ============================================================================

/**
 * Create a new database item.
 */
export async function createDatabaseItem(item: InsertDatabaseItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(databaseItems).values(item);
  const insertId = (result as any).insertId;
  return { id: Number(insertId), ...item };
}

/**
 * Get all items in a database.
 */
export async function getDatabaseItems(databaseId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(databaseItems)
    .where(and(eq(databaseItems.databaseId, databaseId), eq(databaseItems.archived, false)))
    .orderBy(asc(databaseItems.position));
}

/**
 * Get database item by ID.
 */
export async function getDatabaseItemById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(databaseItems).where(eq(databaseItems.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Update database item properties.
 */
export async function updateDatabaseItem(id: number, updates: Partial<InsertDatabaseItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(databaseItems).set(updates).where(eq(databaseItems.id, id));
  return await getDatabaseItemById(id);
}

/**
 * Archive a database item (soft delete).
 */
export async function archiveDatabaseItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(databaseItems).set({ archived: true }).where(eq(databaseItems.id, id));
  return { success: true };
}

// ============================================================================
// TIMELINE EVENT FUNCTIONS
// ============================================================================

/**
 * Create a new timeline event.
 */
export async function createTimelineEvent(event: InsertTimelineEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(timelineEvents).values(event);
  const insertId = (result as any).insertId;
  return { id: Number(insertId), ...event };
}

/**
 * Get timeline events for a user on a specific date.
 */
export async function getTimelineEventsByDate(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return await db
    .select()
    .from(timelineEvents)
    .where(eq(timelineEvents.userId, userId))
    .orderBy(asc(timelineEvents.startTime));
}

/**
 * Update timeline event.
 */
export async function updateTimelineEvent(id: number, updates: Partial<InsertTimelineEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(timelineEvents).set(updates).where(eq(timelineEvents.id, id));
}

/**
 * Delete timeline event.
 */
export async function deleteTimelineEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(timelineEvents).where(eq(timelineEvents.id, id));
  return { success: true };
}

// ============================================================================
// MOOD ENTRY FUNCTIONS
// ============================================================================

/**
 * Create a new mood entry.
 */
export async function createMoodEntry(entry: InsertMoodEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(moodEntries).values(entry);
  const insertId = (result as any).insertId;
  return { id: Number(insertId), ...entry };
}

/**
 * Get mood entries for a user within a date range.
 */
export async function getMoodEntriesByDateRange(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(moodEntries)
    .where(eq(moodEntries.userId, userId))
    .orderBy(desc(moodEntries.timestamp));
}

// ============================================================================
// NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Create a new notification.
 */
export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(notifications).values(notification);
  const insertId = (result as any).insertId;
  return { id: Number(insertId), ...notification };
}

/**
 * Get unread notifications for a user.
 */
export async function getUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
    .orderBy(desc(notifications.createdAt));
}

/**
 * Mark notification as read.
 */
export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
}

// ============================================================================
// COMMENT FUNCTIONS
// ============================================================================

/**
 * Create a new comment.
 */
export async function createComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(comments).values(comment);
  const insertId = (result as any).insertId;
  return { id: Number(insertId), ...comment };
}

/**
 * Get comments for a specific entity (page, block, or database item).
 */
export async function getCommentsByParent(
  parentType: "page" | "block" | "databaseItem",
  parentId: number
) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(comments)
    .where(and(eq(comments.parentType, parentType), eq(comments.parentId, parentId), eq(comments.archived, false)))
    .orderBy(asc(comments.createdAt));
}

/**
 * Update comment content.
 */
export async function updateComment(id: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(comments).set({ content }).where(eq(comments.id, id));
}

/**
 * Archive a comment (soft delete).
 */
export async function archiveComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(comments).set({ archived: true }).where(eq(comments.id, id));
  return { success: true };
}


// ============================================================================
// AUTOMATION FUNCTIONS
// ============================================================================

/**
 * Create a new automation.
 */
export async function createAutomation(automation: InsertAutomation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(automations).values(automation);
  const insertId = (result as any).insertId;
  return { id: Number(insertId), ...automation };
}

/**
 * Get all automations for a user.
 */
export async function getAutomationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(automations)
    .where(eq(automations.createdBy, userId))
    .orderBy(desc(automations.createdAt));
}

/**
 * Get enabled automations for a specific trigger.
 */
export async function getEnabledAutomationsByTrigger(userId: number, trigger: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(automations)
    .where(
      and(
        eq(automations.createdBy, userId),
        eq(automations.trigger, trigger),
        eq(automations.enabled, true)
      )
    );
}

/**
 * Update automation.
 */
export async function updateAutomation(id: number, updates: Partial<InsertAutomation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(automations).set(updates).where(eq(automations.id, id));
}

/**
 * Delete automation.
 */
export async function deleteAutomation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(automations).where(eq(automations.id, id));
  return { success: true };
}
