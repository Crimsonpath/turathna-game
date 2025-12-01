-- Turathna Game Database Schema for PostgreSQL/Supabase
-- Converted from MySQL schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  "openId" VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  "loginMethod" VARCHAR(64),
  role VARCHAR(20) DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'admin')),
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "lastSignedIn" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Game rooms table
CREATE TABLE IF NOT EXISTS game_rooms (
  id SERIAL PRIMARY KEY,
  room_code VARCHAR(6) NOT NULL UNIQUE,
  host_user_id INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'lobby' NOT NULL CHECK (status IN ('lobby', 'playing', 'finished')),
  current_round INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  game_room_id INTEGER NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  team_name VARCHAR(50) NOT NULL,
  home_culture VARCHAR(50),
  exchange_culture VARCHAR(50),
  score INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  game_room_id INTEGER NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  player_name VARCHAR(100) NOT NULL,
  is_ready INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Cultural packs table
CREATE TABLE IF NOT EXISTS cultural_packs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100),
  description TEXT,
  icon_url VARCHAR(500),
  is_premium INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  cultural_pack_id INTEGER NOT NULL REFERENCES cultural_packs(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_text_ar TEXT,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('multiple_choice', 'numerical', 'find_link')),
  correct_answer VARCHAR(500) NOT NULL,
  options TEXT,
  options_ar TEXT,
  difficulty VARCHAR(20) DEFAULT 'medium' NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Player answers table
CREATE TABLE IF NOT EXISTS player_answers (
  id SERIAL PRIMARY KEY,
  game_room_id INTEGER NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  answer VARCHAR(500),
  is_correct INTEGER,
  points_earned INTEGER DEFAULT 0 NOT NULL,
  answered_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_game_rooms_room_code ON game_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_teams_game_room_id ON teams(game_room_id);
CREATE INDEX IF NOT EXISTS idx_players_game_room_id ON players(game_room_id);
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_questions_cultural_pack_id ON questions(cultural_pack_id);
CREATE INDEX IF NOT EXISTS idx_player_answers_game_room_id ON player_answers(game_room_id);
CREATE INDEX IF NOT EXISTS idx_player_answers_player_id ON player_answers(player_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to game_rooms table
CREATE TRIGGER update_game_rooms_updated_at BEFORE UPDATE ON game_rooms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
