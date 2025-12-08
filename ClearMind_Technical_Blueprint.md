# ClearMind - Complete Technical Blueprint & Implementation Roadmap

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Status:** Foundation Complete, Incremental Development Ready

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Implementation Status](#current-implementation-status)
3. [Architecture Overview](#architecture-overview)
4. [Database Schema Reference](#database-schema-reference)
5. [API Routes Reference](#api-routes-reference)
6. [Feature Implementation Roadmap](#feature-implementation-roadmap)
7. [Component Library Specifications](#component-library-specifications)
8. [AI Integration Guide](#ai-integration-guide)
9. [Testing Strategy](#testing-strategy)
10. [CI/CD Pipeline](#cicd-pipeline)
11. [Deployment Guide](#deployment-guide)
12. [Performance Optimization](#performance-optimization)
13. [Security Considerations](#security-considerations)
14. [Accessibility Implementation](#accessibility-implementation)
15. [Future Enhancements](#future-enhancements)

---

## Executive Summary

ClearMind is a neurodivergent-first productivity platform that combines:
- **Notion's power**: Flexible databases, wikis, knowledge management
- **Tiimo's visual planning**: Timeline-based scheduling, executive function support
- **Unique differentiators**: Accessibility-first design, AI integration, offline-first architecture

### Technology Stack

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- tRPC 11 for type-safe API
- Tiptap for rich text editing
- IndexedDB for offline storage
- Wouter for routing

**Backend:**
- Node.js with Express
- tRPC for API layer
- Drizzle ORM with MySQL/TiDB
- Manus OAuth for authentication
- Built-in LLM, voice transcription, image generation APIs

**Infrastructure:**
- Manus hosting platform (built-in deployment)
- S3-compatible storage for files
- WebSocket support for real-time features (future)

---

## Current Implementation Status

### ✅ Completed Features (Foundation)

#### Backend Infrastructure
- [x] Complete database schema (14 tables)
- [x] tRPC API routes for all core features
- [x] Database helper functions
- [x] Manus OAuth integration
- [x] User management with role-based access

#### Frontend Core
- [x] Sensory profile accessibility system (5 themes)
- [x] Offline storage architecture (IndexedDB)
- [x] Rich text block editor (Tiptap)
- [x] App layout with sidebar navigation
- [x] Workspace management
- [x] Theme context with sensory profiles

#### Working Pages
- [x] Home dashboard with quick actions
- [x] Pages list with hierarchy view
- [x] Page detail editor with rich text
- [x] Timeline planner with event management
- [x] Settings with sensory profile selector
- [x] Databases list page
- [x] Database detail with table view

#### AI Integration
- [x] AI writing assistant component
- [x] Backend LLM integration
- [x] Task breakdown API
- [x] Voice transcription API
- [x] Image generation API

### 🚧 In Progress / Next Priority

#### Database System Enhancement
- [ ] Kanban board view
- [ ] Calendar view
- [ ] Gallery view
- [ ] List view
- [ ] Timeline view
- [ ] Advanced filtering
- [ ] Advanced sorting
- [ ] Property type editors (15+ types)
- [ ] Formula properties
- [ ] Relation properties
- [ ] Rollup properties

#### AI Features
- [ ] Task breakdown UI
- [ ] Voice recording component
- [ ] Image generation UI
- [ ] Smart automations builder
- [ ] AI-powered search

#### Collaboration
- [ ] Real-time editing (WebSocket)
- [ ] Comments system
- [ ] @mentions
- [ ] Activity feed
- [ ] Sharing & permissions

#### Mood Tracking
- [ ] Mood entry form
- [ ] Mood dashboard
- [ ] Mood analytics charts
- [ ] Mood patterns detection

#### Advanced Features
- [ ] Automation builder
- [ ] Notification center
- [ ] Search functionality
- [ ] Export/import
- [ ] Templates system

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │  IndexedDB   │  │  tRPC Client │      │
│  │  Components  │←→│   Offline    │←→│   Type-Safe  │      │
│  │              │  │   Storage    │  │     API      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ tRPC Router  │→ │  Drizzle ORM │→ │   MySQL/     │      │
│  │  Procedures  │  │   Helpers    │  │   TiDB       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         ↓                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Manus Auth  │  │  Manus LLM   │  │  Manus S3    │      │
│  │    OAuth     │  │  Voice/Image │  │   Storage    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Offline-First Architecture:**
1. User action → Update IndexedDB immediately (optimistic update)
2. Add to sync queue
3. Display updated UI instantly
4. Background sync to server when online
5. Conflict resolution on sync
6. Update local cache with server response

**Real-Time Collaboration (Future):**
1. User edit → Send to WebSocket server
2. Server broadcasts to all connected clients
3. Clients apply operational transformation
4. Resolve conflicts with last-write-wins + version vectors

---

## Database Schema Reference

### Core Tables

#### `users`
```typescript
{
  id: number (PK, auto-increment)
  openId: string (unique, Manus OAuth ID)
  name: string | null
  email: string | null
  loginMethod: string | null
  role: 'admin' | 'user'
  sensoryProfile: 'adhd' | 'highContrast' | 'dyslexia' | 'lowStim' | 'standard'
  createdAt: timestamp
  updatedAt: timestamp
  lastSignedIn: timestamp
}
```

#### `workspaces`
```typescript
{
  id: number (PK)
  name: string
  icon: string | null
  ownerId: number (FK → users.id)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `pages`
```typescript
{
  id: number (PK)
  workspaceId: number (FK → workspaces.id)
  parentId: number | null (FK → pages.id, self-referential)
  title: string
  icon: string | null
  coverImage: string | null
  position: number (for ordering)
  archived: boolean
  createdBy: number (FK → users.id)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `blocks`
```typescript
{
  id: number (PK)
  pageId: number (FK → pages.id)
  parentBlockId: number | null (FK → blocks.id, for nesting)
  type: string (text, heading1, heading2, heading3, list, code, image, etc.)
  content: text (JSON string with block-specific data)
  position: number
  createdBy: number (FK → users.id)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `databases`
```typescript
{
  id: number (PK)
  workspaceId: number (FK → workspaces.id)
  name: string
  icon: string | null
  description: text | null
  schema: text (JSON string defining properties)
  createdBy: number (FK → users.id)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Schema Format:**
```json
{
  "properties": [
    {
      "id": "unique-id",
      "name": "Property Name",
      "type": "title|text|number|select|multiselect|date|checkbox|url|email|phone|file|relation|formula|rollup|createdTime|createdBy|lastEditedTime|lastEditedBy",
      "required": boolean,
      "options": [] // for select/multiselect
      "relationTo": "database-id" // for relation
      "formula": "expression" // for formula
      "rollup": {...} // for rollup
    }
  ]
}
```

#### `databaseViews`
```typescript
{
  id: number (PK)
  databaseId: number (FK → databases.id)
  name: string
  type: 'table' | 'kanban' | 'calendar' | 'gallery' | 'list' | 'timeline'
  config: text (JSON with view-specific settings)
  position: number
  createdAt: timestamp
  updatedAt: timestamp
}
```

**View Config Format:**
```json
{
  "filters": [
    {
      "propertyId": "id",
      "operator": "equals|contains|startsWith|endsWith|isEmpty|isNotEmpty|>|<|>=|<=",
      "value": "any"
    }
  ],
  "sorts": [
    {
      "propertyId": "id",
      "direction": "asc|desc"
    }
  ],
  "groupBy": "propertyId",
  "visibleProperties": ["id1", "id2"],
  "kanbanGroupBy": "propertyId", // for kanban
  "calendarDateProperty": "propertyId", // for calendar
  "galleryImageProperty": "propertyId" // for gallery
}
```

#### `databaseItems`
```typescript
{
  id: number (PK)
  databaseId: number (FK → databases.id)
  properties: text (JSON with property values)
  position: number
  archived: boolean
  createdBy: number (FK → users.id)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Properties Format:**
```json
{
  "property-id-1": "value",
  "property-id-2": 42,
  "property-id-3": ["option1", "option2"],
  "property-id-4": "2024-12-07",
  "property-id-5": true
}
```

#### `timelineEvents`
```typescript
{
  id: number (PK)
  userId: number (FK → users.id)
  databaseItemId: number | null (FK → databaseItems.id, optional link)
  title: string
  startTime: timestamp
  estimatedDuration: number | null (minutes)
  actualDuration: number | null (minutes, tracked)
  color: string | null (hex color)
  icon: string | null (emoji)
  completed: boolean
  completedAt: timestamp | null
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `moodEntries`
```typescript
{
  id: number (PK)
  userId: number (FK → users.id)
  mood: number (1-10 scale)
  energy: number (1-10 scale)
  focus: number (1-10 scale)
  notes: text | null
  timestamp: timestamp
}
```

#### `automations`
```typescript
{
  id: number (PK)
  workspaceId: number (FK → workspaces.id)
  name: string
  trigger: text (JSON with trigger config)
  actions: text (JSON array of actions)
  enabled: boolean
  createdBy: number (FK → users.id)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Automation Format:**
```json
{
  "trigger": {
    "type": "propertyChanged|itemCreated|itemUpdated|dateReached|recurring",
    "databaseId": "id",
    "propertyId": "id",
    "condition": {...}
  },
  "actions": [
    {
      "type": "updateProperty|createItem|sendNotification|runScript",
      "config": {...}
    }
  ]
}
```

#### `notifications`
```typescript
{
  id: number (PK)
  userId: number (FK → users.id)
  type: string (mention, comment, reminder, automation, etc.)
  title: string
  content: text
  link: string | null (URL to relevant item)
  read: boolean
  createdAt: timestamp
}
```

#### `comments`
```typescript
{
  id: number (PK)
  pageId: number | null (FK → pages.id)
  databaseItemId: number | null (FK → databaseItems.id)
  parentCommentId: number | null (FK → comments.id, for threading)
  content: text
  createdBy: number (FK → users.id)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `pageShares`
```typescript
{
  id: number (PK)
  pageId: number (FK → pages.id)
  userId: number | null (FK → users.id, null = public)
  permission: 'view' | 'comment' | 'edit'
  createdBy: number (FK → users.id)
  createdAt: timestamp
}
```

#### `syncMetadata`
```typescript
{
  id: number (PK)
  userId: number (FK → users.id)
  entityType: string (page, block, databaseItem, etc.)
  entityId: number
  version: number
  lastSyncedAt: timestamp
}
```

### Indexes

**Performance-critical indexes:**
- `pages`: `(workspaceId, parentId)`, `(createdBy)`, `(updatedAt)`
- `blocks`: `(pageId, position)`, `(parentBlockId)`
- `databaseItems`: `(databaseId, position)`, `(archived)`
- `timelineEvents`: `(userId, startTime)`, `(completed)`
- `notifications`: `(userId, read, createdAt)`
- `comments`: `(pageId)`, `(databaseItemId)`, `(parentCommentId)`

---

## API Routes Reference

### Authentication Routes

```typescript
trpc.auth.me.useQuery()
// Returns current user or null

trpc.auth.logout.useMutation()
// Clears session cookie

trpc.auth.updateSensoryProfile.useMutation({
  sensoryProfile: 'adhd' | 'highContrast' | 'dyslexia' | 'lowStim' | 'standard'
})
```

### Workspace Routes

```typescript
trpc.workspaces.getOrCreateDefault.useQuery()
// Gets or creates default workspace for user

trpc.workspaces.getById.useQuery({ id: number })

trpc.workspaces.create.useMutation({
  name: string,
  icon?: string
})

trpc.workspaces.update.useMutation({
  id: number,
  name?: string,
  icon?: string
})
```

### Page Routes

```typescript
trpc.pages.getHierarchy.useQuery({ workspaceId: number })
// Returns nested page structure

trpc.pages.getRecent.useQuery({ workspaceId: number, limit: number })

trpc.pages.getById.useQuery({ id: number })

trpc.pages.create.useMutation({
  workspaceId: number,
  parentId?: number,
  title: string,
  icon?: string,
  position: number
})

trpc.pages.update.useMutation({
  id: number,
  title?: string,
  icon?: string,
  coverImage?: string,
  parentId?: number,
  position?: number
})

trpc.pages.archive.useMutation({ id: number })
```

### Block Routes

```typescript
trpc.blocks.getByPage.useQuery({ pageId: number })

trpc.blocks.create.useMutation({
  pageId: number,
  parentBlockId?: number,
  type: string,
  content: string, // JSON
  position: number
})

trpc.blocks.update.useMutation({
  id: number,
  type?: string,
  content?: string,
  position?: number,
  parentBlockId?: number
})

trpc.blocks.delete.useMutation({ id: number })
```

### Database Routes

```typescript
trpc.databases.getByWorkspace.useQuery({ workspaceId: number })

trpc.databases.getById.useQuery({ id: number })

trpc.databases.create.useMutation({
  workspaceId: number,
  name: string,
  icon?: string,
  description?: string,
  schema: string // JSON
})

trpc.databases.update.useMutation({
  id: number,
  name?: string,
  icon?: string,
  description?: string,
  schema?: string
})
```

### Database Item Routes

```typescript
trpc.databaseItems.getByDatabase.useQuery({ databaseId: number })

trpc.databaseItems.getById.useQuery({ id: number })

trpc.databaseItems.create.useMutation({
  databaseId: number,
  properties: string, // JSON
  position: number
})

trpc.databaseItems.update.useMutation({
  id: number,
  properties?: string,
  position?: number,
  archived?: boolean
})
```

### Timeline Routes

```typescript
trpc.timeline.getByDate.useQuery({ date: Date })

trpc.timeline.getById.useQuery({ id: number })

trpc.timeline.create.useMutation({
  title: string,
  startTime: Date,
  estimatedDuration?: number,
  color?: string,
  icon?: string,
  databaseItemId?: number
})

trpc.timeline.update.useMutation({
  id: number,
  title?: string,
  startTime?: Date,
  estimatedDuration?: number,
  actualDuration?: number,
  color?: string,
  icon?: string,
  completed?: boolean
})

trpc.timeline.delete.useMutation({ id: number })
```

### AI Routes

```typescript
trpc.ai.breakdownTask.useMutation({
  taskDescription: string
})
// Returns: { subtasks: string[], estimatedTime: number }

trpc.ai.improveWriting.useMutation({
  text: string,
  instruction: string
})
// Returns: { improved: string }

trpc.ai.transcribeVoice.useMutation({
  audioUrl: string,
  language?: string
})
// Returns: { text: string, language: string, segments: [...] }

trpc.ai.generateImage.useMutation({
  prompt: string,
  originalImages?: { url: string, mimeType: string }[]
})
// Returns: { url: string }
```

---

## Feature Implementation Roadmap

### Phase 1: Foundation (COMPLETED ✅)
- Core infrastructure
- Authentication
- Basic pages and blocks
- Timeline planner
- Settings
- Database table view

### Phase 2: Enhanced Database System (NEXT PRIORITY)

**Estimated Time:** 20-30 hours

#### Kanban Board View
**Components to Build:**
- `DatabaseKanbanView.tsx` - Main kanban component
- `KanbanColumn.tsx` - Individual column
- `KanbanCard.tsx` - Draggable card
- `KanbanCardEditor.tsx` - Inline card editor

**Implementation Steps:**
1. Install `@dnd-kit/core` and `@dnd-kit/sortable` (already done)
2. Create kanban view component with drag-and-drop
3. Implement column grouping by select property
4. Add card creation/editing
5. Implement drag-to-reorder and drag-to-change-status
6. Add column customization (colors, limits)

**Code Structure:**
```typescript
// client/src/components/DatabaseKanbanView.tsx
interface KanbanViewProps {
  databaseId: number;
  schema: any;
  groupByProperty: string; // Property ID to group by
}

// Features:
- Drag cards between columns
- Inline editing
- Quick add card
- Column collapse/expand
- Card count per column
- Horizontal scroll for many columns
```

#### Calendar View
**Components to Build:**
- `DatabaseCalendarView.tsx` - Main calendar
- `CalendarGrid.tsx` - Month/week grid
- `CalendarEvent.tsx` - Event card
- `EventDetailDialog.tsx` - Event details popup

**Implementation Steps:**
1. Install `date-fns` for date utilities (already done)
2. Create calendar grid component
3. Map database items to calendar events based on date property
4. Implement month/week/day views
5. Add event creation by clicking dates
6. Implement drag-to-reschedule

**Code Structure:**
```typescript
// client/src/components/DatabaseCalendarView.tsx
interface CalendarViewProps {
  databaseId: number;
  schema: any;
  dateProperty: string; // Property ID for date
  endDateProperty?: string; // Optional end date for multi-day events
}

// Features:
- Month/week/day views
- Drag to reschedule
- Color coding by property
- Multi-day events
- Today indicator
```

#### Gallery View
**Components to Build:**
- `DatabaseGalleryView.tsx` - Grid layout
- `GalleryCard.tsx` - Image card with metadata
- `GalleryLightbox.tsx` - Full-screen image viewer

**Implementation Steps:**
1. Create responsive grid layout
2. Display image property as card cover
3. Show key properties as overlay
4. Implement lightbox for full-screen viewing
5. Add card size options (small/medium/large)

#### List View
**Components to Build:**
- `DatabaseListView.tsx` - Compact list
- `ListItem.tsx` - Single row with icon
- `ListGroupHeader.tsx` - Group headers

**Implementation Steps:**
1. Create compact list layout
2. Show icon + title + key properties
3. Implement grouping by property
4. Add quick actions (complete, archive)
5. Implement virtual scrolling for performance

#### Timeline View (Different from Timeline Planner)
**Components to Build:**
- `DatabaseTimelineView.tsx` - Horizontal timeline
- `TimelineBar.tsx` - Gantt-style bar
- `TimelineMilestone.tsx` - Milestone marker

**Implementation Steps:**
1. Create horizontal timeline with date axis
2. Display items as bars based on start/end dates
3. Implement dependencies between items
4. Add zoom controls (day/week/month/quarter)
5. Implement drag to resize/move

### Phase 3: Advanced Property Types (15-20 hours)

#### Property Type Implementations

**Formula Properties:**
```typescript
// Supported functions:
- Math: sum(), avg(), min(), max(), round(), floor(), ceil()
- Text: concat(), upper(), lower(), length(), substring()
- Date: dateAdd(), dateDiff(), now(), today()
- Logic: if(), and(), or(), not()
- Aggregation: count(), countIf(), sumIf()

// Example formulas:
"if(prop('Status') == 'Complete', 100, 0)"
"dateAdd(prop('Start Date'), prop('Duration'), 'days')"
"concat(prop('First Name'), ' ', prop('Last Name'))"
```

**Relation Properties:**
```typescript
// Link to items in another database
{
  type: 'relation',
  relationTo: 'database-id',
  allowMultiple: boolean,
  twoWay: boolean, // Create reverse relation
  reversePropertyName?: string
}

// UI Component: DatabaseRelationPicker.tsx
- Search related database
- Select one or multiple items
- Display as chips
- Quick create new related item
```

**Rollup Properties:**
```typescript
// Aggregate data from related items
{
  type: 'rollup',
  relationProperty: 'property-id',
  targetProperty: 'property-id',
  aggregation: 'count|sum|avg|min|max|median|unique'
}

// Example: "Average rating of all related reviews"
```

**File Properties:**
```typescript
// Upload and attach files
{
  type: 'file',
  allowMultiple: boolean,
  maxSize: number, // bytes
  acceptedTypes: string[] // MIME types
}

// UI Component: FileUploadField.tsx
- Drag-and-drop upload
- Upload to S3
- Display thumbnails for images
- Download links for other files
```

### Phase 4: AI Features UI (10-15 hours)

#### Task Breakdown Component
**File:** `client/src/components/AITaskBreakdown.tsx`

**Features:**
- Input task description
- Generate subtasks with AI
- Estimated time for each subtask
- One-click create database items from subtasks
- Drag to reorder subtasks

**Integration:**
- Add button in database views
- Add button in timeline planner
- Context menu option

#### Voice Recording Component
**File:** `client/src/components/VoiceRecorder.tsx`

**Features:**
- Record audio using Web Audio API
- Real-time waveform visualization
- Upload to S3
- Transcribe with AI
- Insert transcription as text block or database item

**Implementation:**
```typescript
// Use MediaRecorder API
const recorder = new MediaRecorder(stream);
recorder.ondataavailable = (e) => {
  // Upload chunk to S3
  // Call transcription API
  // Display result
};
```

#### Image Generation Component
**File:** `client/src/components/AIImageGenerator.tsx`

**Features:**
- Text prompt input
- Optional image upload for editing
- Generate image with AI
- Insert into page or set as database item property
- Save to S3

### Phase 5: Real-Time Collaboration (20-25 hours)

#### WebSocket Infrastructure
**Backend:**
```typescript
// server/websocket.ts
import { Server } from 'socket.io';

const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL }
});

io.on('connection', (socket) => {
  // Join room for workspace
  socket.on('join-workspace', (workspaceId) => {
    socket.join(`workspace-${workspaceId}`);
  });

  // Broadcast edits
  socket.on('edit', (data) => {
    socket.to(`workspace-${data.workspaceId}`).emit('edit', data);
  });

  // Presence (who's online)
  socket.on('presence', (data) => {
    socket.to(`workspace-${data.workspaceId}`).emit('presence', data);
  });
});
```

**Frontend:**
```typescript
// client/src/lib/websocket.ts
import { io } from 'socket.io-client';

export const socket = io(process.env.VITE_WS_URL);

// Listen for edits
socket.on('edit', (data) => {
  // Apply operational transformation
  // Update local state
  // Sync to IndexedDB
});
```

#### Operational Transformation
**Algorithm:** Use Yjs or implement custom OT

**Conflict Resolution:**
1. Each edit has a version number
2. Server maintains canonical version
3. Client sends edit with base version
4. Server transforms edit if base version != current
5. Broadcast transformed edit to all clients

#### Comments System
**Components:**
- `CommentThread.tsx` - Thread of comments
- `CommentInput.tsx` - Rich text comment input
- `CommentNotification.tsx` - @mention notifications

**Features:**
- Inline comments on blocks
- Comments on database items
- @mentions with autocomplete
- Emoji reactions
- Resolve/unresolve threads

### Phase 6: Mood Tracking & Analytics (8-10 hours)

#### Mood Entry Form
**File:** `client/src/components/MoodEntryForm.tsx`

**Features:**
- Slider for mood (1-10)
- Slider for energy (1-10)
- Slider for focus (1-10)
- Optional notes
- Quick entry from timeline
- Scheduled reminders

#### Mood Dashboard
**File:** `client/src/pages/MoodDashboard.tsx`

**Features:**
- Line chart of mood over time
- Correlation with timeline events
- Patterns detection (AI)
- Export mood data
- Insights and recommendations

**Charts:**
- Use `recharts` library
- Mood trend line
- Energy vs. focus scatter plot
- Heatmap calendar
- Weekly/monthly averages

### Phase 7: Automation Builder (15-20 hours)

#### Automation Builder UI
**File:** `client/src/components/AutomationBuilder.tsx`

**Features:**
- Visual flow builder
- Trigger selection
- Condition builder
- Action selection
- Test automation
- Enable/disable toggle

**Trigger Types:**
- Property changed
- Item created
- Item updated
- Date reached
- Recurring (daily/weekly/monthly)
- Webhook

**Action Types:**
- Update property
- Create item
- Send notification
- Send email
- Call webhook
- Run custom script

**Implementation:**
```typescript
// Use react-flow for visual builder
import ReactFlow from 'reactflow';

const nodes = [
  { id: '1', type: 'trigger', data: { type: 'propertyChanged' } },
  { id: '2', type: 'condition', data: { operator: 'equals', value: 'Complete' } },
  { id: '3', type: 'action', data: { type: 'sendNotification' } }
];

const edges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' }
];
```

### Phase 8: Search & Navigation (8-10 hours)

#### Global Search
**File:** `client/src/components/GlobalSearch.tsx`

**Features:**
- Cmd+K quick search
- Search pages, databases, items
- Recent searches
- Filters by type
- Keyboard navigation
- AI-powered semantic search

**Implementation:**
```typescript
// Use Fuse.js for fuzzy search
import Fuse from 'fuse.js';

// Index all content
const fuse = new Fuse(allContent, {
  keys: ['title', 'content', 'properties'],
  threshold: 0.3
});

// Search
const results = fuse.search(query);
```

#### Breadcrumb Navigation
**File:** `client/src/components/Breadcrumbs.tsx`

**Features:**
- Show page hierarchy
- Click to navigate
- Dropdown for siblings
- Responsive (collapse on mobile)

### Phase 9: Templates System (5-8 hours)

#### Template Gallery
**File:** `client/src/pages/TemplateGallery.tsx`

**Templates:**
- Project Management
- Meeting Notes
- Personal Wiki
- Habit Tracker
- Reading List
- Recipe Book
- Travel Planner
- Goal Tracker

**Features:**
- Preview template
- One-click duplicate
- Customize before creating
- Share custom templates

### Phase 10: Export/Import (5-8 hours)

#### Export Functionality
**Formats:**
- Markdown (pages)
- CSV (databases)
- JSON (full workspace backup)
- PDF (pages with formatting)

**Implementation:**
```typescript
// Export to Markdown
const exportToMarkdown = (page) => {
  const blocks = getBlocksByPage(page.id);
  return blocks.map(blockToMarkdown).join('\n');
};

// Export to CSV
const exportToCSV = (database) => {
  const items = getDatabaseItems(database.id);
  const schema = JSON.parse(database.schema);
  // Convert to CSV with headers
};
```

#### Import Functionality
**Supported:**
- Notion export (Markdown + CSV)
- Google Calendar (ICS for timeline)
- Todoist (CSV for tasks)
- Generic CSV for databases

---

## Component Library Specifications

### Core Components (Already Built)

#### `BlockEditor`
**File:** `client/src/components/BlockEditor.tsx`  
**Props:**
- `content: string` - HTML content
- `onChange: (content: string) => void`
- `placeholder?: string`
- `editable?: boolean`

**Features:**
- Rich text formatting
- Headings (H1-H3)
- Lists (bullet, numbered, task)
- Links and images
- Blockquotes
- Undo/redo

#### `AppLayout`
**File:** `client/src/components/AppLayout.tsx`  
**Props:**
- `children: ReactNode`

**Features:**
- Collapsible sidebar
- Workspace switcher
- Navigation menu
- User profile menu
- Responsive design

#### `AIWritingAssistant`
**File:** `client/src/components/AIWritingAssistant.tsx`  
**Props:**
- `onInsert: (text: string) => void`
- `selectedText?: string`

**Features:**
- Continue writing
- Improve writing
- Summarize
- Expand
- Change tone
- Fix grammar

### Components to Build

#### Database Views

**`DatabaseKanbanView`**
```typescript
interface Props {
  databaseId: number;
  schema: any;
  groupByProperty: string;
}

// Features:
- Drag-and-drop cards
- Column customization
- Quick add card
- Inline editing
- Card count badges
```

**`DatabaseCalendarView`**
```typescript
interface Props {
  databaseId: number;
  schema: any;
  dateProperty: string;
  endDateProperty?: string;
}

// Features:
- Month/week/day views
- Drag to reschedule
- Multi-day events
- Color coding
- Today indicator
```

**`DatabaseGalleryView`**
```typescript
interface Props {
  databaseId: number;
  schema: any;
  imageProperty: string;
  cardSize: 'small' | 'medium' | 'large';
}

// Features:
- Responsive grid
- Image lightbox
- Metadata overlay
- Lazy loading
```

**`DatabaseListView`**
```typescript
interface Props {
  databaseId: number;
  schema: any;
  groupByProperty?: string;
}

// Features:
- Compact rows
- Grouping
- Quick actions
- Virtual scrolling
```

**`DatabaseTimelineView`**
```typescript
interface Props {
  databaseId: number;
  schema: any;
  startDateProperty: string;
  endDateProperty: string;
}

// Features:
- Gantt-style bars
- Dependencies
- Zoom controls
- Drag to resize/move
```

#### Property Editors

**`PropertyEditor`**
```typescript
interface Props {
  property: Property;
  value: any;
  onChange: (value: any) => void;
}

// Renders appropriate editor based on property type:
- TextEditor
- NumberEditor
- SelectEditor
- DateEditor
- CheckboxEditor
- URLEditor
- EmailEditor
- PhoneEditor
- FileEditor
- RelationEditor
- FormulaDisplay (read-only)
- RollupDisplay (read-only)
```

**`RelationPicker`**
```typescript
interface Props {
  databaseId: number;
  allowMultiple: boolean;
  value: number[];
  onChange: (value: number[]) => void;
}

// Features:
- Search related database
- Multi-select
- Quick create
- Display as chips
```

**`FilePicker`**
```typescript
interface Props {
  allowMultiple: boolean;
  acceptedTypes: string[];
  maxSize: number;
  value: string[];
  onChange: (value: string[]) => void;
}

// Features:
- Drag-and-drop
- Upload to S3
- Thumbnails
- Progress indicator
```

#### AI Components

**`AITaskBreakdown`**
```typescript
interface Props {
  onCreateTasks: (tasks: Task[]) => void;
}

// Features:
- Input task description
- Generate subtasks
- Edit subtasks
- Estimate time
- Create database items
```

**`VoiceRecorder`**
```typescript
interface Props {
  onTranscribe: (text: string) => void;
}

// Features:
- Record audio
- Waveform visualization
- Upload to S3
- Transcribe
- Insert text
```

**`AIImageGenerator`**
```typescript
interface Props {
  onGenerate: (url: string) => void;
}

// Features:
- Text prompt
- Optional image upload
- Generate
- Preview
- Insert
```

#### Collaboration Components

**`CommentThread`**
```typescript
interface Props {
  pageId?: number;
  databaseItemId?: number;
  blockId?: string;
}

// Features:
- List comments
- Add comment
- Reply to comment
- @mentions
- Reactions
- Resolve thread
```

**`PresenceIndicator`**
```typescript
interface Props {
  workspaceId: number;
}

// Features:
- Show online users
- Avatar stack
- Cursor tracking
- Selection highlighting
```

#### Mood Tracking Components

**`MoodEntryForm`**
```typescript
interface Props {
  onSubmit: (entry: MoodEntry) => void;
}

// Features:
- Mood slider
- Energy slider
- Focus slider
- Notes textarea
- Quick submit
```

**`MoodChart`**
```typescript
interface Props {
  userId: number;
  dateRange: { start: Date; end: Date };
}

// Features:
- Line chart
- Multiple metrics
- Zoom/pan
- Tooltips
- Export
```

#### Automation Components

**`AutomationBuilder`**
```typescript
interface Props {
  automation?: Automation;
  onSave: (automation: Automation) => void;
}

// Features:
- Visual flow builder
- Trigger selector
- Condition builder
- Action selector
- Test run
```

**`TriggerSelector`**
```typescript
interface Props {
  value: Trigger;
  onChange: (trigger: Trigger) => void;
}

// Trigger types:
- Property changed
- Item created
- Date reached
- Recurring
- Webhook
```

**`ActionSelector`**
```typescript
interface Props {
  value: Action;
  onChange: (action: Action) => void;
}

// Action types:
- Update property
- Create item
- Send notification
- Call webhook
- Run script
```

#### Search Components

**`GlobalSearch`**
```typescript
interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Features:
- Fuzzy search
- Type filters
- Recent searches
- Keyboard navigation
- Cmd+K shortcut
```

**`SearchResults`**
```typescript
interface Props {
  query: string;
  filters: string[];
}

// Features:
- Grouped results
- Highlight matches
- Preview snippet
- Quick actions
```

---

## AI Integration Guide

### Available AI APIs

#### LLM Integration
**File:** `server/_core/llm.ts`

**Usage:**
```typescript
import { invokeLLM } from './server/_core/llm';

const response = await invokeLLM({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' }
  ]
});

// Structured output
const structured = await invokeLLM({
  messages: [...],
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'task_breakdown',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          subtasks: { type: 'array', items: { type: 'string' } },
          estimatedTime: { type: 'number' }
        },
        required: ['subtasks', 'estimatedTime']
      }
    }
  }
});
```

#### Voice Transcription
**File:** `server/_core/voiceTranscription.ts`

**Usage:**
```typescript
import { transcribeAudio } from './server/_core/voiceTranscription';

const result = await transcribeAudio({
  audioUrl: 'https://storage.example.com/audio.mp3',
  language: 'en',
  prompt: 'Meeting notes'
});

// result.text - Full transcription
// result.language - Detected language
// result.segments - Timestamped segments
```

#### Image Generation
**File:** `server/_core/imageGeneration.ts`

**Usage:**
```typescript
import { generateImage } from './server/_core/imageGeneration';

const { url } = await generateImage({
  prompt: 'A serene landscape with mountains'
});

// For editing
const { url } = await generateImage({
  prompt: 'Add a rainbow',
  originalImages: [{
    url: 'https://example.com/original.jpg',
    mimeType: 'image/jpeg'
  }]
});
```

### AI Feature Implementations

#### Task Breakdown
**Router:** `server/routers.ts`

```typescript
ai: router({
  breakdownTask: protectedProcedure
    .input(z.object({
      taskDescription: z.string(),
    }))
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'Break down tasks into actionable subtasks with time estimates.'
          },
          {
            role: 'user',
            content: `Break down this task: ${input.taskDescription}`
          }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'task_breakdown',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                subtasks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      estimatedMinutes: { type: 'number' }
                    },
                    required: ['title', 'estimatedMinutes']
                  }
                }
              },
              required: ['subtasks']
            }
          }
        }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result;
    }),
})
```

#### Writing Improvement
**Router:** Already implemented in `server/routers.ts`

```typescript
improveWriting: protectedProcedure
  .input(z.object({
    text: z.string(),
    instruction: z.string(),
  }))
  .mutation(async ({ input }) => {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a writing assistant. Improve the given text according to instructions.'
        },
        {
          role: 'user',
          content: `${input.instruction}\n\nText: ${input.text}`
        }
      ]
    });

    return {
      improved: response.choices[0].message.content
    };
  }),
```

#### Smart Automations
**Concept:** Use AI to suggest automation rules based on user behavior

```typescript
suggestAutomations: protectedProcedure
  .input(z.object({
    workspaceId: z.number(),
  }))
  .query(async ({ input, ctx }) => {
    // Analyze user's database structure and usage patterns
    const databases = await getDatabasesByWorkspace(input.workspaceId);
    const recentActions = await getUserRecentActions(ctx.user.id);

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'Suggest automation rules based on database structure and user behavior.'
        },
        {
          role: 'user',
          content: JSON.stringify({ databases, recentActions })
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'automation_suggestions',
          schema: {
            type: 'object',
            properties: {
              suggestions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    trigger: { type: 'object' },
                    actions: { type: 'array' }
                  }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.choices[0].message.content);
  }),
```

---

## Testing Strategy

### Unit Tests

**Framework:** Vitest

**Test Files:**
- `server/*.test.ts` - Backend unit tests
- `client/src/**/*.test.tsx` - Component tests

**Example Test:**
```typescript
// server/pages.test.ts
import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';

describe('pages.create', () => {
  it('creates a page successfully', async () => {
    const caller = appRouter.createCaller(mockContext);
    
    const page = await caller.pages.create({
      workspaceId: 1,
      title: 'Test Page',
      position: 0
    });

    expect(page.title).toBe('Test Page');
    expect(page.workspaceId).toBe(1);
  });

  it('requires authentication', async () => {
    const caller = appRouter.createCaller(unauthenticatedContext);
    
    await expect(
      caller.pages.create({
        workspaceId: 1,
        title: 'Test',
        position: 0
      })
    ).rejects.toThrow('UNAUTHORIZED');
  });
});
```

**Component Test:**
```typescript
// client/src/components/BlockEditor.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BlockEditor } from './BlockEditor';

describe('BlockEditor', () => {
  it('renders with initial content', () => {
    render(
      <BlockEditor
        content="<p>Hello world</p>"
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('calls onChange when content is edited', () => {
    const onChange = vi.fn();
    render(
      <BlockEditor
        content=""
        onChange={onChange}
      />
    );

    // Simulate typing
    const editor = screen.getByRole('textbox');
    fireEvent.input(editor, { target: { innerHTML: '<p>New content</p>' } });

    expect(onChange).toHaveBeenCalledWith('<p>New content</p>');
  });
});
```

### Integration Tests

**Test Scenarios:**
1. **Page Creation Flow**
   - Create workspace
   - Create page
   - Add blocks
   - Verify in database

2. **Database Item Flow**
   - Create database
   - Add properties
   - Create items
   - Update items
   - Filter/sort

3. **Timeline Flow**
   - Create event
   - Update event
   - Mark complete
   - Track duration

4. **Offline Sync Flow**
   - Create item offline
   - Go online
   - Verify sync
   - Handle conflicts

**Example:**
```typescript
// tests/integration/page-flow.test.ts
describe('Page Creation Flow', () => {
  it('creates and edits a page end-to-end', async () => {
    // 1. Create workspace
    const workspace = await createWorkspace({ name: 'Test' });

    // 2. Create page
    const page = await createPage({
      workspaceId: workspace.id,
      title: 'My Page'
    });

    // 3. Add block
    const block = await createBlock({
      pageId: page.id,
      type: 'text',
      content: JSON.stringify({ text: 'Hello' }),
      position: 0
    });

    // 4. Verify
    const blocks = await getBlocksByPage(page.id);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].content).toContain('Hello');
  });
});
```

### E2E Tests

**Framework:** Playwright

**Test Scenarios:**
1. **User Onboarding**
   - Login
   - Create first page
   - Add content
   - Create database

2. **Collaboration**
   - Two users edit same page
   - Verify real-time updates
   - Check conflict resolution

3. **Mobile Responsiveness**
   - Test on mobile viewport
   - Verify sidebar collapse
   - Test touch interactions

**Example:**
```typescript
// tests/e2e/onboarding.spec.ts
import { test, expect } from '@playwright/test';

test('user onboarding flow', async ({ page }) => {
  // Login
  await page.goto('/');
  await page.click('text=Login');
  // ... OAuth flow

  // Create first page
  await page.click('text=New Page');
  await page.fill('input[placeholder="Untitled Page"]', 'My First Page');

  // Add content
  await page.click('.editor');
  await page.type('.editor', 'Hello, ClearMind!');

  // Verify
  await expect(page.locator('text=My First Page')).toBeVisible();
  await expect(page.locator('text=Hello, ClearMind!')).toBeVisible();
});
```

### Accessibility Tests

**Framework:** axe-core + Vitest

**Test All Components:**
```typescript
// client/src/components/BlockEditor.a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BlockEditor } from './BlockEditor';

expect.extend(toHaveNoViolations);

describe('BlockEditor Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <BlockEditor content="" onChange={() => {}} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper ARIA labels', () => {
    const { getByRole } = render(
      <BlockEditor content="" onChange={() => {}} />
    );

    expect(getByRole('textbox')).toHaveAttribute('aria-label');
  });

  it('supports keyboard navigation', () => {
    const { getByRole } = render(
      <BlockEditor content="" onChange={() => {}} />
    );

    const editor = getByRole('textbox');
    expect(editor).toHaveAttribute('tabindex', '0');
  });
});
```

### Performance Tests

**Metrics to Track:**
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

**Lighthouse CI:**
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npm install -g @lhci/cli
      - run: lhci autorun
```

**Performance Budgets:**
```json
// lighthouserc.json
{
  "ci": {
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "interactive": ["error", { "maxNumericValue": 5000 }],
        "speed-index": ["error", { "maxNumericValue": 4000 }]
      }
    }
  }
}
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**File:** `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Type checking
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 10
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm check

  # Linting
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint

  # Unit tests
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test

  # Build
  build:
    runs-on: ubuntu-latest
    needs: [typecheck, lint, test]
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist/

  # E2E tests
  e2e:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install
      - run: npx playwright install --with-deps
      - run: pnpm test:e2e

  # Deploy to staging
  deploy-staging:
    runs-on: ubuntu-latest
    needs: [build, e2e]
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/download-artifact@v3
        with:
          name: build
          path: dist/
      - name: Deploy to Manus Staging
        run: |
          # Use Manus CLI or API to deploy
          # This is handled automatically by Manus platform

  # Deploy to production
  deploy-production:
    runs-on: ubuntu-latest
    needs: [build, e2e]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/download-artifact@v3
        with:
          name: build
          path: dist/
      - name: Deploy to Manus Production
        run: |
          # Use Manus CLI or API to deploy
          # This is handled automatically by Manus platform
```

### Pre-commit Hooks

**File:** `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Type check
pnpm check

# Lint staged files
pnpm lint-staged

# Run tests
pnpm test --run
```

**File:** `package.json`

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

---

## Deployment Guide

### Manus Platform Deployment

ClearMind is designed to deploy on the Manus platform with built-in hosting.

#### Prerequisites
1. Manus account
2. Project initialized with `webdev_init_project`
3. At least one checkpoint created

#### Deployment Steps

**1. Create Checkpoint**
```typescript
// Via Manus AI
await webdev_save_checkpoint({
  description: 'Production-ready v1.0.0'
});
```

**2. Click Publish in UI**
- Open Management UI
- Navigate to latest checkpoint
- Click "Publish" button
- Confirm deployment

**3. Configure Custom Domain (Optional)**
- Go to Settings → Domains
- Purchase domain or bind existing
- DNS automatically configured

**4. Monitor Deployment**
- View deployment logs in Dashboard
- Check status in Management UI
- Test deployed URL

#### Environment Variables

All required environment variables are automatically injected by Manus:
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Session signing secret
- `VITE_APP_ID` - OAuth app ID
- `OAUTH_SERVER_URL` - OAuth backend
- `BUILT_IN_FORGE_API_URL` - Manus APIs
- `BUILT_IN_FORGE_API_KEY` - API authentication

**Custom Variables:**
Add via Settings → Secrets in Management UI

#### Rollback

If deployment fails or has issues:
1. Go to Dashboard
2. Find previous checkpoint
3. Click "Rollback"
4. Confirm

### Alternative Deployment (Vercel + Supabase)

If deploying outside Manus:

**Backend (Vercel)**
1. Connect GitHub repo to Vercel
2. Set environment variables:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=random-secret
   OAUTH_SERVER_URL=https://your-oauth.com
   OPENAI_API_KEY=sk-...
   S3_BUCKET=your-bucket
   S3_ACCESS_KEY=...
   S3_SECRET_KEY=...
   ```
3. Deploy

**Database (Supabase)**
1. Create Supabase project
2. Run migrations:
   ```bash
   pnpm db:push
   ```
3. Copy connection string to `DATABASE_URL`

**Storage (Supabase Storage or S3)**
1. Create bucket
2. Set CORS policy
3. Configure environment variables

**OAuth (Custom)**
1. Implement OAuth provider (Google, GitHub, etc.)
2. Update `server/_core/auth.ts`
3. Configure callback URLs

---

## Performance Optimization

### Frontend Optimization

#### Code Splitting
```typescript
// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const DatabaseDetailPage = lazy(() => import('./pages/DatabaseDetailPage'));

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <HomePage />
</Suspense>
```

#### Virtual Scrolling
```typescript
// For large lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>{items[index].title}</div>
  )}
</FixedSizeList>
```

#### Memoization
```typescript
// Expensive computations
const filteredItems = useMemo(() => {
  return items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [items, searchQuery]);

// Callbacks
const handleClick = useCallback(() => {
  console.log('Clicked');
}, []);
```

#### Image Optimization
```typescript
// Lazy load images
<img
  src={imageUrl}
  loading="lazy"
  alt="Description"
/>

// Use WebP format
<picture>
  <source srcSet={imageUrl.replace('.jpg', '.webp')} type="image/webp" />
  <img src={imageUrl} alt="Description" />
</picture>
```

### Backend Optimization

#### Database Indexing
```sql
-- Add indexes for common queries
CREATE INDEX idx_pages_workspace_parent ON pages(workspaceId, parentId);
CREATE INDEX idx_blocks_page_position ON blocks(pageId, position);
CREATE INDEX idx_database_items_database ON databaseItems(databaseId);
CREATE INDEX idx_timeline_user_date ON timelineEvents(userId, startTime);
```

#### Query Optimization
```typescript
// Use select() to fetch only needed fields
const pages = await db
  .select({
    id: pages.id,
    title: pages.title,
    icon: pages.icon
  })
  .from(pages)
  .where(eq(pages.workspaceId, workspaceId));

// Batch queries
const [pages, databases] = await Promise.all([
  getPagesByWorkspace(workspaceId),
  getDatabasesByWorkspace(workspaceId)
]);
```

#### Caching
```typescript
// tRPC query caching
trpc.pages.getById.useQuery(
  { id: pageId },
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  }
);

// Server-side caching (Redis)
const cachedPage = await redis.get(`page:${id}`);
if (cachedPage) return JSON.parse(cachedPage);

const page = await db.select().from(pages).where(eq(pages.id, id));
await redis.set(`page:${id}`, JSON.stringify(page), 'EX', 300);
return page;
```

### Offline Performance

#### IndexedDB Optimization
```typescript
// Batch writes
const tx = db.transaction(['pages', 'blocks'], 'readwrite');
for (const page of pages) {
  await tx.objectStore('pages').put(page);
}
await tx.done;

// Use indexes for queries
const index = db.transaction('pages').store.index('by-workspace');
const pages = await index.getAll(workspaceId);
```

#### Service Worker
```typescript
// Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('clearmind-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/assets/main.js',
        '/assets/main.css'
      ]);
    })
  );
});

// Serve from cache first
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

---

## Security Considerations

### Authentication & Authorization

#### JWT Validation
```typescript
// Verify JWT on every request
const verifyJWT = async (token: string) => {
  try {
    const payload = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};
```

#### Role-Based Access Control
```typescript
// Check user role
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});

// Check resource ownership
const checkPageOwnership = async (pageId: number, userId: number) => {
  const page = await getPageById(pageId);
  if (page.createdBy !== userId) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
};
```

### Input Validation

#### Zod Schemas
```typescript
// Validate all inputs
const createPageSchema = z.object({
  workspaceId: z.number().positive(),
  title: z.string().min(1).max(255),
  icon: z.string().emoji().optional(),
  parentId: z.number().positive().optional()
});

// Use in procedures
createPage: protectedProcedure
  .input(createPageSchema)
  .mutation(async ({ input, ctx }) => {
    // Input is validated and typed
  });
```

#### Sanitization
```typescript
// Sanitize HTML content
import DOMPurify from 'dompurify';

const sanitizeHTML = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target']
  });
};
```

### XSS Prevention

#### Content Security Policy
```typescript
// Set CSP headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  next();
});
```

#### Escape User Input
```typescript
// Never render raw user input
<div>{userInput}</div> // Safe in React

// Be careful with dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: sanitizeHTML(userInput) }} />
```

### CSRF Protection

#### CSRF Tokens
```typescript
// Generate CSRF token
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Validate token
const validateCSRFToken = (token: string, sessionToken: string) => {
  return token === sessionToken;
};
```

### Rate Limiting

#### API Rate Limits
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later'
});

app.use('/api', limiter);
```

### Data Encryption

#### Encrypt Sensitive Data
```typescript
import crypto from 'crypto';

const encrypt = (text: string, key: string) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text: string, key: string) => {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
```

---

## Accessibility Implementation

### WCAG 2.1 AA Compliance

#### Keyboard Navigation
```typescript
// All interactive elements must be keyboard accessible
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  tabIndex={0}
>
  Click me
</button>

// Skip to content link
<a href="#main-content" className="skip-to-content">
  Skip to main content
</a>
```

#### ARIA Labels
```typescript
// Provide context for screen readers
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

<input
  type="text"
  aria-label="Search pages"
  placeholder="Search..."
/>

<div role="alert" aria-live="polite">
  {errorMessage}
</div>
```

#### Color Contrast
```css
/* Ensure 4.5:1 contrast ratio for normal text */
/* Ensure 3:1 contrast ratio for large text */

/* ADHD theme - high contrast */
[data-theme="adhd"] {
  --foreground: 0 0% 0%;
  --background: 0 0% 100%;
}

/* High contrast theme - WCAG AAA */
[data-theme="highContrast"] {
  --foreground: 0 0% 0%;
  --background: 0 0% 100%;
  --primary: 240 100% 30%;
}
```

#### Focus Indicators
```css
/* Visible focus indicators */
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Never remove focus indicators */
/* :focus { outline: none; } ❌ NEVER DO THIS */
```

### Sensory Profile Themes

#### ADHD Theme
```css
[data-theme="adhd"] {
  /* Colorful, visual anchors */
  --primary: 217 91% 60%; /* Blue */
  --success: 142 76% 36%; /* Green */
  --warning: 38 92% 50%; /* Orange */
  --destructive: 0 84% 60%; /* Red */
  
  /* Clear hierarchy */
  font-weight: 500;
  letter-spacing: 0.01em;
}
```

#### High Contrast Theme
```css
[data-theme="highContrast"] {
  /* Maximum contrast */
  --foreground: 0 0% 0%;
  --background: 0 0% 100%;
  --border: 0 0% 0%;
  
  /* No subtle colors */
  --muted: 0 0% 20%;
  --muted-foreground: 0 0% 0%;
}
```

#### Dyslexia Theme
```css
[data-theme="dyslexia"] {
  /* Dyslexia-friendly font */
  font-family: 'Atkinson Hyperlegible', sans-serif;
  
  /* Increased spacing */
  letter-spacing: 0.05em;
  line-height: 1.8;
  word-spacing: 0.2em;
  
  /* Larger text */
  font-size: 1.125rem;
}
```

#### Low Stim Theme
```css
[data-theme="lowStim"] {
  /* Minimal colors */
  --primary: 0 0% 40%;
  --accent: 0 0% 50%;
  
  /* Reduced motion */
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  
  /* Soft backgrounds */
  --background: 0 0% 98%;
  --card: 0 0% 100%;
}
```

### Screen Reader Support

#### Semantic HTML
```typescript
// Use semantic elements
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/home">Home</a></li>
  </ul>
</nav>

<main id="main-content">
  <article>
    <h1>Page Title</h1>
    <p>Content</p>
  </article>
</main>

<aside aria-label="Sidebar">
  <h2>Related</h2>
</aside>
```

#### Live Regions
```typescript
// Announce dynamic changes
<div role="status" aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

### Reduced Motion

#### Respect User Preferences
```css
/* Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```typescript
// Check in JavaScript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  // Play animations
}
```

---

## Future Enhancements

### Mobile Apps

#### React Native
- Share codebase with web
- Native performance
- Offline-first by default
- Push notifications

#### PWA
- Installable web app
- Works offline
- Add to home screen
- Background sync

### Advanced AI Features

#### Semantic Search
- Vector embeddings for content
- Natural language queries
- Contextual results

#### Smart Suggestions
- Suggest related pages
- Auto-categorize items
- Predict next actions

#### Meeting Assistant
- Record meetings
- Auto-transcribe
- Extract action items
- Create database items

### Integrations

#### Calendar Sync
- Google Calendar
- Outlook Calendar
- Apple Calendar

#### Task Management
- Import from Todoist
- Import from Asana
- Import from Trello

#### Note Taking
- Import from Evernote
- Import from OneNote
- Import from Apple Notes

#### Communication
- Slack integration
- Discord integration
- Email integration

### Enterprise Features

#### SSO
- SAML 2.0
- OAuth 2.0
- LDAP

#### Advanced Permissions
- Custom roles
- Field-level permissions
- Audit logs

#### White Label
- Custom branding
- Custom domain
- Remove ClearMind branding

---

## Conclusion

This technical blueprint provides a complete roadmap for developing ClearMind from foundation to full-featured product. The current implementation provides a solid foundation with:

- Complete backend infrastructure
- Core frontend features
- Offline-first architecture
- Accessibility-first design
- AI integration

The roadmap outlines clear phases for implementing remaining features:
- Enhanced database system
- Advanced AI features
- Real-time collaboration
- Mood tracking
- Automation builder
- Search and navigation

Each phase includes detailed specifications, code examples, and implementation guidance to ensure consistent, high-quality development.

**Next Steps:**
1. Review and prioritize features based on user feedback
2. Implement Phase 2 (Enhanced Database System)
3. Set up CI/CD pipeline
4. Deploy to production
5. Gather user feedback
6. Iterate based on real usage

ClearMind is positioned to become the leading neurodivergent-first productivity platform by combining the best of Notion and Tiimo while addressing their key weaknesses with accessibility, AI, and offline-first architecture.
