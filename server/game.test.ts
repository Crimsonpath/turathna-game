import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { generateRoomCode } from "./gameDb";

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

describe("Game Room Management", () => {
  it("generates valid room codes", () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[A-Z0-9]+$/);
  });

  it("creates a game room successfully", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.game.createRoom();

    expect(result).toHaveProperty("roomCode");
    expect(result).toHaveProperty("id");
    expect(result.roomCode).toHaveLength(6);
    expect(result.id).toBeGreaterThan(0);
  });

  it("retrieves cultural packs", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const packs = await caller.game.getCulturalPacks();

    expect(Array.isArray(packs)).toBe(true);
    expect(packs.length).toBeGreaterThan(0);
    
    const firstPack = packs[0];
    expect(firstPack).toHaveProperty("name");
    expect(firstPack).toHaveProperty("nameAr");
  });

  it("allows players to join a room", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First create a room
    const room = await caller.game.createRoom();

    // Then join it
    const joinResult = await caller.game.joinRoom({
      roomCode: room.roomCode,
      playerName: "Test Player",
    });

    expect(joinResult).toHaveProperty("roomId");
    expect(joinResult).toHaveProperty("playerId");
    expect(joinResult.playerId).toBeGreaterThan(0);
  });

  it("retrieves room state with players", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create room and join
    const room = await caller.game.createRoom();
    await caller.game.joinRoom({
      roomCode: room.roomCode,
      playerName: "Player One",
    });

    // Get room state
    const state = await caller.game.getRoomState({
      roomCode: room.roomCode,
    });

    expect(state).toHaveProperty("room");
    expect(state).toHaveProperty("teams");
    expect(state).toHaveProperty("players");
    expect(state.room.roomCode).toBe(room.roomCode);
    expect(state.players.length).toBe(1);
    expect(state.players[0]?.playerName).toBe("Player One");
  });

  it("fails to join non-existent room", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.game.joinRoom({
        roomCode: "INVALID",
        playerName: "Test Player",
      })
    ).rejects.toThrow("Room not found");
  });
});
