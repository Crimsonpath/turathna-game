# CLAUDE.md - Turathna Cultural Exchange Trivia Game

## Project Overview

Turathna is a bilingual (English/Arabic) multiplayer cultural trivia game built with a full-stack TypeScript architecture. Players learn about different cultures through interactive quiz gameplay.

## Tech Stack

- **Frontend**: React 19, TailwindCSS 4, shadcn/ui, Wouter (routing)
- **Backend**: Express 4, tRPC 11 (type-safe APIs)
- **Database**: MySQL/TiDB with Drizzle ORM
- **Dev Tools**: TypeScript 5.9, Vite 7, Vitest

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run type check
pnpm check

# Run tests
pnpm test

# Build for production
pnpm build
```

## Project Structure

```
turathna-game/
├── client/                 # React frontend
│   └── src/
│       ├── pages/          # Page components
│       │   ├── Home.tsx           # Landing page with game modes
│       │   ├── SoloPlay.tsx       # Solo quiz interface
│       │   ├── HostDisplay.tsx    # TV/projector display for host
│       │   └── PlayerController.tsx # Mobile player interface
│       ├── components/     # UI components (shadcn/ui)
│       ├── lib/            # tRPC client, utilities
│       └── hooks/          # Custom React hooks
├── server/                 # Express backend
│   ├── _core/              # Core infrastructure (auth, OAuth)
│   ├── routers.ts          # tRPC API routes
│   ├── gameDb.ts           # Game database queries
│   └── db.ts               # Database connection
├── drizzle/                # Database
│   ├── schema.ts           # Table definitions
│   └── migrations/         # SQL migrations
├── shared/                 # Shared types between client/server
└── scripts/                # Database seeding scripts
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | OAuth user accounts |
| `gameRooms` | Multiplayer game rooms |
| `teams` | Teams within games |
| `players` | Players in rooms (with scores) |
| `culturalPacks` | Cultural content categories (Egypt, Japan, Mexico, Kuwait) |
| `questions` | Bilingual trivia questions |
| `playerAnswers` | Answer tracking |
| `gameSessions` | Active game state |
| `playerLifelines` | Lifeline usage tracking |

## Key API Endpoints (tRPC)

### Game Management
- `game.createRoom` - Create a new game room
- `game.joinRoom` - Join existing room with player name
- `game.getRoomState` - Get room, players, and session state
- `game.startGame` - Start game with selected cultural pack
- `game.getCurrentQuestion` - Get current question for players
- `game.submitAnswer` - Submit player answer
- `game.nextQuestion` - Advance to next question
- `game.getGameResults` - Get final leaderboard

### Lifelines
- `game.useLifeline` - Use 50/50, Ask Native, or Translate

### Solo Mode
- `solo.getRandomQuestions` - Get random questions for solo play

## Game Features

### Game Modes
1. **Solo Play**: Practice trivia alone with any cultural pack
2. **Multiplayer**: Host creates room, players join via code

### Scoring System
- Easy questions: 100 points
- Medium questions: 150 points
- Hard questions: 200 points
- Speed Round (60-80%): 1.5x multiplier
- Final Round (80-100%): 2x multiplier

### Lifelines (one-time use per game)
- **50/50**: Remove two wrong answers
- **Ask the Native**: Get a hint towards correct answer
- **Translate**: Show Arabic version of question

### Cultural Packs
- Egypt (13 questions)
- Japan (13 questions)
- Mexico (13 questions)
- Kuwait (13 questions)

## Environment Variables

```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-secret-key
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
VITE_APP_ID=your-app-id
```

## Common Tasks

### Add New Questions
Edit `scripts/seed-expanded-questions.mjs` and run:
```bash
npx tsx scripts/seed-expanded-questions.mjs
```

### Run Database Migrations
```bash
pnpm db:push
```

### Type Check
```bash
pnpm check
```

## Testing

Tests are integration tests that require database connection:
- `server/game.test.ts` - Game room management tests
- `server/solo.test.ts` - Solo play mode tests
- `server/auth.logout.test.ts` - Authentication tests

## Code Conventions

- TypeScript strict mode enabled
- tRPC for type-safe API calls
- Drizzle ORM for database operations
- shadcn/ui components for consistent UI
- Bilingual support (English + Arabic) throughout
