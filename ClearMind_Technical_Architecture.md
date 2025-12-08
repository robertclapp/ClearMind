# ClearMind: Technical Architecture Document

**Version:** 1.0  
**Date:** December 7, 2025  
**Author:** Manus AI  
**Status:** Approved for Development

---

## 1. Architecture Overview

ClearMind is built on a modern, offline-first architecture that prioritizes performance, accessibility, and developer experience. The application uses a local-first approach where data is stored on the user's device by default and synced to the cloud when online, ensuring instant performance and true offline functionality.

### Core Architectural Principles

**Offline-First:** All data operations happen locally first, with background synchronization to the cloud. This ensures instant performance regardless of network conditions and provides a superior user experience compared to traditional cloud-first applications.

**Type Safety:** End-to-end type safety from database to UI using TypeScript, Drizzle ORM, and tRPC. This reduces bugs, improves developer experience, and enables confident refactoring.

**Component-Based:** Modular, reusable components using React 19 and shadcn/ui. This accelerates development, ensures consistency, and simplifies maintenance.

**Accessibility-Native:** Accessibility is built into the foundation, not added as an afterthought. Semantic HTML, ARIA labels, keyboard navigation, and screen reader support are core requirements for every component.

**Progressive Enhancement:** The application works at a basic level for all users and enhances capabilities based on device capabilities, network conditions, and user preferences.

---

## 2. Technology Stack

### Frontend

**React 19:** Latest version with improved performance, concurrent features, and server components support. Chosen for its maturity, ecosystem, and developer experience.

**TypeScript 5.9:** Strict type checking for compile-time error detection. Ensures type safety across the entire application.

**Tailwind CSS 4:** Utility-first CSS framework with CSS variables for theming. Enables rapid UI development with consistent design system.

**Wouter 3:** Lightweight client-side routing library. Minimal bundle size and simple API compared to React Router.

**TanStack Query (React Query):** Data fetching, caching, and synchronization. Handles loading states, error handling, and cache invalidation automatically.

**tRPC 11:** End-to-end type-safe API layer. Eliminates need for manual API contracts and ensures frontend and backend stay in sync.

**Lexical (Facebook):** Extensible rich text editor framework. Provides block-based editing, collaboration support, and accessibility out of the box.

**Framer Motion:** Animation library with support for `prefers-reduced-motion`. Adds delightful micro-interactions while respecting accessibility preferences.

**Radix UI:** Unstyled, accessible component primitives. Provides robust accessibility features (keyboard navigation, ARIA, focus management) for complex UI patterns.

**Lucide React:** Icon library with 1000+ icons. Consistent, customizable, and optimized for performance.

**date-fns:** Modern date utility library. Simpler and more lightweight than Moment.js.

### Backend

**Express 4:** Minimal and flexible Node.js web application framework. Provides routing, middleware, and HTTP utilities.

**tRPC 11:** Type-safe API layer that eliminates the need for REST or GraphQL. Procedures are defined once and consumed with full type safety on the frontend.

**Drizzle ORM:** TypeScript-first ORM with excellent type inference. Generates types from schema and provides type-safe query builder.

**MySQL/TiDB:** Production database. TiDB provides MySQL compatibility with horizontal scalability.

**Manus OAuth:** Authentication provider with JWT tokens. Handles user registration, login, and session management.

**Superjson:** Serialization library that preserves JavaScript types (Date, Map, Set, etc.) across the network. Enables returning Drizzle rows directly from tRPC procedures.

### AI & External Services

**Manus LLM API:** AI writing assistance, task breakdown, summarization, and brainstorming. Credentials injected from platform, no manual setup required.

**Manus Whisper API:** Voice transcription for quick capture. Converts speech to text with high accuracy.

**Manus Image Generation API:** Text-to-image generation for visual assets. Creates custom illustrations and diagrams from prompts.

**Manus S3:** File storage for images, audio, and attachments. Provides presigned URLs for secure access.

### Development Tools

**Vite 7:** Fast build tool with hot module replacement. Significantly faster than Webpack for development.

**ESBuild:** JavaScript bundler for production builds. Extremely fast compilation.

**Vitest:** Unit testing framework with Vite integration. Fast test execution with watch mode.

**Prettier:** Code formatter for consistent style. Eliminates debates about formatting.

**TSX:** TypeScript execution environment for development. Enables running TypeScript files directly.

**Drizzle Kit:** Database migration tool. Generates and applies schema changes.

