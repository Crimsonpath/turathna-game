import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import {
  gameRooms,
  teams,
  players,
  culturalPacks,
  questions,
  playerAnswers,
  InsertGameRoom,
  InsertTeam,
  InsertPlayer,
  InsertCulturalPack,
  InsertQuestion,
  InsertPlayerAnswer,
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
  });

  return { roomCode, id: Number(result[0].insertId) };
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

  const result = await db.insert(teams).values(data);
  return Number(result[0].insertId);
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

  const result = await db.insert(players).values(data);
  return Number(result[0].insertId);
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

  const result = await db.insert(culturalPacks).values(data);
  return Number(result[0].insertId);
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

  const result = await db.insert(questions).values(data);
  return Number(result[0].insertId);
}

// Player Answer operations
export async function createPlayerAnswer(data: InsertPlayerAnswer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(playerAnswers).values(data);
  return Number(result[0].insertId);
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
