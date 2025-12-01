import { eq, and, inArray, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  gameRooms,
  teams,
  players,
  culturalPacks,
  questions,
  playerAnswers,
  gameSessions,
  playerLifelines,
  InsertTeam,
  InsertPlayer,
  InsertCulturalPack,
  InsertQuestion,
  InsertPlayerAnswer,
  InsertGameSession,
  InsertPlayerLifeline,
} from "../drizzle/schema";

// Generate a random 6-character room code
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Game Room operations
export async function createGameRoom(hostUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const roomCode = generateRoomCode();
  const result = await db.insert(gameRooms).values({
    roomCode,
    hostUserId,
    status: "lobby",
    currentRound: 0,
  }).returning({ id: gameRooms.id });

  return { roomCode, id: result[0].id };
}

export async function getGameRoomByCode(roomCode: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(gameRooms)
    .where(eq(gameRooms.roomCode, roomCode))
    .limit(1);

  return result[0] || null;
}

export async function updateGameRoomStatus(
  roomId: number,
  status: "lobby" | "playing" | "finished"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(gameRooms)
    .set({ status })
    .where(eq(gameRooms.id, roomId));
}

export async function updateGameRoomRound(roomId: number, round: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(gameRooms)
    .set({ currentRound: round })
    .where(eq(gameRooms.id, roomId));
}

// Team operations
export async function createTeam(data: InsertTeam) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(teams).values(data).returning({ id: teams.id });
  return result[0].id;
}

export async function getTeamsByGameRoom(gameRoomId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(teams)
    .where(eq(teams.gameRoomId, gameRoomId));
}

export async function updateTeamScore(teamId: number, score: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(teams)
    .set({ score })
    .where(eq(teams.id, teamId));
}

export async function updateTeamCultures(
  teamId: number,
  homeCulture: string,
  exchangeCulture: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(teams)
    .set({ homeCulture, exchangeCulture })
    .where(eq(teams.id, teamId));
}

// Player operations
export async function createPlayer(data: InsertPlayer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(players).values(data).returning({ id: players.id });
  return result[0].id;
}

export async function getPlayersByGameRoom(gameRoomId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(players)
    .where(eq(players.gameRoomId, gameRoomId));
}

export async function updatePlayerTeam(playerId: number, teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(players)
    .set({ teamId })
    .where(eq(players.id, playerId));
}

export async function updatePlayerReady(playerId: number, isReady: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(players)
    .set({ isReady: isReady ? 1 : 0 })
    .where(eq(players.id, playerId));
}

// Cultural Pack operations
export async function getAllCulturalPacks() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(culturalPacks);
}

export async function createCulturalPack(data: InsertCulturalPack) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(culturalPacks).values(data).returning({ id: culturalPacks.id });
  return result[0].id;
}

// Question operations
export async function getQuestionsByCulturalPack(culturalPackId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(questions)
    .where(eq(questions.culturalPackId, culturalPackId));
}

export async function createQuestion(data: InsertQuestion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(questions).values(data).returning({ id: questions.id });
  return result[0].id;
}

// Player Answer operations
export async function createPlayerAnswer(data: InsertPlayerAnswer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(playerAnswers).values(data).returning({ id: playerAnswers.id });
  return result[0].id;
}

export async function getPlayerAnswersByRound(
  gameRoomId: number,
  roundNumber: number
) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(playerAnswers)
    .where(
      and(
        eq(playerAnswers.gameRoomId, gameRoomId),
        eq(playerAnswers.roundNumber, roundNumber)
      )
    );
}

// Game Session operations
export async function createGameSession(data: InsertGameSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(gameSessions).values(data).returning({ id: gameSessions.id });
  return result[0].id;
}

export async function getGameSessionByRoomId(gameRoomId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.gameRoomId, gameRoomId))
    .limit(1);

  return result[0] || null;
}

export async function updateGameSessionQuestionIndex(
  sessionId: number,
  questionIndex: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(gameSessions)
    .set({
      currentQuestionIndex: questionIndex,
      questionStartedAt: sql`NOW()`
    })
    .where(eq(gameSessions.id, sessionId));
}

export async function updateGameSessionRoundType(
  sessionId: number,
  roundType: "standard" | "speed" | "final"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(gameSessions)
    .set({ roundType })
    .where(eq(gameSessions.id, sessionId));
}

// Player score operations
export async function updatePlayerScore(playerId: number, score: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(players)
    .set({ score })
    .where(eq(players.id, playerId));
}

export async function incrementPlayerScore(playerId: number, points: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(players)
    .set({ score: sql`score + ${points}` })
    .where(eq(players.id, playerId));
}

// Lifeline operations
export async function useLifeline(data: InsertPlayerLifeline) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(playerLifelines).values(data).returning({ id: playerLifelines.id });
  return result[0].id;
}

export async function getPlayerLifelines(gameRoomId: number, playerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(playerLifelines)
    .where(
      and(
        eq(playerLifelines.gameRoomId, gameRoomId),
        eq(playerLifelines.playerId, playerId)
      )
    );
}

export async function hasUsedLifeline(
  gameRoomId: number,
  playerId: number,
  lifelineType: "fifty_fifty" | "ask_native" | "translate"
) {
  const db = await getDb();
  if (!db) return true; // Return true to prevent use if db unavailable

  const result = await db
    .select()
    .from(playerLifelines)
    .where(
      and(
        eq(playerLifelines.gameRoomId, gameRoomId),
        eq(playerLifelines.playerId, playerId),
        eq(playerLifelines.lifelineType, lifelineType)
      )
    )
    .limit(1);

  return result.length > 0;
}

// Get questions by IDs
export async function getQuestionsByIds(questionIds: number[]) {
  const db = await getDb();
  if (!db) return [];

  if (questionIds.length === 0) return [];

  return await db
    .select()
    .from(questions)
    .where(inArray(questions.id, questionIds));
}

// Get single question by ID
export async function getQuestionById(questionId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(questions)
    .where(eq(questions.id, questionId))
    .limit(1);

  return result[0] || null;
}

// Get player answers for a specific question
export async function getPlayerAnswersForQuestion(
  gameRoomId: number,
  questionId: number
) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(playerAnswers)
    .where(
      and(
        eq(playerAnswers.gameRoomId, gameRoomId),
        eq(playerAnswers.questionId, questionId)
      )
    );
}

// Get all player answers for a game room
export async function getAllPlayerAnswers(gameRoomId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(playerAnswers)
    .where(eq(playerAnswers.gameRoomId, gameRoomId));
}

// Get player by ID
export async function getPlayerById(playerId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(players)
    .where(eq(players.id, playerId))
    .limit(1);

  return result[0] || null;
}

// Get game room by ID
export async function getGameRoomById(roomId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(gameRooms)
    .where(eq(gameRooms.id, roomId))
    .limit(1);

  return result[0] || null;
}
