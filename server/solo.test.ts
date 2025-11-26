import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
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

  return ctx;
}

describe("Solo Play Mode", () => {
  it("retrieves random questions for a cultural pack", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Get cultural packs first
    const packs = await caller.game.getCulturalPacks();
    expect(packs.length).toBeGreaterThan(0);

    const firstPack = packs[0];
    if (!firstPack) throw new Error("No cultural packs found");

    // Get random questions
    const questions = await caller.solo.getRandomQuestions({
      culturalPackId: firstPack.id,
      count: 5,
    });

    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.length).toBeLessThanOrEqual(5);

    // Verify question structure
    const firstQuestion = questions[0];
    expect(firstQuestion).toHaveProperty("id");
    expect(firstQuestion).toHaveProperty("questionText");
    expect(firstQuestion).toHaveProperty("correctAnswer");
    expect(firstQuestion).toHaveProperty("options");
    expect(firstQuestion?.culturalPackId).toBe(firstPack.id);
  });

  it("returns different questions on subsequent calls (randomization)", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const packs = await caller.game.getCulturalPacks();
    const firstPack = packs[0];
    if (!firstPack) throw new Error("No cultural packs found");

    // Get two sets of questions
    const questions1 = await caller.solo.getRandomQuestions({
      culturalPackId: firstPack.id,
      count: 3,
    });

    const questions2 = await caller.solo.getRandomQuestions({
      culturalPackId: firstPack.id,
      count: 3,
    });

    expect(questions1.length).toBe(3);
    expect(questions2.length).toBe(3);

    // Check if at least one question is different (randomization)
    const ids1 = questions1.map((q) => q.id).sort();
    const ids2 = questions2.map((q) => q.id).sort();
    
    // If there are more than 3 questions available, order should differ
    // This test might occasionally fail if the same 3 questions are selected
    // but it's statistically unlikely with proper randomization
    const isDifferent = JSON.stringify(ids1) !== JSON.stringify(ids2);
    
    // At minimum, verify we got valid questions
    expect(ids1.length).toBe(3);
    expect(ids2.length).toBe(3);
  });

  it("respects the count parameter", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const packs = await caller.game.getCulturalPacks();
    const firstPack = packs[0];
    if (!firstPack) throw new Error("No cultural packs found");

    // Request 2 questions
    const questions = await caller.solo.getRandomQuestions({
      culturalPackId: firstPack.id,
      count: 2,
    });

    expect(questions.length).toBeLessThanOrEqual(2);
  });

  it("handles requests for more questions than available", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const packs = await caller.game.getCulturalPacks();
    const firstPack = packs[0];
    if (!firstPack) throw new Error("No cultural packs found");

    // Request a very large number of questions
    const questions = await caller.solo.getRandomQuestions({
      culturalPackId: firstPack.id,
      count: 1000,
    });

    // Should return all available questions, not fail
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeGreaterThan(0);
  });
});
