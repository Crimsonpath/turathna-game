import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Users, Copy, Check } from "lucide-react";
import { useParams } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function HostDisplay() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [copied, setCopied] = useState(false);

  const { data: roomState, isLoading } = trpc.game.getRoomState.useQuery(
    { roomCode: roomCode || "" },
    { enabled: !!roomCode, refetchInterval: 2000 }
  );

  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      toast.success("Room code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-orange-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-teal-400" />
      </div>
    );
  }

  if (!roomState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-orange-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 p-8 text-center">
          <p className="text-white text-xl">Room not found</p>
        </Card>
      </div>
    );
  }

  const { room, teams, players } = roomState;
  const joinUrl = `${window.location.origin}/play/${roomCode}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-orange-900 p-8">
      {/* Header with Room Code */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-400 mb-2">
              تراثنا TURATHNA
            </div>
            <p className="text-gray-300">Cultural Exchange Trivia Game</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm mb-1">Room Code</p>
            <div className="flex items-center gap-2">
              <div className="text-5xl font-bold text-white font-mono tracking-wider bg-slate-800/50 px-6 py-3 rounded-lg border-2 border-teal-500/50">
                {roomCode}
              </div>
              <Button
                onClick={copyRoomCode}
                variant="outline"
                size="icon"
                className="h-14 w-14 bg-slate-800/50 border-teal-500/50 hover:bg-teal-500/20"
              >
                {copied ? (
                  <Check className="h-6 w-6 text-teal-400" />
                ) : (
                  <Copy className="h-6 w-6 text-teal-400" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Join Instructions */}
        <Card className="bg-slate-800/30 border-orange-500/30 p-4">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-orange-400" />
            <div className="flex-1">
              <p className="text-white font-semibold">Players can join at:</p>
              <p className="text-teal-400 font-mono text-lg">{joinUrl}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{players.length}</p>
              <p className="text-gray-400 text-sm">Players</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {room.status === "lobby" && (
          <div className="space-y-6">
            {/* Waiting for Players */}
            <Card className="bg-slate-800/50 border-teal-500/30 p-8">
              <div className="text-center space-y-4">
                <div className="text-6xl">🎮</div>
                <h2 className="text-3xl font-bold text-white">Waiting for Players...</h2>
                <p className="text-gray-400 text-lg">
                  Share the room code with your friends to get started!
                </p>
              </div>
            </Card>

            {/* Players List */}
            {players.length > 0 && (
              <Card className="bg-slate-800/50 border-orange-500/30 p-6">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-orange-400" />
                  Players in Lobby
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="bg-slate-700/50 p-4 rounded-lg text-center border border-teal-500/20"
                    >
                      <div className="text-3xl mb-2">👤</div>
                      <p className="text-white font-semibold">{player.playerName}</p>
                      {player.isReady === 1 && (
                        <p className="text-teal-400 text-sm mt-1">✓ Ready</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Start Game Button */}
            {players.length >= 2 && (
              <div className="text-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600 text-white font-bold text-xl px-12 py-6"
                >
                  Start Game
                </Button>
              </div>
            )}
          </div>
        )}

        {room.status === "playing" && (
          <Card className="bg-slate-800/50 border-teal-500/30 p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Game in Progress</h2>
            <p className="text-gray-400">Round {room.currentRound} of 5</p>
          </Card>
        )}
      </div>
    </div>
  );
}
