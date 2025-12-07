import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * ClearMind Database Schema
 * 
 * This schema supports the core features of ClearMind:
 * - Block-based pages with hierarchy
 * - Flexible databases with multiple views
 * - Visual timeline planning
 * - Mood tracking
 * - Automations
 * - Real-time collaboration
 * - Notifications
 * 
 * Design principles:
 * - Use camelCase for column names to match TypeScript conventions
 * - Store flexible data as JSON (block content, database properties)
 * - Include createdAt/updatedAt timestamps for auditing and sync
 * - Use soft deletes (archived) instead of hard deletes
 * - Add indexes on frequently queried columns
 */

// ============================================================================
// USERS & AUTHENTICATION
// ============================================================================

/**
 * Core user table backing auth flow.
 * Extended with ClearMind-specific fields for sensory profiles and preferences.
 */
export const users = mysqlTable("users", {
  /** Surrogate primary key. Auto-incremented numeric value managed by the database. */
  id: int("id").autoincrement().primaryKey(),
  
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  
  /** User role for access control */
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  /** Sensory profile theme preference for accessibility */
  sensoryProfile: mysqlEnum("sensoryProfile", [
    "adhd",          // ADHD-Optimized (default) - visual anchors, colorful
    "highContrast",  // High Contrast - WCAG AAA compliance
    "dyslexia",      // Dyslexia-Friendly - special fonts, increased spacing
    "lowStim",       // Low Stimulation - minimal colors, reduced motion
    "standard"       // Standard - clean, modern design
  ]).default("adhd").notNull(),
  
  /** Notification preferences stored as JSON */
  notificationSettings: text("notificationSettings"), // { email: boolean, push: boolean, quietHours: { start: string, end: string } }
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// WORKSPACES
// ============================================================================

/**
 * Workspaces allow users to organize their content into separate contexts.
 * For MVP, each user has a single default workspace.
 * Future: Support multiple workspaces per user.
 */
export const workspaces = mysqlTable("workspaces", {
  id: int("id").autoincrement().primaryKey(),
  
  /** Workspace name */
  name: varchar("name", { length: 255 }).notNull(),
  
  /** Emoji or icon name for visual identification */
  icon: varchar("icon", { length: 50 }),
  
  /** Owner of the workspace */
  ownerId: int("ownerId").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = typeof workspaces.$inferInsert;

// ============================================================================
// PAGES & BLOCKS
// ============================================================================

/**
 * Pages are the primary organizational unit in ClearMind.
 * They support hierarchical nesting (parent-child relationships).
 */
export const pages = mysqlTable("pages", {
  id: int("id").autoincrement().primaryKey(),
  
  /** Workspace this page belongs to */
  workspaceId: int("workspaceId").notNull(),
  
  /** Parent page ID for nested pages. Null for root pages. */
  parentId: int("parentId"),
  
  /** Page title */
  title: varchar("title", { length: 500 }).notNull(),
  
  /** Emoji or icon name */
  icon: varchar("icon", { length: 50 }),
  
  /** URL to cover image */
  coverImage: varchar("coverImage", { length: 500 }),
  
  /** Order within parent (for sorting sibling pages) */
  position: int("position").notNull().default(0),
  
  /** Soft delete flag */
  archived: boolean("archived").default(false).notNull(),
  
  /** User who created this page */
  createdBy: int("createdBy").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;

/**
 * Blocks are individual content units within pages.
 * They support various types (text, heading, list, image, database, etc.)
 * and can be nested for indentation.
 */
export const blocks = mysqlTable("blocks", {
  id: int("id").autoincrement().primaryKey(),
  
  /** Page this block belongs to */
  pageId: int("pageId").notNull(),
  
  /** Parent block ID for nested blocks. Null for root-level blocks. */
  parentBlockId: int("parentBlockId"),
  
  /** Block type determines how content is rendered */
  type: varchar("type", { length: 50 }).notNull(), // text, heading1, heading2, heading3, bulletList, numberedList, checkbox, image, link, code, quote, divider, database, etc.
  
  /** Block-specific content and properties stored as JSON */
  content: text("content").notNull(), // { text: string, format: string, url: string, alt: string, etc. }
  
  /** Order within parent (for sorting sibling blocks) */
  position: int("position").notNull().default(0),
  
  /** User who created this block */
  createdBy: int("createdBy").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Block = typeof blocks.$inferSelect;
export type InsertBlock = typeof blocks.$inferInsert;

// ============================================================================
// DATABASES
// ============================================================================

/**
 * Databases are structured collections of items with defined properties (columns).
 * They support multiple views (table, kanban, calendar, gallery, etc.)
 */
export const databases = mysqlTable("databases", {
  id: int("id").autoincrement().primaryKey(),
  
  /** Workspace this database belongs to */
  workspaceId: int("workspaceId").notNull(),
  
  /** Database name */
  name: varchar("name", { length: 255 }).notNull(),
  
  /** Emoji or icon name */
  icon: varchar("icon", { length: 50 }),
  
  /** Database description */
  description: text("description"),
  
  /** Property definitions (columns) stored as JSON */
  schema: text("schema").notNull(), // { properties: [{ id: string, name: string, type: string, options: any }] }
  
  /** User who created this database */
  createdBy: int("createdBy").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Database = typeof databases.$inferSelect;
export type InsertDatabase = typeof databases.$inferInsert;

/**
 * Database views define different ways to visualize and interact with database items.
 * Each view has its own configuration (filters, sorts, grouping, visible properties).
 */
export const databaseViews = mysqlTable("databaseViews", {
  id: int("id").autoincrement().primaryKey(),
  
  /** Database this view belongs to */
  databaseId: int("databaseId").notNull(),
  
  /** View name */
  name: varchar("name", { length: 255 }).notNull(),
  
  /** View type determines how items are displayed */
  type: mysqlEnum("type", ["table", "kanban", "calendar", "gallery", "list", "timeline"]).notNull(),
  
  /** View-specific configuration stored as JSON */
  config: text("config").notNull(), // { filters: [], sorts: [], groupBy: string, visibleProperties: [] }
  
  /** Order within database (for sorting views) */
  position: int("position").notNull().default(0),
  
  /** User who created this view */
  createdBy: int("createdBy").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DatabaseView = typeof databaseViews.$inferSelect;
export type InsertDatabaseView = typeof databaseViews.$inferInsert;

/**
 * Database items are individual rows/cards in a database.
 * Property values are stored as JSON for flexibility.
 */
export const databaseItems = mysqlTable("databaseItems", {
  id: int("id").autoincrement().primaryKey(),
  
  /** Database this item belongs to */
  databaseId: int("databaseId").notNull(),
  
  /** Property values stored as JSON */
  properties: text("properties").notNull(), // { prop_1: "value", prop_2: 123, prop_3: { start: "2025-12-07T09:00:00Z", end: "2025-12-07T11:00:00Z" } }
  
  /** Order within database (for manual sorting) */
  position: int("position").notNull().default(0),
  
  /** Soft delete flag */
  archived: boolean("archived").default(false).notNull(),
  
  /** User who created this item */
  createdBy: int("createdBy").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DatabaseItem = typeof databaseItems.$inferSelect;
export type InsertDatabaseItem = typeof databaseItems.$inferInsert;

// ============================================================================
// VISUAL TIMELINE
// ============================================================================

/**
 * Timeline events represent scheduled blocks of time in the visual timeline.
 * They can be linked to database items or standalone events.
 */
export const timelineEvents = mysqlTable("timelineEvents", {
  id: int("id").autoincrement().primaryKey(),
  
  /** User this event belongs to */
  userId: int("userId").notNull(),
  
  /** Optional link to database item (for tasks, projects, etc.) */
  databaseItemId: int("databaseItemId"),
  
  /** Event title */
  title: varchar("title", { length: 500 }).notNull(),
  
  /** Start time of the event */
  startTime: timestamp("startTime").notNull(),
  
  /** Estimated duration in minutes */
  estimatedDuration: int("estimatedDuration"),
  
  /** Actual duration in minutes (filled when completed) */
  actualDuration: int("actualDuration"),
  
  /** Color for visual coding */
  color: varchar("color", { length: 20 }),
  
  /** Emoji or icon name */
  icon: varchar("icon", { length: 50 }),
  
  /** Completion status */
  completed: boolean("completed").default(false).notNull(),
  
  /** When the event was completed */
  completedAt: timestamp("completedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type InsertTimelineEvent = typeof timelineEvents.$inferInsert;

// ============================================================================
// MOOD TRACKING
// ============================================================================

/**
 * Mood entries track user well-being and productivity patterns.
 * Can be linked to timeline events to correlate mood with activities.
 */
export const moodEntries = mysqlTable("moodEntries", {
  id: int("id").autoincrement().primaryKey(),
  
  /** User this mood entry belongs to */
  userId: int("userId").notNull(),
  
  /** When the mood was recorded */
  timestamp: timestamp("timestamp").notNull(),
  
  /** Mood value on a 1-5 scale (1=very bad, 5=very good) */
  moodValue: int("moodValue"), // 1-5
  
  /** Emoji representation of mood */
  moodEmoji: varchar("moodEmoji", { length: 10 }),
  
  /** Optional notes about the mood */
  notes: text("notes"),
  
  /** Optional link to timeline event */
  linkedEventId: int("linkedEventId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = typeof moodEntries.$inferInsert;

// ============================================================================
// AUTOMATIONS
// ============================================================================

/**
 * Automations define triggers, conditions, and actions to automate workflows.
 * Examples: auto-assign tasks, send notifications, update properties, etc.
 */
export const automations = mysqlTable("automations", {
  id: int("id").autoincrement().primaryKey(),
  
  /** Workspace this automation belongs to */
  workspaceId: int("workspaceId").notNull(),
  
  /** Automation name */
  name: varchar("name", { length: 255 }).notNull(),
  
  /** Trigger configuration stored as JSON */
  trigger: text("trigger").notNull(), // { type: "databaseItemChanged", databaseId: 123, propertyId: "prop_2" }
  
  /** Conditional logic stored as JSON */
  conditions: text("conditions"), // [{ propertyId: "prop_2", operator: "is", value: "opt_3" }]
  
  /** Actions to perform stored as JSON */
  actions: text("actions").notNull(), // [{ type: "updateProperty", propertyId: "prop_5", value: "{{now}}" }]
  
  /** Whether this automation is active */
  enabled: boolean("enabled").default(true).notNull(),
  
  /** User who created this automation */
  createdBy: int("createdBy").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Automation = typeof automations.$inferSelect;
export type InsertAutomation = typeof automations.$inferInsert;

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Notifications inform users about mentions, deadlines, assignments, and updates.
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  
  /** User this notification is for */
  userId: int("userId").notNull(),
  
  /** Notification type */
  type: mysqlEnum("type", ["mention", "deadline", "assignment", "automation", "collaboration"]).notNull(),
  
  /** Notification title */
  title: varchar("title", { length: 500 }).notNull(),
  
  /** Notification content/message */
  content: text("content"),
  
  /** Type of entity this notification links to */
  linkType: varchar("linkType", { length: 50 }), // page, block, databaseItem, etc.
  
  /** ID of linked entity */
  linkId: int("linkId"),
  
  /** Whether the notification has been read */
  read: boolean("read").default(false).notNull(),
  
  /** Whether the notification has been delivered */
  delivered: boolean("delivered").default(false).notNull(),
  
  /** How the notification was/will be delivered */
  deliveryMethod: mysqlEnum("deliveryMethod", ["inApp", "email", "push"]).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ============================================================================
// COMMENTS & COLLABORATION
// ============================================================================

/**
 * Comments enable collaboration on pages, blocks, and database items.
 * Support @mentions to notify specific users.
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  
  /** Type of entity this comment is on */
  parentType: mysqlEnum("parentType", ["page", "block", "databaseItem"]).notNull(),
  
  /** ID of parent entity */
  parentId: int("parentId").notNull(),
  
  /** Comment content (supports markdown) */
  content: text("content").notNull(),
  
  /** User IDs mentioned in this comment (stored as JSON array) */
  mentions: text("mentions"), // [1, 2, 3]
  
  /** User who created this comment */
  createdBy: int("createdBy").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  
  /** Soft delete flag */
  archived: boolean("archived").default(false).notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

// ============================================================================
// SHARING & PERMISSIONS
// ============================================================================

/**
 * Page shares define who has access to a page and what permissions they have.
 * Supports public links and user-specific sharing.
 */
export const pageShares = mysqlTable("pageShares", {
  id: int("id").autoincrement().primaryKey(),
  
  /** Page being shared */
  pageId: int("pageId").notNull(),
  
  /** User being granted access (null for public links) */
  userId: int("userId"),
  
  /** Permission level */
  permission: mysqlEnum("permission", ["view", "edit", "admin"]).notNull(),
  
  /** Public share link token (for shareable links) */
  shareToken: varchar("shareToken", { length: 64 }),
  
  /** Optional password for public links */
  password: varchar("password", { length: 255 }),
  
  /** Whether this share is active */
  enabled: boolean("enabled").default(true).notNull(),
  
  /** User who created this share */
  createdBy: int("createdBy").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PageShare = typeof pageShares.$inferSelect;
export type InsertPageShare = typeof pageShares.$inferInsert;

// ============================================================================
// SYNC METADATA
// ============================================================================

/**
 * Sync metadata tracks the last sync time for offline-first architecture.
 * Used to implement incremental sync and conflict resolution.
 */
export const syncMetadata = mysqlTable("syncMetadata", {
  id: int("id").autoincrement().primaryKey(),
  
  /** User this sync metadata belongs to */
  userId: int("userId").notNull(),
  
  /** Entity type being synced */
  entityType: varchar("entityType", { length: 50 }).notNull(), // page, block, databaseItem, etc.
  
  /** Entity ID */
  entityId: int("entityId").notNull(),
  
  /** Last sync timestamp */
  lastSyncedAt: timestamp("lastSyncedAt").notNull(),
  
  /** Vector clock or Lamport timestamp for ordering operations */
  version: int("version").notNull().default(0),
  
  /** Hash of entity content for change detection */
  contentHash: varchar("contentHash", { length: 64 }),
});

export type SyncMetadata = typeof syncMetadata.$inferSelect;
export type InsertSyncMetadata = typeof syncMetadata.$inferInsert;
