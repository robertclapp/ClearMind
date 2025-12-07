import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

/**
 * ClearMind tRPC API Router
 * 
 * This router defines all API procedures for ClearMind.
 * Procedures are type-safe and automatically generate TypeScript types for the frontend.
 * 
 * Router structure:
 * - auth: Authentication and user management
 * - workspaces: Workspace operations
 * - pages: Page CRUD and hierarchy
 * - blocks: Block content management
 * - databases: Database creation and management
 * - databaseViews: View configuration
 * - databaseItems: Database item CRUD
 * - timeline: Visual timeline events
 * - mood: Mood tracking
 * - notifications: Notification management
 * - comments: Collaboration comments
 * - ai: AI-powered features
 */

export const appRouter = router({
  system: systemRouter,

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================
  
  auth: router({
    /**
     * Get current authenticated user.
     */
    me: publicProcedure.query(opts => opts.ctx.user),

    /**
     * Logout current user by clearing session cookie.
     */
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    /**
     * Update user sensory profile preference.
     */
    updateSensoryProfile: protectedProcedure
      .input(z.object({
        sensoryProfile: z.enum(["adhd", "highContrast", "dyslexia", "lowStim", "standard"]),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateUserSensoryProfile(ctx.user.id, input.sensoryProfile);
        return { success: true };
      }),

    /**
     * Update user notification settings.
     */
    updateNotificationSettings: protectedProcedure
      .input(z.object({
        settings: z.object({
          email: z.boolean().optional(),
          push: z.boolean().optional(),
          quietHours: z.object({
            start: z.string().optional(),
            end: z.string().optional(),
          }).optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateUserNotificationSettings(ctx.user.id, JSON.stringify(input.settings));
        return { success: true };
      }),
  }),

  // ============================================================================
  // WORKSPACES
  // ============================================================================

  workspaces: router({
    /**
     * Get or create default workspace for current user.
     */
    getOrCreateDefault: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getOrCreateDefaultWorkspace(ctx.user.id, ctx.user.name || "User");
      }),

    /**
     * Get all workspaces owned by current user.
     */
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getWorkspacesByOwner(ctx.user.id);
      }),

    /**
     * Create a new workspace.
     */
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        icon: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createWorkspace({
          name: input.name,
          icon: input.icon,
          ownerId: ctx.user.id,
        });
      }),
  }),

  // ============================================================================
  // PAGES
  // ============================================================================

  pages: router({
    /**
     * Get page by ID.
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        return await db.getPageById(input.id, ctx.user.id);
      }),

    /**
     * Get page hierarchy for workspace.
     */
    getHierarchy: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPageHierarchy(input.workspaceId);
      }),

    /**
     * Get root pages (pages without parent).
     */
    getRootPages: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ input }) => {
        return await db.getRootPages(input.workspaceId);
      }),

    /**
     * Get child pages of a parent page.
     */
    getChildPages: protectedProcedure
      .input(z.object({ parentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getChildPages(input.parentId);
      }),

    /**
     * Get recent pages.
     */
    getRecent: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getRecentPages(input.workspaceId, input.limit);
      }),

    /**
     * Create a new page.
     */
    create: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        title: z.string(),
        parentId: z.number().optional(),
        icon: z.string().optional(),
        coverImage: z.string().optional(),
        position: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createPage({
          ...input,
          position: input.position ?? 0,
          createdBy: ctx.user.id,
        });
      }),

    /**
     * Update page properties.
     */
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        icon: z.string().optional(),
        coverImage: z.string().optional(),
        parentId: z.number().optional(),
        position: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        return await db.updatePage(id, updates, ctx.user.id);
      }),

    /**
     * Archive a page (soft delete).
     */
    archive: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await db.archivePage(input.id, ctx.user.id);
      }),
  }),

  // ============================================================================
  // BLOCKS
  // ============================================================================

  blocks: router({
    /**
     * Get all blocks for a page.
     */
    getByPage: protectedProcedure
      .input(z.object({ pageId: z.number() }))
      .query(async ({ input }) => {
        return await db.getBlocksByPage(input.pageId);
      }),

    /**
     * Create a new block.
     */
    create: protectedProcedure
      .input(z.object({
        pageId: z.number(),
        type: z.string(),
        content: z.string(), // JSON string
        parentBlockId: z.number().optional(),
        position: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createBlock({
          ...input,
          position: input.position ?? 0,
          createdBy: ctx.user.id,
        });
      }),

    /**
     * Update block content.
     */
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        type: z.string().optional(),
        content: z.string().optional(), // JSON string
        position: z.number().optional(),
        parentBlockId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateBlock(id, updates);
        return { success: true };
      }),

    /**
     * Delete a block.
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteBlock(input.id);
      }),
  }),

  // ============================================================================
  // DATABASES
  // ============================================================================

  databases: router({
    /**
     * Get database by ID.
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getDatabaseById(input.id);
      }),

    /**
     * Get all databases in a workspace.
     */
    getByWorkspace: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDatabasesByWorkspace(input.workspaceId);
      }),

    /**
     * Create a new database.
     */
    create: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        name: z.string(),
        icon: z.string().optional(),
        description: z.string().optional(),
        schema: z.string(), // JSON string with property definitions
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createDatabase({
          ...input,
          createdBy: ctx.user.id,
        });
      }),

    /**
     * Update database properties.
     */
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        icon: z.string().optional(),
        description: z.string().optional(),
        schema: z.string().optional(), // JSON string
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await db.updateDatabase(id, updates);
      }),
  }),

  // ============================================================================
  // DATABASE VIEWS
  // ============================================================================

  databaseViews: router({
    /**
     * Get all views for a database.
     */
    getByDatabase: protectedProcedure
      .input(z.object({ databaseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDatabaseViews(input.databaseId);
      }),

    /**
     * Create a new database view.
     */
    create: protectedProcedure
      .input(z.object({
        databaseId: z.number(),
        name: z.string(),
        type: z.enum(["table", "kanban", "calendar", "gallery", "list", "timeline"]),
        config: z.string(), // JSON string with view configuration
        position: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createDatabaseView({
          ...input,
          position: input.position ?? 0,
          createdBy: ctx.user.id,
        });
      }),

    /**
     * Update database view configuration.
     */
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        config: z.string().optional(), // JSON string
        position: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateDatabaseView(id, updates);
        return { success: true };
      }),
  }),

  // ============================================================================
  // DATABASE ITEMS
  // ============================================================================

  databaseItems: router({
    /**
     * Get all items in a database.
     */
    getByDatabase: protectedProcedure
      .input(z.object({ databaseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDatabaseItems(input.databaseId);
      }),

    /**
     * Get database item by ID.
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getDatabaseItemById(input.id);
      }),

    /**
     * Create a new database item.
     */
    create: protectedProcedure
      .input(z.object({
        databaseId: z.number(),
        properties: z.string(), // JSON string with property values
        position: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createDatabaseItem({
          ...input,
          position: input.position ?? 0,
          createdBy: ctx.user.id,
        });
      }),

    /**
     * Update database item properties.
     */
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        properties: z.string().optional(), // JSON string
        position: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await db.updateDatabaseItem(id, updates);
      }),

    /**
     * Archive a database item (soft delete).
     */
    archive: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.archiveDatabaseItem(input.id);
      }),
  }),

  // ============================================================================
  // TIMELINE EVENTS
  // ============================================================================

  timeline: router({
    /**
     * Get timeline events for a specific date.
     */
    getByDate: protectedProcedure
      .input(z.object({ date: z.date() }))
      .query(async ({ input, ctx }) => {
        return await db.getTimelineEventsByDate(ctx.user.id, input.date);
      }),

    /**
     * Create a new timeline event.
     */
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        startTime: z.date(),
        estimatedDuration: z.number().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        databaseItemId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createTimelineEvent({
          ...input,
          userId: ctx.user.id,
        });
      }),

    /**
     * Update timeline event.
     */
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        startTime: z.date().optional(),
        estimatedDuration: z.number().optional(),
        actualDuration: z.number().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        completed: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        if (updates.completed) {
          (updates as any).completedAt = new Date();
        }
        await db.updateTimelineEvent(id, updates);
        return { success: true };
      }),

    /**
     * Delete timeline event.
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteTimelineEvent(input.id);
      }),
  }),

  // ============================================================================
  // MOOD TRACKING
  // ============================================================================

  mood: router({
    /**
     * Create a new mood entry.
     */
    create: protectedProcedure
      .input(z.object({
        moodValue: z.number().min(1).max(5).optional(),
        moodEmoji: z.string().optional(),
        notes: z.string().optional(),
        linkedEventId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createMoodEntry({
          ...input,
          userId: ctx.user.id,
          timestamp: new Date(),
        });
      }),

    /**
     * Get mood entries within a date range.
     */
    getByDateRange: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input, ctx }) => {
        return await db.getMoodEntriesByDateRange(ctx.user.id, input.startDate, input.endDate);
      }),

    /**
     * Get recent mood entries.
     */
    getRecent: protectedProcedure
      .input(z.object({
        limit: z.number().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const limit = input.limit || 30;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        return await db.getMoodEntriesByDateRange(ctx.user.id, startDate, endDate);
      }),
  }),

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  notifications: router({
    /**
     * Get unread notifications for current user.
     */
    getUnread: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUnreadNotifications(ctx.user.id);
      }),

    /**
     * Mark notification as read.
     */
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),

    /**
     * Mark all notifications as read.
     */
    markAllAsRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.markAllNotificationsAsRead(ctx.user.id);
        return { success: true };
      }),
  }),

  // ============================================================================
  // COMMENTS
  // ============================================================================

  comments: router({
    /**
     * Get comments for a specific entity (page, block, or database item).
     */
    getByParent: protectedProcedure
      .input(z.object({
        parentType: z.enum(["page", "block", "databaseItem"]),
        parentId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getCommentsByParent(input.parentType, input.parentId);
      }),

    /**
     * Create a new comment.
     */
    create: protectedProcedure
      .input(z.object({
        parentType: z.enum(["page", "block", "databaseItem"]),
        parentId: z.number(),
        content: z.string(),
        mentions: z.array(z.number()).optional(), // User IDs
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createComment({
          ...input,
          mentions: input.mentions ? JSON.stringify(input.mentions) : undefined,
          createdBy: ctx.user.id,
        });
      }),

    /**
     * Update comment content.
     */
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updateComment(input.id, input.content);
        return { success: true };
      }),

    /**
     * Archive a comment (soft delete).
     */
    archive: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.archiveComment(input.id);
      }),
  }),

  // ============================================================================
  // AI FEATURES
  // ============================================================================

  ai: router({
    /**
     * Break down a task into manageable steps using AI.
     */
    breakdownTask: protectedProcedure
      .input(z.object({ taskDescription: z.string() }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that breaks down complex tasks into clear, actionable steps. Each step should be specific, achievable, and sequential. Return a JSON array of step descriptions as strings.",
            },
            {
              role: "user",
              content: `Break down this task into 5-8 manageable steps: ${input.taskDescription}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "task_breakdown",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  steps: {
                    type: "array",
                    items: { type: "string" },
                    description: "Array of step descriptions",
                  },
                },
                required: ["steps"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== 'string') {
          throw new Error("No response from AI");
        }

        const parsed = JSON.parse(content);
        return { subtasks: parsed.steps };
      }),

    /**
     * Improve writing with AI assistance.
     */
    improveWriting: protectedProcedure
      .input(z.object({
        text: z.string(),
        instruction: z.string(),
      }))
      .mutation(async ({ input }) => {
        // AI integration will be implemented in next phase
        return { improvedText: input.text };
      }),

    /**
     * Transcribe voice note to text.
     */
    transcribeVoice: protectedProcedure
      .input(z.object({
        audioUrl: z.string(),
        language: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // AI integration will be implemented in next phase
        return {
          text: "Transcribed text will appear here",
          language: "en",
        };
      }),

    /**
     * Transcribe audio data to text using Whisper API.
     */
    transcribeAudio: protectedProcedure
      .input(z.object({
        audioData: z.string(), // Base64 encoded audio
        format: z.enum(['webm', 'mp4', 'mp3', 'wav']),
        language: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          // Import transcription helper
          const { transcribeAudio } = await import('./_core/voiceTranscription');
          
          // Convert base64 to buffer
          const base64Data = input.audioData.split(',')[1] || input.audioData;
          const audioBuffer = Buffer.from(base64Data, 'base64');
          
          // Create temporary file URL (in production, upload to S3 first)
          // For now, we'll use the Manus storage API
          const { storagePut } = await import('./storage');
          const fileName = `voice-${Date.now()}.${input.format}`;
          const { url } = await storagePut(
            `voice-recordings/${fileName}`,
            audioBuffer,
            `audio/${input.format}`
          );
          
          // Transcribe using Whisper
          const result = await transcribeAudio({
            audioUrl: url,
            language: input.language,
          });
          
          // Check if it's an error response
          if ('error' in result) {
            throw new Error(result.error);
          }
          
          return {
            text: result.text,
            language: result.language,
          };
        } catch (error) {
          console.error('Transcription error:', error);
          throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    /**
     * Generate image from text prompt.
     */
    generateImage: protectedProcedure
      .input(z.object({
        prompt: z.string(),
        originalImage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { generateImage } = await import("./_core/imageGeneration");
        
        const result = await generateImage({
          prompt: input.prompt,
          originalImages: input.originalImage
            ? [{ url: input.originalImage, mimeType: "image/jpeg" }]
            : undefined,
        });
        
        return { url: result.url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
