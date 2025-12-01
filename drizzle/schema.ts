import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Game room status enum
export const gameStatusEnum = pgEnum("game_status", ["lobby", "playing", "finished"]);

// Game rooms
export const gameRooms = pgTable("game_rooms", {
  id: serial("id").primaryKey(),
  roomCode: varchar("room_code", { length: 6 }).notNull().unique(),
  hostUserId: integer("host_user_id").notNull(),
  status: gameStatusEnum("status").default("lobby").notNull(),
  currentRound: integer("current_round").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Teams in a game
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  gameRoomId: integer("game_room_id").notNull(),
  teamName: varchar("team_name", { length: 50 }).notNull(),
  homeCulture: varchar("home_culture", { length: 50 }),
  exchangeCulture: varchar("exchange_culture", { length: 50 }),
  score: integer("score").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Players in teams
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  gameRoomId: integer("game_room_id").notNull(),
  teamId: integer("team_id"),
  userId: integer("user_id"),
  playerName: varchar("player_name", { length: 100 }).notNull(),
  isReady: integer("is_ready").default(0).notNull(),
  score: integer("score").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Cultural packs
export const culturalPacks = pgTable("cultural_packs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  description: text("description"),
  iconUrl: varchar("icon_url", { length: 500 }),
  isPremium: integer("is_premium").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Question type enum
export const questionTypeEnum = pgEnum("question_type", ["multiple_choice", "numerical", "find_link"]);

// Difficulty enum
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);

// Questions
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  culturalPackId: integer("cultural_pack_id").notNull(),
  questionText: text("question_text").notNull(),
  questionTextAr: text("question_text_ar"),
  questionType: questionTypeEnum("question_type").notNull(),
  correctAnswer: varchar("correct_answer", { length: 500 }).notNull(),
  options: text("options"), // JSON array
  optionsAr: text("options_ar"), // JSON array
  difficulty: difficultyEnum("difficulty").default("medium").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Player answers
export const playerAnswers = pgTable("player_answers", {
  id: serial("id").primaryKey(),
  gameRoomId: integer("game_room_id").notNull(),
  playerId: integer("player_id").notNull(),
  questionId: integer("question_id").notNull(),
  roundNumber: integer("round_number").notNull(),
  answer: varchar("answer", { length: 500 }),
  isCorrect: integer("is_correct"),
  pointsEarned: integer("points_earned").default(0).notNull(),
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
});

// Round type enum
export const roundTypeEnum = pgEnum("round_type", ["standard", "speed", "final"]);

// Game sessions - tracks active game state
export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  gameRoomId: integer("game_room_id").notNull(),
  culturalPackId: integer("cultural_pack_id").notNull(),
  currentQuestionIndex: integer("current_question_index").default(0).notNull(),
  questionIds: text("question_ids").notNull(), // JSON array of question IDs
  questionStartedAt: timestamp("question_started_at"),
  roundType: roundTypeEnum("round_type").default("standard").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Lifeline type enum
export const lifelineTypeEnum = pgEnum("lifeline_type", ["fifty_fifty", "ask_native", "translate"]);

// Player lifelines - tracks lifelines used by each player
export const playerLifelines = pgTable("player_lifelines", {
  id: serial("id").primaryKey(),
  gameRoomId: integer("game_room_id").notNull(),
  playerId: integer("player_id").notNull(),
  lifelineType: lifelineTypeEnum("lifeline_type").notNull(),
  usedOnQuestionId: integer("used_on_question_id").notNull(),
  usedAt: timestamp("used_at").defaultNow().notNull(),
});

export type GameRoom = typeof gameRooms.$inferSelect;
export type InsertGameRoom = typeof gameRooms.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;
export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;
export type CulturalPack = typeof culturalPacks.$inferSelect;
export type InsertCulturalPack = typeof culturalPacks.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;
export type PlayerAnswer = typeof playerAnswers.$inferSelect;
export type InsertPlayerAnswer = typeof playerAnswers.$inferInsert;
export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = typeof gameSessions.$inferInsert;
export type PlayerLifeline = typeof playerLifelines.$inferSelect;
export type InsertPlayerLifeline = typeof playerLifelines.$inferInsert;
