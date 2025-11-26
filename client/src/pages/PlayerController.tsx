import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Gamepad2, Trophy } from "lucide-react";
import { useParams, useSearch } from "wouter";
import { toast } from "sonner";

export default function PlayerController() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const search = useSearch();
  const playerId = new URLSearchParams(search).get("playerId");

  const { data: roomState, isLoading } = trpc.game.getRoomState.useQuery(
    { roomCode: roomCode || "" },
    { enabled: !!roomCode, refetchInterval: 2000 }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-orange-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-teal-400" />
      </div>
    );
  }

  if (!roomState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-orange-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 p-8 text-center">
          <p className="text-white text-xl">Room not found</p>
        </Card>
      </div>
    );
  }

  const { room, players } = roomState;
  const currentPlayer = players.find((p) => p.id === Number(playerId));

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-orange-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 p-8 text-center">
          <p className="text-white text-xl">Player not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-orange-900 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <Card className="bg-slate-800/50 border-teal-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Room Code</p>
                <p className="text-2xl font-bold text-white font-mono">{roomCode}</p>
              </div>
              <Gamepad2 className="w-8 h-8 text-teal-400" />
            </div>
          </CardHeader>
        </Card>

        {/* Player Info */}
        <Card className="bg-slate-800/50 border-orange-500/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-5xl">👤</div>
              <p className="text-2xl font-bold text-white">{currentPlayer.playerName}</p>
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-orange-400" />
                <p className="text-gray-400">Score: 0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Status */}
        {room.status === "lobby" && (
          <Card className="bg-slate-800/50 border-teal-500/30 p-6">
            <div className="text-center space-y-4">
              <div className="text-4xl">⏳</div>
              <h3 className="text-xl font-bold text-white">Waiting for Game to Start</h3>
              <p className="text-gray-400">
                {players.length} player{players.length !== 1 ? "s" : ""} in the lobby
              </p>
              <div className="pt-4">
                <Loader2 className="w-8 h-8 animate-spin text-teal-400 mx-auto" />
              </div>
            </div>
          </Card>
        )}

        {room.status === "playing" && (
          <Card className="bg-slate-800/50 border-teal-500/30 p-6">
            <CardTitle className="text-center text-white mb-6">
              Round {room.currentRound} / 5
            </CardTitle>
            <div className="space-y-4">
              <div className="text-center text-gray-400 mb-6">
                <p>Waiting for question...</p>
                <Loader2 className="w-8 h-8 animate-spin text-teal-400 mx-auto mt-4" />
              </div>
            </div>
          </Card>
        )}

        {room.status === "finished" && (
          <Card className="bg-slate-800/50 border-orange-500/30 p-6">
            <div className="text-center space-y-4">
              <div className="text-5xl">🏆</div>
              <h3 className="text-2xl font-bold text-white">Game Finished!</h3>
              <p className="text-gray-400">Thanks for playing!</p>
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-slate-800/30 border-gray-700/30 p-4">
          <p className="text-gray-400 text-sm text-center">
            Keep this screen open during the game. You'll use it to answer questions and see your score.
          </p>
        </Card>
      </div>
    </div>
  );
}