### Deployment & Infrastructure

**Manus Hosting:** Built-in hosting with custom domain support. Simplifies deployment and reduces infrastructure management.

**GitHub Actions:** CI/CD pipeline for automated testing and deployment. Runs tests on every commit and deploys on merge to main.

**Cloudflare (Optional):** CDN and DDoS protection for custom domains. Improves global performance and security.

---

## 3. Database Schema

### Overview

The database schema is designed to support the core features of ClearMind: block-based pages, flexible databases, visual timeline, mood tracking, and collaboration. The schema uses a hierarchical structure for pages and blocks, with separate tables for databases and their items.

### Schema Design Principles

**Normalization:** Avoid data duplication while maintaining query performance. Use foreign keys and relations appropriately.

**JSON for Flexibility:** Store flexible, schema-less data (block content, database properties) as JSON. This allows for rapid iteration without migrations.

**Timestamps:** Every table includes `createdAt` and `updatedAt` timestamps for auditing and sync.

**Soft Deletes:** Use `archived` or `deletedAt` fields instead of hard deletes. Enables undo and recovery.

**Indexes:** Add indexes on frequently queried columns (userId, parentId, etc.) for performance.

### Core Tables

#### users

Stores user authentication and profile information.

```typescript
{
  id: int (primary key, auto-increment),
  openId: varchar(64) (unique, not null), // Manus OAuth identifier
  name: text,
  email: varchar(320),
  loginMethod: varchar(64),
  role: enum('user', 'admin') (default 'user'),
  sensoryProfile: enum('adhd', 'highContrast', 'dyslexia', 'lowStim', 'standard') (default 'adhd'),
  notificationSettings: text (JSON), // email, push, quiet hours, etc.
  createdAt: timestamp (default now),
  updatedAt: timestamp (default now, on update now),
  lastSignedIn: timestamp (default now)
}
```

#### workspaces

Supports multiple workspaces per user (future feature, single workspace for MVP).

