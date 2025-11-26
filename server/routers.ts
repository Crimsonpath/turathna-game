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
        const { getGameRoomByCode, getTeamsByGameRoom, getPlayersByGameRoom } = await import("./gameDb");
        const room = await getGameRoomByCode(input.roomCode);
        if (!room) throw new Error("Room not found");
        
        const teams = await getTeamsByGameRoom(room.id);
        const players = await getPlayersByGameRoom(room.id);
        
        return { room, teams, players };
      }),
  }),
});

export type AppRouter = typeof appRouter;
