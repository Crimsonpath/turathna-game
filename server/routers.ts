import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  game: router({
    createRoom: publicProcedure.mutation(async ({ ctx }) => {
      const { createGameRoom } = await import("./gameDb");
      const userId = ctx.user?.id || 0;
      return await createGameRoom(userId);
    }),
    joinRoom: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "roomCode" in val && "playerName" in val) {
          return val as { roomCode: string; playerName: string };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        const { getGameRoomByCode, createPlayer } = await import("./gameDb");
        const room = await getGameRoomByCode(input.roomCode);
        if (!room) throw new Error("Room not found");

        const playerId = await createPlayer({
          gameRoomId: room.id,
          userId: ctx.user?.id,
          playerName: input.playerName,
          isReady: 0,
        });

        return { roomId: room.id, playerId };
      }),
    getCulturalPacks: publicProcedure.query(async () => {
      const { getAllCulturalPacks } = await import("./gameDb");
      return await getAllCulturalPacks();
    }),
    getRoomState: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "roomCode" in val) {
          return val as { roomCode: string };
        }
        throw new Error("Invalid input");
      })
      .query(async ({ input }) => {
        const { getGameRoomByCode, getTeamsByGameRoom, getPlayersByGameRoom, getGameSessionByRoomId } = await import("./gameDb");
        const room = await getGameRoomByCode(input.roomCode);
        if (!room) throw new Error("Room not found");

        const teams = await getTeamsByGameRoom(room.id);
        const players = await getPlayersByGameRoom(room.id);
        const session = await getGameSessionByRoomId(room.id);

        return { room, teams, players, session };
      }),
    setPlayerReady: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "playerId" in val && "isReady" in val) {
          return val as { playerId: number; isReady: boolean };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input }) => {
        const { updatePlayerReady } = await import("./gameDb");
        await updatePlayerReady(input.playerId, input.isReady);
        return { success: true };
      }),
    startGame: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "roomCode" in val && "culturalPackId" in val) {
          return val as { roomCode: string; culturalPackId: number; questionsCount?: number };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input }) => {
        const {
          getGameRoomByCode,
          updateGameRoomStatus,
          updateGameRoomRound,
          getQuestionsByCulturalPack,
          createGameSession
        } = await import("./gameDb");

        const room = await getGameRoomByCode(input.roomCode);
        if (!room) throw new Error("Room not found");
        if (room.status !== "lobby") throw new Error("Game already started");

        // Get questions for the cultural pack
        const allQuestions = await getQuestionsByCulturalPack(input.culturalPackId);
        if (allQuestions.length === 0) throw new Error("No questions available");

        // Shuffle and select questions (default 10)
        const questionsCount = input.questionsCount || 10;
        const shuffled = allQuestions.sort(() => Math.random() - 0.5);
        const selectedQuestions = shuffled.slice(0, Math.min(questionsCount, allQuestions.length));
        const questionIds = selectedQuestions.map(q => q.id);

        // Create game session
        await createGameSession({
          gameRoomId: room.id,
          culturalPackId: input.culturalPackId,
          currentQuestionIndex: 0,
          questionIds: JSON.stringify(questionIds),
          roundType: "standard",
        });

        // Update room status
        await updateGameRoomStatus(room.id, "playing");
        await updateGameRoomRound(room.id, 1);

        return { success: true, totalQuestions: questionIds.length };
      }),
    getCurrentQuestion: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "roomCode" in val) {
          return val as { roomCode: string; playerId?: number };
        }
        throw new Error("Invalid input");
      })
      .query(async ({ input }) => {
        const {
          getGameRoomByCode,
          getGameSessionByRoomId,
          getQuestionById,
          getPlayerAnswersForQuestion,
          getPlayerLifelines
        } = await import("./gameDb");

        const room = await getGameRoomByCode(input.roomCode);
        if (!room) throw new Error("Room not found");

        const session = await getGameSessionByRoomId(room.id);
        if (!session) throw new Error("Game session not found");

        const questionIds = JSON.parse(session.questionIds) as number[];
        const currentQuestionId = questionIds[session.currentQuestionIndex];

        if (!currentQuestionId) {
          return { finished: true, question: null, questionNumber: 0, totalQuestions: 0 };
        }

        const question = await getQuestionById(currentQuestionId);
        if (!question) throw new Error("Question not found");

        // Get answers for this question (to check who has answered)
        const answers = await getPlayerAnswersForQuestion(room.id, currentQuestionId);

        // Get lifelines used by this player (if playerId provided)
        let usedLifelines: string[] = [];
        if (input.playerId) {
          const lifelines = await getPlayerLifelines(room.id, input.playerId);
          usedLifelines = lifelines.map(l => l.lifelineType);
        }

        // Don't expose correct answer to players
        return {
          finished: false,
          question: {
            id: question.id,
            questionText: question.questionText,
            questionTextAr: question.questionTextAr,
            options: question.options,
            optionsAr: question.optionsAr,
            difficulty: question.difficulty,
            questionType: question.questionType,
          },
          questionNumber: session.currentQuestionIndex + 1,
          totalQuestions: questionIds.length,
          roundType: session.roundType,
          answeredPlayerIds: answers.map(a => a.playerId),
          usedLifelines,
        };
      }),
    submitAnswer: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "roomCode" in val && "playerId" in val && "answer" in val) {
          return val as { roomCode: string; playerId: number; answer: string };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input }) => {
        const {
          getGameRoomByCode,
          getGameSessionByRoomId,
          getQuestionById,
          createPlayerAnswer,
          incrementPlayerScore,
          getPlayerAnswersForQuestion
        } = await import("./gameDb");

        const room = await getGameRoomByCode(input.roomCode);
        if (!room) throw new Error("Room not found");
        if (room.status !== "playing") throw new Error("Game not in progress");

        const session = await getGameSessionByRoomId(room.id);
        if (!session) throw new Error("Game session not found");

        const questionIds = JSON.parse(session.questionIds) as number[];
        const currentQuestionId = questionIds[session.currentQuestionIndex];
        if (!currentQuestionId) throw new Error("No current question");

        // Check if player already answered this question
        const existingAnswers = await getPlayerAnswersForQuestion(room.id, currentQuestionId);
        if (existingAnswers.some(a => a.playerId === input.playerId)) {
          throw new Error("Already answered this question");
        }

        const question = await getQuestionById(currentQuestionId);
        if (!question) throw new Error("Question not found");

        const isCorrect = input.answer === question.correctAnswer;

        // Calculate points based on difficulty and round type
        let basePoints = 100;
        if (question.difficulty === "medium") basePoints = 150;
        if (question.difficulty === "hard") basePoints = 200;

        // Apply multipliers for special rounds
        if (session.roundType === "speed") basePoints = Math.floor(basePoints * 1.5);
        if (session.roundType === "final") basePoints = basePoints * 2;

        const pointsEarned = isCorrect ? basePoints : 0;

        // Record the answer
        await createPlayerAnswer({
          gameRoomId: room.id,
          playerId: input.playerId,
          questionId: currentQuestionId,
          roundNumber: room.currentRound,
          answer: input.answer,
          isCorrect: isCorrect ? 1 : 0,
          pointsEarned,
        });

        // Update player score
        if (isCorrect) {
          await incrementPlayerScore(input.playerId, pointsEarned);
        }

        return {
          isCorrect,
          pointsEarned,
          correctAnswer: question.correctAnswer
        };
      }),
    nextQuestion: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "roomCode" in val) {
          return val as { roomCode: string };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input }) => {
        const {
          getGameRoomByCode,
          getGameSessionByRoomId,
          updateGameSessionQuestionIndex,
          updateGameRoomStatus,
          updateGameRoomRound,
          updateGameSessionRoundType
        } = await import("./gameDb");

        const room = await getGameRoomByCode(input.roomCode);
        if (!room) throw new Error("Room not found");

        const session = await getGameSessionByRoomId(room.id);
        if (!session) throw new Error("Game session not found");

        const questionIds = JSON.parse(session.questionIds) as number[];
        const nextIndex = session.currentQuestionIndex + 1;

        // Check if game is finished
        if (nextIndex >= questionIds.length) {
          await updateGameRoomStatus(room.id, "finished");
          return { finished: true, questionNumber: nextIndex };
        }

        // Update round type based on question progress
        const progress = nextIndex / questionIds.length;
        if (progress >= 0.8) {
          // Last 20% of questions are "final" round with 2x points
          await updateGameSessionRoundType(session.id, "final");
          await updateGameRoomRound(room.id, 5);
        } else if (progress >= 0.6) {
          // 60-80% are "speed" round with 1.5x points
          await updateGameSessionRoundType(session.id, "speed");
          await updateGameRoomRound(room.id, 4);
        } else {
          // Calculate round number (1-3 for first 60%)
          const roundNum = Math.min(Math.floor(progress * 5) + 1, 3);
          await updateGameRoomRound(room.id, roundNum);
        }

        await updateGameSessionQuestionIndex(session.id, nextIndex);

        return { finished: false, questionNumber: nextIndex + 1 };
      }),
    useLifeline: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null &&
            "roomCode" in val && "playerId" in val && "lifelineType" in val) {
          return val as {
            roomCode: string;
            playerId: number;
            lifelineType: "fifty_fifty" | "ask_native" | "translate"
          };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input }) => {
        const {
          getGameRoomByCode,
          getGameSessionByRoomId,
          getQuestionById,
          hasUsedLifeline,
          useLifeline
        } = await import("./gameDb");

        const room = await getGameRoomByCode(input.roomCode);
        if (!room) throw new Error("Room not found");

        const session = await getGameSessionByRoomId(room.id);
        if (!session) throw new Error("Game session not found");

        // Check if lifeline already used
        const alreadyUsed = await hasUsedLifeline(room.id, input.playerId, input.lifelineType);
        if (alreadyUsed) throw new Error("Lifeline already used");

        const questionIds = JSON.parse(session.questionIds) as number[];
        const currentQuestionId = questionIds[session.currentQuestionIndex];
        if (!currentQuestionId) throw new Error("No current question");

        const question = await getQuestionById(currentQuestionId);
        if (!question) throw new Error("Question not found");

        // Record lifeline usage
        await useLifeline({
          gameRoomId: room.id,
          playerId: input.playerId,
          lifelineType: input.lifelineType,
          usedOnQuestionId: currentQuestionId,
        });

        // Return lifeline result based on type
        if (input.lifelineType === "fifty_fifty") {
          // Remove 2 wrong answers
          const options = JSON.parse(question.options || "[]") as string[];
          const correctLetter = question.correctAnswer;
          const wrongOptions = options.filter(opt => !opt.startsWith(correctLetter));
          const removedOptions = wrongOptions.slice(0, 2).map(opt => opt.charAt(0));
          return { type: "fifty_fifty", removedOptions };
        }

        if (input.lifelineType === "translate") {
          // Return Arabic version of question/options
          return {
            type: "translate",
            questionTextAr: question.questionTextAr,
            optionsAr: question.optionsAr,
          };
        }

        if (input.lifelineType === "ask_native") {
          // Simulate asking a "native" - gives a hint towards correct answer
          const correctLetter = question.correctAnswer;
          return {
            type: "ask_native",
            hint: `The native suggests option ${correctLetter} might be correct.`,
          };
        }

        return { type: input.lifelineType };
      }),
    getGameResults: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "roomCode" in val) {
          return val as { roomCode: string };
        }
        throw new Error("Invalid input");
      })
      .query(async ({ input }) => {
        const {
          getGameRoomByCode,
          getPlayersByGameRoom,
          getAllPlayerAnswers,
          getGameSessionByRoomId
        } = await import("./gameDb");

        const room = await getGameRoomByCode(input.roomCode);
        if (!room) throw new Error("Room not found");

        const players = await getPlayersByGameRoom(room.id);
        const allAnswers = await getAllPlayerAnswers(room.id);
        const session = await getGameSessionByRoomId(room.id);

        // Calculate stats for each player
        const playerStats = players.map(player => {
          const playerAnswers = allAnswers.filter(a => a.playerId === player.id);
          const correctAnswers = playerAnswers.filter(a => a.isCorrect === 1).length;
          const totalAnswers = playerAnswers.length;
          const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

          return {
            id: player.id,
            name: player.playerName,
            score: player.score,
            correctAnswers,
            totalAnswers,
            accuracy,
          };
        });

        // Sort by score descending
        playerStats.sort((a, b) => b.score - a.score);

        // Determine total questions
        let totalQuestions = 0;
        if (session) {
          const questionIds = JSON.parse(session.questionIds) as number[];
          totalQuestions = questionIds.length;
        }

        return {
          players: playerStats,
          totalQuestions,
          gameStatus: room.status,
        };
      }),
  }),
  solo: router({
    getRandomQuestions: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "culturalPackId" in val && "count" in val) {
          return val as { culturalPackId: number; count: number };
        }
        throw new Error("Invalid input");
      })
      .query(async ({ input }) => {
        const { getQuestionsByCulturalPack } = await import("./gameDb");
        const allQuestions = await getQuestionsByCulturalPack(input.culturalPackId);
        
        // Shuffle and take requested count
        const shuffled = allQuestions.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, input.count);
      }),
  }),
});

export type AppRouter = typeof appRouter;