```typescript
{
  id: int (primary key, auto-increment),
  name: varchar(255) (not null),
  icon: varchar(50), // emoji or icon name
  ownerId: int (foreign key to users.id),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### pages

Hierarchical page structure with parent-child relationships.

```typescript
{
  id: int (primary key, auto-increment),
  workspaceId: int (foreign key to workspaces.id),
  parentId: int (foreign key to pages.id, nullable), // null for root pages
  title: varchar(500) (not null),
  icon: varchar(50), // emoji or icon name
  coverImage: varchar(500), // URL to cover image
  position: int (not null), // order within parent
  archived: boolean (default false),
  createdBy: int (foreign key to users.id),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### blocks

Individual content blocks within pages. Stores block type and content as JSON.

```typescript
{
  id: int (primary key, auto-increment),
  pageId: int (foreign key to pages.id),
  parentBlockId: int (foreign key to blocks.id, nullable), // for nested blocks
  type: varchar(50) (not null), // text, heading, list, image, database, etc.
  content: text (JSON), // block-specific content and properties
  position: int (not null), // order within parent
  createdBy: int (foreign key to users.id),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Block Content Examples:**

```json
// Text block
{
  "text": "This is a paragraph with **bold** text.",
  "format": "markdown"
}

// Heading block
{
  "text": "Section Title",
  "level": 2
}

// Image block
{
  "url": "https://storage.example.com/image.jpg",
  "alt": "Description of image",
  "width": 800,
  "height": 600
}

// Database block (inline view)
{
  "databaseId": 123,
  "viewId": 456,
  "viewType": "table"
}
```

#### databases

Database definitions with schema and views.

```typescript
{
  id: int (primary key, auto-increment),
  workspaceId: int (foreign key to workspaces.id),
  name: varchar(255) (not null),
  icon: varchar(50),
  description: text,
  schema: text (JSON), // property definitions (columns)
  createdBy: int (foreign key to users.id),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Schema JSON Example:**

```json
{
  "properties": [
    {
      "id": "prop_1",
      "name": "Task Name",
      "type": "text",
      "required": true
    },
    {
      "id": "prop_2",
      "name": "Status",
      "type": "select",
      "options": [
        { "id": "opt_1", "name": "To Do", "color": "gray" },
        { "id": "opt_2", "name": "In Progress", "color": "blue" },
        { "id": "opt_3", "name": "Done", "color": "green" }
      ]
    },
    {
      "id": "prop_3",
      "name": "Due Date",
      "type": "date",
      "includeTime": true
    },
    {
      "id": "prop_4",
      "name": "Time Spent",
      "type": "timeTracking",
      "unit": "minutes"
    }
  ]
}
```

#### databaseViews

Different views of a database (table, kanban, calendar, etc.).

```typescript
{
  id: int (primary key, auto-increment),
  databaseId: int (foreign key to databases.id),
  name: varchar(255) (not null),
  type: enum('table', 'kanban', 'calendar', 'gallery', 'list', 'timeline'),
  config: text (JSON), // view-specific configuration (filters, sorts, grouping, etc.)
  position: int (not null),
  createdBy: int (foreign key to users.id),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**View Config JSON Example:**

```json
{
  "filters": [
    {
      "propertyId": "prop_2",
      "operator": "is",
      "value": "opt_1"
    }
  ],
  "sorts": [
    {
      "propertyId": "prop_3",
      "direction": "asc"
    }
  ],
  "groupBy": "prop_2", // for kanban view
  "visibleProperties": ["prop_1", "prop_2", "prop_3", "prop_4"]
}
```

#### databaseItems

Individual rows/cards in databases. Property values stored as JSON.

```typescript
{
  id: int (primary key, auto-increment),
  databaseId: int (foreign key to databases.id),
  properties: text (JSON), // property values
  position: int (not null), // order within database
  archived: boolean (default false),
  createdBy: int (foreign key to users.id),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Properties JSON Example:**

```json
{
  "prop_1": "Implement user authentication",
  "prop_2": "opt_2", // In Progress
  "prop_3": "2025-12-15T17:00:00Z",
  "prop_4": {
    "totalMinutes": 120,
    "sessions": [
      {
        "start": "2025-12-07T09:00:00Z",
        "end": "2025-12-07T11:00:00Z",
        "minutes": 120
      }
    ]
  }
}
```

#### timelineEvents

Visual timeline entries linked to database items or standalone.

```typescript
{
  id: int (primary key, auto-increment),
  userId: int (foreign key to users.id),
  databaseItemId: int (foreign key to databaseItems.id, nullable), // null for standalone events
  title: varchar(500) (not null),
  startTime: timestamp (not null),
  estimatedDuration: int, // minutes
  actualDuration: int, // minutes, filled when completed
  color: varchar(20),
  icon: varchar(50),
  completed: boolean (default false),
  completedAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### moodEntries

Mood check-ins for tracking well-being and productivity patterns.

```typescript
{
  id: int (primary key, auto-increment),
  userId: int (foreign key to users.id),
  timestamp: timestamp (not null),
  moodValue: int (1-5 scale),
  moodEmoji: varchar(10),
  notes: text,
  linkedEventId: int (foreign key to timelineEvents.id, nullable),
  createdAt: timestamp
}
```

#### automations

Automation definitions with triggers and actions.

```typescript
{
  id: int (primary key, auto-increment),
  workspaceId: int (foreign key to workspaces.id),
  name: varchar(255) (not null),
  trigger: text (JSON), // trigger type and configuration
  conditions: text (JSON), // conditional logic
  actions: text (JSON), // actions to perform
  enabled: boolean (default true),
  createdBy: int (foreign key to users.id),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Automation JSON Example:**

```json
{
  "trigger": {
    "type": "databaseItemChanged",
    "databaseId": 123,
    "propertyId": "prop_2"
  },
  "conditions": [
    {
      "propertyId": "prop_2",
      "operator": "is",
      "value": "opt_3" // Done
    }
  ],
  "actions": [
    {
      "type": "updateProperty",
      "propertyId": "prop_5", // Completed Date
      "value": "{{now}}"
    },
    {
      "type": "sendNotification",
      "userId": "{{createdBy}}",
      "message": "Task completed: {{prop_1}}"
    }
  ]
}
```

#### notifications

User notifications for mentions, deadlines, and updates.

```typescript
{
  id: int (primary key, auto-increment),
  userId: int (foreign key to users.id),
  type: enum('mention', 'deadline', 'assignment', 'automation', 'collaboration'),
  title: varchar(500) (not null),
  content: text,
  linkType: varchar(50), // page, databaseItem, etc.
  linkId: int, // ID of linked entity
  read: boolean (default false),
  delivered: boolean (default false),
  deliveryMethod: enum('inApp', 'email', 'push'),
  createdAt: timestamp
}
```

#### comments

Comments on pages and database items for collaboration.

```typescript
{
  id: int (primary key, auto-increment),
  parentType: enum('page', 'block', 'databaseItem'),
  parentId: int (not null),
  content: text (not null),
  mentions: text (JSON), // array of user IDs mentioned
  createdBy: int (foreign key to users.id),
  createdAt: timestamp,
  updatedAt: timestamp,
  archived: boolean (default false)
}
```

### Indexes

For optimal query performance, the following indexes should be created:

```sql
-- Users
CREATE INDEX idx_users_openId ON users(openId);

-- Pages
CREATE INDEX idx_pages_workspaceId ON pages(workspaceId);
CREATE INDEX idx_pages_parentId ON pages(parentId);
CREATE INDEX idx_pages_createdBy ON pages(createdBy);

-- Blocks
CREATE INDEX idx_blocks_pageId ON blocks(pageId);
CREATE INDEX idx_blocks_parentBlockId ON blocks(parentBlockId);

-- Databases
CREATE INDEX idx_databases_workspaceId ON databases(workspaceId);

-- Database Items
CREATE INDEX idx_databaseItems_databaseId ON databaseItems(databaseId);
CREATE INDEX idx_databaseItems_createdBy ON databaseItems(createdBy);

-- Timeline Events
CREATE INDEX idx_timelineEvents_userId ON timelineEvents(userId);
CREATE INDEX idx_timelineEvents_databaseItemId ON timelineEvents(databaseItemId);
CREATE INDEX idx_timelineEvents_startTime ON timelineEvents(startTime);

-- Mood Entries
CREATE INDEX idx_moodEntries_userId ON moodEntries(userId);
CREATE INDEX idx_moodEntries_timestamp ON moodEntries(timestamp);

-- Notifications
CREATE INDEX idx_notifications_userId ON notifications(userId);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Comments
CREATE INDEX idx_comments_parentType_parentId ON comments(parentType, parentId);
CREATE INDEX idx_comments_createdBy ON comments(createdBy);
```

---

## 4. Offline-First Architecture

### Local Storage Strategy

ClearMind uses IndexedDB for browser-based local storage, providing a robust, asynchronous database that can store large amounts of structured data.

**Storage Structure:** Each workspace has its own IndexedDB database. Object stores for pages, blocks, databases, databaseItems, timelineEvents, moodEntries, and sync metadata. Indexes on frequently queried fields (userId, parentId, etc.).

**Data Flow:** User creates or edits content → Save to IndexedDB immediately → Update UI optimistically → Queue sync operation → Background sync to server when online → Resolve conflicts if any → Update local data with server response.

### Sync Engine

The sync engine handles bidirectional synchronization between local IndexedDB and the server database, with automatic conflict resolution.

**Sync Strategy:** Incremental sync (only changed data since last sync). Operational Transformation (OT) for real-time collaboration. Conflict-free Replicated Data Types (CRDTs) for automatic conflict resolution. Vector clocks or Lamport timestamps for ordering operations.

**Sync Process:**

1. **Detect Changes:** Track modified, created, and deleted entities in IndexedDB
2. **Generate Operations:** Convert changes to operations with timestamps and user ID
3. **Send to Server:** Batch operations and send via tRPC mutation
4. **Server Processing:** Apply operations to server database, detect conflicts
5. **Conflict Resolution:** Use CRDTs or last-write-wins with timestamps
6. **Send Response:** Return applied operations and any server changes
7. **Apply Server Changes:** Update IndexedDB with server operations
8. **Update UI:** Refresh affected components

**Conflict Resolution:** For text content, use Operational Transformation or CRDTs (Yjs, Automerge). For database properties, use last-write-wins with timestamp comparison. For deletions, tombstone records to prevent resurrection. For structural changes (page hierarchy), use vector clocks for ordering.

### Offline Detection

The application detects online/offline status and adjusts behavior accordingly.

```typescript
// Online/offline detection
window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);

// Periodic connectivity check
setInterval(async () => {
  try {
    await fetch('/api/health', { method: 'HEAD' });
    setOnline(true);
  } catch {
    setOnline(false);
  }
}, 30000); // Check every 30 seconds
```

**UI Indicators:** Show online/offline status in header. Display sync status (syncing, synced, offline). Show warning when attempting operations that require network. Queue operations and show pending count.

---

## 5. API Layer (tRPC)

### tRPC Overview

tRPC provides end-to-end type safety without code generation. Procedures are defined on the server and consumed on the client with full TypeScript inference.

**Benefits:** No manual API contracts or OpenAPI specs. Type errors caught at compile time. Automatic IDE autocomplete and type hints. Simplified API development and maintenance.

### Router Structure

```typescript
// server/routers.ts
export const appRouter = router({
  auth: authRouter,
  pages: pagesRouter,
  blocks: blocksRouter,
  databases: databasesRouter,
  timeline: timelineRouter,
  mood: moodRouter,
  automations: automationsRouter,
  notifications: notificationsRouter,
  ai: aiRouter,
  sync: syncRouter,
});

export type AppRouter = typeof appRouter;
```

### Example Procedures

```typescript
// pages router
const pagesRouter = router({
  // Get page by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      return await getPageById(input.id, ctx.user.id);
    }),

  // Create new page
  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      parentId: z.number().optional(),
      icon: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await createPage({
        ...input,
        workspaceId: ctx.user.workspaceId,
        createdBy: ctx.user.id,
      });
    }),

  // Update page
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      icon: z.string().optional(),
      parentId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await updatePage(input.id, input, ctx.user.id);
    }),

  // Delete page (soft delete)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return await archivePage(input.id, ctx.user.id);
    }),

  // Get page hierarchy
  getHierarchy: protectedProcedure
    .query(async ({ ctx }) => {
      return await getPageHierarchy(ctx.user.workspaceId);
    }),
});
```

### Client Usage

```typescript
// client/src/pages/PageEditor.tsx
import { trpc } from '@/lib/trpc';

function PageEditor({ pageId }: { pageId: number }) {
  // Query with automatic caching and refetching
  const { data: page, isLoading } = trpc.pages.getById.useQuery({ id: pageId });

  // Mutation with optimistic updates
  const updatePage = trpc.pages.update.useMutation({
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await trpc.useUtils().pages.getById.cancel({ id: pageId });

      // Snapshot previous value
      const previousPage = trpc.useUtils().pages.getById.getData({ id: pageId });

      // Optimistically update
      trpc.useUtils().pages.getById.setData({ id: pageId }, (old) => ({
        ...old,
        ...newData,
      }));

      return { previousPage };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      trpc.useUtils().pages.getById.setData(
        { id: pageId },
        context.previousPage
      );
    },
    onSettled: () => {
      // Refetch after mutation
      trpc.useUtils().pages.getById.invalidate({ id: pageId });
    },
  });

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <input
        value={page.title}
        onChange={(e) => updatePage.mutate({ id: pageId, title: e.target.value })}
      />
    </div>
  );
}
```

---

## 6. AI Integration

### AI Services

ClearMind integrates three AI services from the Manus platform: LLM for text generation, Whisper for voice transcription, and Image Generation for visual assets.

### LLM Integration (Writing Assistance & Task Breakdown)

```typescript
// server/_core/llm.ts
import { invokeLLM } from './llm';

// AI task breakdown
export async function breakdownTask(taskDescription: string) {
  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that breaks down tasks into manageable steps. For each step, provide a title, description, and estimated duration in minutes.',
      },
      {
        role: 'user',
        content: `Break down this task: ${taskDescription}`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'task_breakdown',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  estimatedMinutes: { type: 'number' },
                },
                required: ['title', 'description', 'estimatedMinutes'],
              },
            },
          },
          required: ['steps'],
        },
      },
    },
  });

  return JSON.parse(response.choices[0].message.content);
}

// Writing assistance
export async function improveWriting(text: string, instruction: string) {
  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: 'You are a helpful writing assistant. Improve the given text according to the user\'s instruction.',
      },
      {
        role: 'user',
        content: `Instruction: ${instruction}\n\nText: ${text}`,
      },
    ],
  });

  return response.choices[0].message.content;
}
```

### Voice Transcription Integration

```typescript
// server/_core/voiceTranscription.ts
import { transcribeAudio } from './voiceTranscription';

// Transcribe voice note
export async function transcribeVoiceNote(audioUrl: string, language?: string) {
  const result = await transcribeAudio({
    audioUrl,
    language,
    prompt: 'Transcribe this voice note with proper punctuation.',
  });

  return {
    text: result.text,
    language: result.language,
    segments: result.segments, // Timestamped segments
  };
}
```

### Image Generation Integration

```typescript
// server/_core/imageGeneration.ts
import { generateImage } from './imageGeneration';

// Generate image from prompt
export async function generateImageAsset(prompt: string, originalImage?: string) {
  const result = await generateImage({
    prompt,
    originalImages: originalImage ? [{
      url: originalImage,
      mimeType: 'image/jpeg',
    }] : undefined,
  });

  return {
    url: result.url,
  };
}
```

### tRPC AI Procedures

```typescript
// server/routers/ai.ts
const aiRouter = router({
  breakdownTask: protectedProcedure
    .input(z.object({ taskDescription: z.string() }))
    .mutation(async ({ input }) => {
      return await breakdownTask(input.taskDescription);
    }),

  improveWriting: protectedProcedure
    .input(z.object({
      text: z.string(),
      instruction: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await improveWriting(input.text, input.instruction);
    }),

  transcribeVoice: protectedProcedure
    .input(z.object({
      audioUrl: z.string(),
      language: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await transcribeVoiceNote(input.audioUrl, input.language);
    }),

  generateImage: protectedProcedure
    .input(z.object({
      prompt: z.string(),
      originalImage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await generateImageAsset(input.prompt, input.originalImage);
    }),
});
```

---

## 7. Accessibility Implementation

### Semantic HTML

All components use semantic HTML elements with proper structure and hierarchy.

```tsx
// Good: Semantic structure
<article>
  <header>
    <h1>Page Title</h1>
    <nav aria-label="Page actions">
      <button>Share</button>
      <button>Delete</button>
    </nav>
  </header>
  <main>
    <section>
      <h2>Section Title</h2>
      <p>Content...</p>
    </section>
  </main>
</article>

// Bad: Non-semantic structure
<div>
  <div>
    <div>Page Title</div>
    <div>
      <div>Share</div>
      <div>Delete</div>
    </div>
  </div>
  <div>
    <div>
      <div>Section Title</div>
      <div>Content...</div>
    </div>
  </div>
</div>
```

### ARIA Labels

Use ARIA labels to provide context for screen readers.

```tsx
// Button with icon only
<button aria-label="Delete page">
  <TrashIcon />
</button>

// Navigation landmark
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/pages">Pages</a></li>
  </ul>
</nav>

// Live region for dynamic updates
<div aria-live="polite" aria-atomic="true">
  {syncStatus === 'syncing' && 'Syncing...'}
  {syncStatus === 'synced' && 'All changes saved'}
</div>
```

### Keyboard Navigation

All interactive elements must be keyboard accessible with visible focus indicators.

```tsx
// Keyboard event handlers
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleClick();
  }
  if (e.key === 'Escape') {
    handleClose();
  }
}

// Focus management
const firstFocusableElement = dialogRef.current?.querySelector(
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
);
firstFocusableElement?.focus();

// Focus trap in modal
function trapFocus(e: KeyboardEvent) {
  const focusableElements = dialogRef.current?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
}
```

### Screen Reader Support

Provide descriptive text and context for screen reader users.

```tsx
// Visually hidden text for screen readers
<span className="sr-only">
  Navigate to page: {page.title}
</span>

// Descriptive button text
<button>
  <span className="sr-only">Edit</span>
  <PencilIcon aria-hidden="true" />
</button>

// Status announcements
<div role="status" aria-live="polite">
  {isLoading && 'Loading page content'}
  {error && `Error: ${error.message}`}
  {data && 'Page loaded successfully'}
</div>
```

### Sensory Profile Themes

Implement theme switching with CSS variables.

```css
/* client/src/index.css */

/* ADHD-Optimized (Default) */
:root {
  --color-background: oklch(98% 0 0);
  --color-foreground: oklch(20% 0 0);
  --color-primary: oklch(60% 0.15 250);
  --color-accent: oklch(70% 0.12 150);
  --font-family: 'Inter', sans-serif;
  --font-size-base: 16px;
  --line-height-base: 1.6;
  --motion-duration: 200ms;
}

/* High Contrast */
[data-theme="highContrast"] {
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(0% 0 0);
  --color-primary: oklch(40% 0.2 250);
  --color-accent: oklch(30% 0.15 150);
  --font-weight-base: 600;
  --border-width: 2px;
}

/* Dyslexia-Friendly */
[data-theme="dyslexia"] {
  --font-family: 'Atkinson Hyperlegible', sans-serif;
  --font-size-base: 18px;
  --line-height-base: 1.8;
  --letter-spacing: 0.05em;
  --color-background: oklch(95% 0.01 80); /* Off-white to reduce glare */
}

/* Low Stimulation */
[data-theme="lowStim"] {
  --color-background: oklch(90% 0 0);
  --color-foreground: oklch(30% 0 0);
  --color-primary: oklch(50% 0.05 250);
  --color-accent: oklch(50% 0.05 250);
  --motion-duration: 0ms; /* No animations */
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```tsx
// Theme context
const ThemeContext = createContext<{
  theme: SensoryProfile;
  setTheme: (theme: SensoryProfile) => void;
}>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<SensoryProfile>('adhd');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

---

## 8. Performance Optimization

### Code Splitting

Use dynamic imports and React.lazy for code splitting.

```tsx
// Lazy load heavy components
const BlockEditor = lazy(() => import('./components/BlockEditor'));
const DatabaseView = lazy(() => import('./components/DatabaseView'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/page/:id" element={<BlockEditor />} />
        <Route path="/database/:id" element={<DatabaseView />} />
      </Routes>
    </Suspense>
  );
}
```

### Virtual Scrolling

Use virtual scrolling for long lists and large databases.

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function DatabaseTable({ items }: { items: DatabaseItem[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Row height
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <DatabaseRow item={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Image Optimization

Optimize images with lazy loading and responsive sizes.

```tsx
function OptimizedImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      srcSet={`
        ${src}?w=400 400w,
        ${src}?w=800 800w,
        ${src}?w=1200 1200w
      `}
      sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
    />
  );
}
```

### Debouncing & Throttling

Use debouncing for search and throttling for scroll events.

```tsx
import { useDebouncedCallback } from 'use-debounce';

function SearchInput() {
  const [query, setQuery] = useState('');

  const debouncedSearch = useDebouncedCallback((value: string) => {
    // Perform search
    trpc.pages.search.query({ query: value });
  }, 500);

  return (
    <input
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        debouncedSearch(e.target.value);
      }}
    />
  );
}
```

---

## 9. Testing Strategy

### Unit Tests (Vitest)

Test individual functions and components in isolation.

```typescript
// server/db.test.ts
import { describe, it, expect } from 'vitest';
import { createPage, getPageById } from './db';

describe('Page Database Functions', () => {
  it('creates a new page', async () => {
    const page = await createPage({
      title: 'Test Page',
      workspaceId: 1,
      createdBy: 1,
    });

    expect(page.title).toBe('Test Page');
    expect(page.id).toBeDefined();
  });

  it('retrieves page by ID', async () => {
    const page = await getPageById(1, 1);
    expect(page).toBeDefined();
    expect(page.id).toBe(1);
  });
});
```

### Integration Tests

Test tRPC procedures with database interactions.

```typescript
// server/routers/pages.test.ts
import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

function createTestContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: 'test-user',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      workspaceId: 1,
    },
    req: {} as any,
    res: {} as any,
  };
}

describe('Pages Router', () => {
  it('creates a new page', async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const page = await caller.pages.create({
      title: 'New Page',
    });

    expect(page.title).toBe('New Page');
    expect(page.createdBy).toBe(1);
  });

  it('requires authentication', async () => {
    const ctx = { user: null, req: {} as any, res: {} as any };
    const caller = appRouter.createCaller(ctx);

    await expect(caller.pages.create({ title: 'Test' })).rejects.toThrow('UNAUTHORIZED');
  });
});
```

### Accessibility Tests

Test accessibility with axe-core and manual testing.

```typescript
// client/src/components/Button.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from './Button';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('is keyboard accessible', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<Button onClick={handleClick}>Click me</Button>);
    const button = getByRole('button');

    button.focus();
    expect(document.activeElement).toBe(button);

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### E2E Tests (Playwright)

Test critical user flows end-to-end.

```typescript
// e2e/page-creation.spec.ts
import { test, expect } from '@playwright/test';

test('user can create and edit a page', async ({ page }) => {
  await page.goto('/');
  await page.click('text=New Page');

  // Type page title
  await page.fill('[placeholder="Page title"]', 'My New Page');

  // Add content block
  await page.click('text=Add block');
  await page.fill('[contenteditable]', 'This is my first paragraph.');

  // Save and verify
  await page.waitForSelector('text=Saved');
  await page.reload();

  expect(await page.textContent('h1')).toBe('My New Page');
  expect(await page.textContent('[contenteditable]')).toContain('This is my first paragraph.');
});

test('page works offline', async ({ page, context }) => {
  await page.goto('/');
  await page.click('text=New Page');
  await page.fill('[placeholder="Page title"]', 'Offline Page');

  // Go offline
  await context.setOffline(true);

  // Continue editing
  await page.click('text=Add block');
  await page.fill('[contenteditable]', 'This was written offline.');

  // Should show offline indicator
  await expect(page.locator('text=Offline')).toBeVisible();

  // Go back online
  await context.setOffline(false);

  // Should sync
  await expect(page.locator('text=Synced')).toBeVisible();
});
```

---

## 10. Deployment Architecture

### Development Environment

**Local Development:** Run `pnpm dev` to start Vite dev server (frontend) and Express server (backend). Hot module replacement for instant feedback. Local MySQL/TiDB database or use Manus-provided database.

**Environment Variables:** Stored in `.env` file (not committed). Includes `DATABASE_URL`, `JWT_SECRET`, Manus API keys, etc.

### Production Environment

**Hosting:** Manus built-in hosting with custom domain support. Automatic SSL/TLS certificates. Global CDN for static assets. Automatic scaling based on traffic.

**Database:** Manus-provided MySQL/TiDB database. Automatic backups and point-in-time recovery. Connection pooling for performance.

**File Storage:** Manus S3 for images, audio, and attachments. Presigned URLs for secure access. Automatic CDN distribution.

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Type check
        run: pnpm check

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Manus
        run: |
          # Deployment handled by Manus platform
          # Triggered automatically on checkpoint creation
          echo "Deployment triggered"
```

### Monitoring & Logging

**Application Monitoring:** Error tracking with Sentry or similar. Performance monitoring with Web Vitals. User analytics with privacy-respecting tools (Plausible, Fathom).

**Server Logging:** Structured logging with Winston or Pino. Log levels (error, warn, info, debug). Centralized log aggregation (optional).

**Alerts:** Error rate thresholds. Performance degradation alerts. Database connection issues. Sync failures.

---

## 11. Security Considerations

### Authentication & Authorization

**Authentication:** Manus OAuth with JWT tokens. Secure session management with httpOnly cookies. Token expiration and refresh. Two-factor authentication support (future).

**Authorization:** Role-based access control (admin, user). Resource-level permissions (page ownership, sharing). Check permissions on every API call. Never trust client-side authorization.

### Data Protection

**Encryption at Rest:** Sensitive data encrypted in database. Encryption keys managed securely. Optional end-to-end encryption for private pages (future).

**Encryption in Transit:** TLS/SSL for all API calls. Secure WebSocket connections (wss://). HTTPS-only cookies.

**Input Validation:** Validate all user input on server. Use Zod schemas for type-safe validation. Sanitize HTML content to prevent XSS. Parameterized queries to prevent SQL injection.

### Rate Limiting

Implement rate limiting to prevent abuse.

```typescript
// server/_core/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit auth attempts
  message: 'Too many login attempts, please try again later.',
});
```

### CORS Configuration

```typescript
// server/_core/index.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

## 12. Scalability Considerations

### Database Optimization

**Indexing:** Create indexes on frequently queried columns. Use composite indexes for multi-column queries. Monitor slow queries and optimize.

**Query Optimization:** Use SELECT with specific columns, not SELECT *. Limit result sets with pagination. Use database-level aggregation instead of application-level.

**Connection Pooling:** Reuse database connections. Configure pool size based on load. Monitor connection usage.

### Caching Strategy

**Client-Side Caching:** TanStack Query for API response caching. IndexedDB for offline data. Service Worker for static asset caching (PWA).

**Server-Side Caching:** Redis for session storage (future). Database query result caching. CDN caching for static assets.

### Horizontal Scaling

**Stateless API:** No server-side session state (use JWT). Any API server can handle any request. Load balancer distributes requests.

**Database Scaling:** Read replicas for read-heavy workloads. Sharding by workspace ID (future). TiDB provides automatic horizontal scaling.

**File Storage:** S3 provides automatic scaling. CDN distributes load globally.

---

## 13. Conclusion

This technical architecture provides a solid foundation for building ClearMind as a neurodivergent-first, offline-capable productivity platform. The architecture prioritizes performance, accessibility, and developer experience while remaining manageable for a solo developer.

Key architectural decisions include offline-first with IndexedDB and sync engine, type-safe API with tRPC, flexible database schema with JSON properties, comprehensive accessibility with sensory profiles, AI integration for reduced friction, and Manus platform for simplified deployment.

The architecture is designed to scale from MVP to production while maintaining code quality, performance, and accessibility standards. By following this architecture, ClearMind can deliver a superior user experience compared to existing productivity tools while remaining technically feasible for a solo developer to build and maintain.
