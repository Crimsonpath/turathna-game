# Turathna (تراثنا) - Cultural Exchange Trivia Game

**Turathna** (meaning "Our Heritage" in Arabic) is a bilingual trivia game designed to promote cultural exchange and learning. Players can practice solo or compete in multiplayer mode while discovering fascinating facts about different cultures around the world.

## 🎯 Project Overview

Turathna combines entertainment with education, rewarding players for learning about cultures different from their own through a unique **Cultural Exchange Bonus** system (1.5x points multiplier). The game features bilingual support (English/Arabic) and includes cultural content from Egypt, Japan, Mexico, and Kuwait.

### Key Features

**Solo Practice Mode** allows individual players to practice at their own pace, selecting from four cultural packs with 13 questions each. The interface includes bilingual question display with instant language switching, real-time score tracking, and comprehensive results summary with accuracy percentage.

**Multiplayer Party Mode** (foundation implemented) enables hosts to create game rooms with unique 6-character codes. Players join via mobile devices as controllers while the host display shows questions on a TV or projector. The system includes real-time room state synchronization and player lobby management.

**Cultural Content** spans 52 bilingual questions across four cultural packs covering history, traditions, food, geography, and landmarks. Questions are categorized by difficulty (easy, medium, hard) and support both English and Arabic languages.

**Technical Architecture** utilizes a modern full-stack approach with React 19 for the frontend, tRPC 11 for type-safe API communication, Express 4 as the backend server, MySQL/TiDB for database storage, and Drizzle ORM for database management.

## 📁 Project Structure

The project follows a monorepo structure with clear separation between client and server code:

