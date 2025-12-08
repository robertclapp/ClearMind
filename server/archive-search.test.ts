import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import type { inferProcedureInput } from "@trpc/server";
import { getDb } from "./db";
import { pages, users, workspaces } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Tests for page archiving and global search features.
 */
describe("Archive and Search Features", () => {
  let testUserId: number;
  let testWorkspaceId: number;
  let testPageId: number;
  let ctx: Awaited<ReturnType<typeof createContext>>;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user
    const [user] = await db
      .insert(users)
      .values({
        openId: "test-archive-search-user",
        name: "Archive Test User",
        email: "archive-test@example.com",
        role: "user",
        sensoryProfile: "standard",
      })
      .$returningId();
    testUserId = user.id;

    // Create test workspace
    const [workspace] = await db
      .insert(workspaces)
      .values({
        name: "Archive Test Workspace",
        ownerId: testUserId,
      })
      .$returningId();
    testWorkspaceId = workspace.id;

    // Create test page
    const [page] = await db
      .insert(pages)
      .values({
        workspaceId: testWorkspaceId,
        title: "Test Page for Archiving",
        icon: "📄",
        position: 0,
        archived: false,
        createdBy: testUserId,
      })
      .$returningId();
    testPageId = page.id;

    // Mock context
    ctx = {
      user: {
        id: testUserId,
        openId: "test-archive-search-user",
        name: "Archive Test User",
        email: "archive-test@example.com",
        role: "user",
        sensoryProfile: "standard",
        notificationSettings: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Clean up test data
    await db.delete(pages).where(eq(pages.workspaceId, testWorkspaceId));
    await db.delete(workspaces).where(eq(workspaces.id, testWorkspaceId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  describe("Page Archiving", () => {
    it("should archive a page", async () => {
      const caller = appRouter.createCaller(ctx);

      type ArchiveInput = inferProcedureInput<typeof appRouter.pages.archive>;
      const input: ArchiveInput = {
        id: testPageId,
      };

      const result = await caller.pages.archive(input);
      expect(result.success).toBe(true);

      // Verify page is archived
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [archivedPage] = await db
        .select()
        .from(pages)
        .where(eq(pages.id, testPageId));

      expect(archivedPage.archived).toBe(true);
      expect(archivedPage.archivedAt).toBeTruthy();
    });

    it("should get archived pages", async () => {
      const caller = appRouter.createCaller(ctx);

      type GetArchivedInput = inferProcedureInput<typeof appRouter.pages.getArchived>;
      const input: GetArchivedInput = {
        workspaceId: testWorkspaceId,
      };

      const archivedPages = await caller.pages.getArchived(input);
      expect(archivedPages.length).toBeGreaterThan(0);
      expect(archivedPages[0].id).toBe(testPageId);
      expect(archivedPages[0].archived).toBe(true);
    });

    it("should unarchive a page", async () => {
      const caller = appRouter.createCaller(ctx);

      type UnarchiveInput = inferProcedureInput<typeof appRouter.pages.unarchive>;
      const input: UnarchiveInput = {
        id: testPageId,
      };

      const result = await caller.pages.unarchive(input);
      expect(result.success).toBe(true);

      // Verify page is unarchived
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [unarchivedPage] = await db
        .select()
        .from(pages)
        .where(eq(pages.id, testPageId));

      expect(unarchivedPage.archived).toBe(false);
      expect(unarchivedPage.archivedAt).toBeNull();
    });
  });

  describe("Global Search", () => {
    it("should search pages by title", async () => {
      const caller = appRouter.createCaller(ctx);

      type SearchInput = inferProcedureInput<typeof appRouter.search.global>;
      const input: SearchInput = {
        query: "Test Page",
        workspaceId: testWorkspaceId,
        limit: 50,
      };

      const results = await caller.search.global(input);
      expect(results.length).toBeGreaterThan(0);
      
      const pageResult = results.find(r => r.type === 'page' && r.id === testPageId);
      expect(pageResult).toBeTruthy();
      expect(pageResult?.title).toContain("Test Page");
    });

    it("should return empty results for non-matching query", async () => {
      const caller = appRouter.createCaller(ctx);

      type SearchInput = inferProcedureInput<typeof appRouter.search.global>;
      const input: SearchInput = {
        query: "NonExistentQueryXYZ123",
        workspaceId: testWorkspaceId,
        limit: 50,
      };

      const results = await caller.search.global(input);
      expect(results.length).toBe(0);
    });

    it("should return empty results for empty query", async () => {
      const caller = appRouter.createCaller(ctx);

      type SearchInput = inferProcedureInput<typeof appRouter.search.global>;
      const input: SearchInput = {
        query: "",
        workspaceId: testWorkspaceId,
        limit: 50,
      };

      const results = await caller.search.global(input);
      expect(results.length).toBe(0);
    });

    it("should find multiple pages with search term", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create another page with search term
      const [anotherPage] = await db
        .insert(pages)
        .values({
          workspaceId: testWorkspaceId,
          title: "Another Page with Test keyword",
          icon: "📄",
          position: 1,
          archived: false,
          createdBy: testUserId,
        })
        .$returningId();

      const caller = appRouter.createCaller(ctx);

      type SearchInput = inferProcedureInput<typeof appRouter.search.global>;
      const input: SearchInput = {
        query: "Test",
        workspaceId: testWorkspaceId,
        limit: 50,
      };

      const results = await caller.search.global(input);
      
      // Should find at least 2 pages
      expect(results.length).toBeGreaterThanOrEqual(2);
      
      // Both pages should be in results
      const hasOriginalPage = results.some(r => r.id === testPageId && r.type === 'page');
      const hasAnotherPage = results.some(r => r.id === anotherPage.id && r.type === 'page');
      
      expect(hasOriginalPage).toBe(true);
      expect(hasAnotherPage).toBe(true);

      // Clean up
      await db.delete(pages).where(eq(pages.id, anotherPage.id));
    });
  });
});
