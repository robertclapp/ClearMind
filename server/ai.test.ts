import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("AI Features", () => {
  it("breakdownTask returns subtasks array", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.breakdownTask({
      taskDescription: "Plan a birthday party",
    });

    expect(result).toHaveProperty("subtasks");
    expect(Array.isArray(result.subtasks)).toBe(true);
    expect(result.subtasks.length).toBeGreaterThan(0);
  });

  it("improveWriting returns improved text", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.improveWriting({
      text: "This is a test sentence.",
      instruction: "Make it more professional",
    });

    expect(result).toHaveProperty("improvedText");
    expect(typeof result.improvedText).toBe("string");
    expect(result.improvedText.length).toBeGreaterThan(0);
  });

  it.skip("generateImage returns image URL (requires external API)", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.generateImage({
      prompt: "A beautiful sunset over mountains",
    });

    expect(result).toHaveProperty("url");
    expect(typeof result.url).toBe("string");
    expect(result.url.length).toBeGreaterThan(0);
  }, 30000);
});