```
turathna-game/
├── client/                    # Frontend React application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── pages/           # Page components
│   │   │   ├── Home.tsx     # Landing page with game mode selection
│   │   │   ├── SoloPlay.tsx # Solo practice interface
│   │   │   ├── HostDisplay.tsx      # Host screen for multiplayer
│   │   │   └── PlayerController.tsx # Player mobile interface
│   │   ├── components/      # Reusable UI components
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── lib/            # Utilities and tRPC client
│   │   ├── contexts/       # React contexts
│   │   ├── App.tsx         # Main app with routing
│   │   └── main.tsx        # Entry point
│   └── index.html
├── server/                   # Backend Express + tRPC
│   ├── _core/              # Core server infrastructure
│   ├── routers.ts          # tRPC API routes
│   ├── db.ts               # Database helpers
│   ├── gameDb.ts           # Game-specific queries
│   ├── *.test.ts           # Vitest test files
│   └── storage.ts          # S3 storage helpers
├── drizzle/                 # Database schema and migrations
│   ├── schema.ts           # Database table definitions
│   └── migrations/         # SQL migration files
├── scripts/                 # Database seeding scripts
│   ├── seed.mjs            # Initial data seeding
│   └── seed-expanded-questions.mjs  # Additional questions
├── shared/                  # Shared types and constants
├── package.json            # Dependencies and scripts
├── drizzle.config.ts       # Drizzle ORM configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

## 🚀 Getting Started

### Prerequisites

Before setting up the project, ensure you have the following installed on your system:

- **Node.js** version 22.x or higher
- **pnpm** package manager (version 10.x recommended)
- **MySQL** or **TiDB** database instance
- **Git** for version control

### Installation Steps

First, clone the repository to your local machine:

```bash
git clone <repository-url>
cd turathna-game
```

Install all project dependencies using pnpm:

```bash
pnpm install
```

Configure your environment variables by creating a `.env` file in the project root. The following variables are required:

```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-jwt-secret-key
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
VITE_APP_ID=your-app-id
OWNER_OPEN_ID=your-owner-open-id
OWNER_NAME=Your Name
```

Initialize the database schema by running the migration command:

```bash
pnpm db:push
```

Seed the database with initial cultural packs and questions:

```bash
npx tsx scripts/seed.mjs
npx tsx scripts/seed-expanded-questions.mjs
```

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## 🧪 Testing

The project includes comprehensive test coverage using Vitest. Tests are located alongside the code they test in the `server/` directory.

Run all tests with the following command:

```bash
pnpm test
```

Current test coverage includes authentication flows (logout functionality), game room management (creation, joining, state retrieval), and solo play mode (question retrieval and randomization). All 11 tests pass successfully.

### Test Files

The test suite is organized into three main files:

- `server/auth.logout.test.ts` - Authentication and session management tests
- `server/game.test.ts` - Multiplayer game room functionality tests
- `server/solo.test.ts` - Solo practice mode tests

## 🏗️ Architecture & Technology Stack

### Frontend Technologies

The client application is built with **React 19** using functional components and hooks. **Wouter** provides lightweight client-side routing with minimal bundle size. **TailwindCSS 4** handles styling with a utility-first approach and custom design tokens. **shadcn/ui** components provide accessible, customizable UI primitives. **tRPC React Query** integration enables type-safe API calls with automatic TypeScript inference.

### Backend Technologies

The server runs on **Express 4** with middleware for authentication and error handling. **tRPC 11** provides end-to-end type safety between client and server without code generation. **Drizzle ORM** manages database operations with a TypeScript-first approach. **MySQL/TiDB** serves as the relational database with support for complex queries. **Superjson** enables automatic serialization of complex types like Dates.

### Development Tools

**TypeScript 5.9** ensures type safety across the entire codebase. **Vite 7** provides fast development server and optimized production builds. **Vitest 2** offers a fast unit testing framework with Jest-compatible API. **pnpm** manages dependencies with efficient disk space usage and fast installs.

## 📊 Database Schema

The database schema is defined in `drizzle/schema.ts` and includes the following main tables:

### Core Tables

**users** table stores user authentication and profile information including openId (Manus OAuth identifier), name, email, loginMethod, role (user or admin), and timestamp fields for createdAt, updatedAt, and lastSignedIn.

**game_rooms** table manages multiplayer game sessions with roomCode (unique 6-character identifier), hostUserId, status (lobby, playing, finished), currentRound (0-5), and timestamp fields.

**teams** table represents teams within a game room, storing gameRoomId, teamName, homeCulture, exchangeCulture, score, and createdAt timestamp.

**players** table tracks individual players in game rooms with gameRoomId, teamId (nullable), userId (nullable), playerName, isReady flag, and createdAt timestamp.

### Content Tables

**cultural_packs** table defines available cultural content sets including name, nameAr (Arabic name), description, iconUrl, isPremium flag, and createdAt timestamp.

**questions** table stores trivia questions with culturalPackId, questionText, questionTextAr, questionType (multiple_choice, numerical, find_link), correctAnswer, options (JSON array), optionsAr (JSON array), difficulty (easy, medium, hard), and createdAt timestamp.

**player_answers** table records player responses with gameRoomId, playerId, questionId, roundNumber, answer, isCorrect flag, pointsEarned, and answeredAt timestamp.

### Schema Relationships

The schema establishes clear relationships between entities. Game rooms contain multiple teams and players. Teams belong to specific game rooms and can have multiple players. Cultural packs contain multiple questions. Player answers reference specific players, questions, and game rooms.

## 🎮 Game Mechanics (Planned)

The full multiplayer experience is designed around five distinct rounds:

**Round 1: Classic Trivia** presents standard multiple-choice questions with points awarded for correct answers. The Cultural Exchange Bonus (1.5x) applies when answering questions about the team's Exchange Culture.

**Round 2: The Wager** allows teams to bet points on their confidence level before seeing the question, introducing strategic risk-reward gameplay.

**Round 3: Find the Link** challenges teams to identify connections between seemingly unrelated items, testing pattern recognition and cultural knowledge.

**Round 4: Speed Challenge** features rapid-fire questions with decreasing point values over time, rewarding quick thinking and recall.

**Round 5: Final Exchange** serves as the climactic round with double points (2x multiplier) and the Cultural Exchange Bonus still active for a potential 3x multiplier.

### Lifelines (Planned)

Three lifeline mechanics enhance gameplay strategy:

**Ask the Native** reveals a hint from someone familiar with the culture in question, providing contextual clues without giving away the answer directly.

**50/50** eliminates two incorrect answer options, improving odds from 25% to 50% for multiple-choice questions.

**Translate** displays the question in the alternative language, helping bilingual players leverage their language skills.

## 🔧 API Reference

The tRPC API is organized into logical routers accessible through the unified `appRouter`.

### Authentication Router (`auth`)

The `me` query returns the current authenticated user or null if not logged in. The `logout` mutation clears the session cookie and logs out the current user.

### Game Router (`game`)

The `createRoom` mutation creates a new game room and returns roomCode and room ID. The `joinRoom` mutation adds a player to an existing room, requiring roomCode and playerName parameters. The `getCulturalPacks` query retrieves all available cultural packs. The `getRoomState` query fetches complete room information including room details, teams, and players for a given roomCode.

### Solo Router (`solo`)

The `getRandomQuestions` query returns a randomized set of questions from a specified cultural pack, accepting culturalPackId and count parameters.

## 🎨 UI/UX Design

The application features a cohesive dark theme with gradient backgrounds transitioning from teal through slate to orange. This color scheme creates visual depth while maintaining readability. The design incorporates glassmorphism effects using backdrop blur and semi-transparent backgrounds for a modern aesthetic.

Typography combines system fonts for body text with monospace fonts for room codes and technical elements. The bilingual interface seamlessly switches between English and Arabic, with proper RTL support where needed.

Component styling follows a consistent pattern using shadcn/ui as the foundation. Cards use semi-transparent backgrounds with colored borders matching their function (purple for solo mode, teal for hosting, orange for joining). Buttons feature gradient backgrounds with hover states that intensify the colors.

The responsive layout adapts to different screen sizes. The home page uses a three-column grid on desktop that collapses to a single column on mobile. The solo play interface is optimized for mobile-first interaction with large touch targets. The host display is designed for large screens (TV/projector) with high contrast and large text.

## 📝 Development Workflow

### Adding New Questions

To add more questions to the database, create a new seed script in the `scripts/` directory following the pattern established in `seed-expanded-questions.mjs`. Each question object should include all required fields with both English and Arabic translations. Run the script using `npx tsx scripts/your-script.mjs` to populate the database.

### Extending Cultural Packs

New cultural packs can be added by inserting records into the `cultural_packs` table through a seed script. Ensure each pack has a unique name, Arabic translation, descriptive text, and associated icon. After adding a pack, create corresponding questions referencing the new pack's ID.

### Implementing Multiplayer Logic

The foundation for multiplayer is in place with room management and player tracking. To complete the implementation, add WebSocket support for real-time communication, implement the five round types with their specific mechanics, create the scoring system with Cultural Exchange Bonus calculation, and build the host display question presentation interface.

### Adding New Features

When adding new features, follow the established patterns. Define database schema changes in `drizzle/schema.ts` and run `pnpm db:push` to apply migrations. Create database helper functions in `server/gameDb.ts` for reusable queries. Add tRPC procedures in `server/routers.ts` with proper input validation. Build React components in `client/src/pages/` or `client/src/components/`. Write tests in `server/*.test.ts` to ensure functionality works as expected.

## 🚢 Deployment

The application is designed to deploy on the Manus platform, which provides managed hosting, database, authentication, and storage services. The deployment process is streamlined through the Manus interface.

### Pre-deployment Checklist

Before deploying, ensure all tests pass by running `pnpm test`. Verify the build completes successfully with `pnpm build`. Confirm all environment variables are properly configured in the Manus dashboard. Review the database schema and ensure migrations are applied.

### Deployment Steps

Create a checkpoint using the Manus interface, which captures the current project state. Click the "Publish" button in the Manus dashboard to deploy the checkpoint to production. The platform automatically handles SSL certificates, domain configuration, and scaling.

### Post-deployment

After deployment, verify the application is accessible at the assigned domain. Test core functionality including solo play, room creation, and database connectivity. Monitor the application logs for any errors or warnings. Set up analytics to track user engagement and identify areas for improvement.

## 🤝 Contributing

Contributions to Turathna are welcome. When contributing, please follow these guidelines:

Maintain the existing code style and formatting conventions. Write tests for new features and ensure all existing tests continue to pass. Update documentation to reflect any changes in functionality or API. Use meaningful commit messages that clearly describe the changes made.

### Code Style

The project uses TypeScript with strict type checking enabled. Follow the established patterns for tRPC procedures, React components, and database queries. Use functional components with hooks rather than class components. Prefer composition over inheritance when designing component hierarchies.

### Pull Request Process

Fork the repository and create a feature branch for your changes. Make your changes with clear, atomic commits. Run the test suite and ensure all tests pass. Update the README and other documentation as needed. Submit a pull request with a clear description of the changes and their purpose.

## 📄 License

This project is developed as a prototype for educational and demonstration purposes. The codebase is available for learning and reference.

## 🙏 Acknowledgments

This project was created based on comprehensive research into existing trivia games including مخمخ (Mkhmkh), سين جيم (Seen Jeem), Kahoot!, Wits & Wagers, and Jackbox Party Pack. The game design incorporates proven mechanics from these successful titles while introducing the unique Cultural Exchange concept.

The technical implementation leverages the Manus platform for rapid development and deployment. The UI components are built on shadcn/ui, providing accessible and customizable primitives. The bilingual content aims to bridge cultures and promote mutual understanding through engaging gameplay.

---

**Built with ❤️ by Manus AI**

For questions, issues, or feature requests, please open an issue on the GitHub repository.
