import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Users, Gamepad2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Home() {
  const [, setLocation] = useLocation();
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  
  const createRoomMutation = trpc.game.createRoom.useMutation({
    onSuccess: (data) => {
      toast.success(`Room created! Code: ${data.roomCode}`);
      setLocation(`/host/${data.roomCode}`);
    },
    onError: (error) => {
      toast.error(`Failed to create room: ${error.message}`);
    },
  });

  const joinRoomMutation = trpc.game.joinRoom.useMutation({
    onSuccess: (data, variables) => {
      toast.success("Joined room successfully!");
      setLocation(`/play/${variables.roomCode}?playerId=${data.playerId}`);
    },
    onError: (error) => {
      toast.error(`Failed to join room: ${error.message}`);
    },
  });

  const handleCreateRoom = () => {
    createRoomMutation.mutate();
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    joinRoomMutation.mutate({ roomCode: roomCode.toUpperCase(), playerName });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-orange-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-400">
              تراثنا
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white">TURATHNA</h1>
          <p className="text-xl text-gray-300">The Cultural Exchange Trivia Game</p>
          <p className="text-sm text-gray-400">Learn about cultures while having fun!</p>
        </div>

        {/* Main Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Room Card */}
          <Card className="bg-slate-800/50 border-teal-500/30 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-6 h-6 text-teal-400" />
                Host a Game
              </CardTitle>
              <CardDescription className="text-gray-400">
                Create a new room and invite players to join
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateRoom}
                disabled={createRoomMutation.isPending}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-6 text-lg"
              >
                {createRoomMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-5 w-5" />
                    Create Room
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Join Room Card */}
          <Card className="bg-slate-800/50 border-orange-500/30 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Gamepad2 className="w-6 h-6 text-orange-400" />
                Join a Game
              </CardTitle>
              <CardDescription className="text-gray-400">
                Enter a room code to join an existing game
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="playerName" className="text-gray-300">Your Name</Label>
                <Input
                  id="playerName"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-slate-700/50 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomCode" className="text-gray-300">Room Code</Label>
                <Input
                  id="roomCode"
                  placeholder="Enter 6-digit code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="bg-slate-700/50 border-gray-600 text-white placeholder:text-gray-500 uppercase text-center text-2xl tracking-widest font-mono"
                />
              </div>
              <Button
                onClick={handleJoinRoom}
                disabled={joinRoomMutation.isPending}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-6 text-lg"
              >
                {joinRoomMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Gamepad2 className="mr-2 h-5 w-5" />
                    Join Room
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="bg-slate-800/30 backdrop-blur p-4 rounded-lg border border-teal-500/20">
            <div className="text-3xl mb-2">🌍</div>
            <h3 className="font-semibold text-white mb-1">Cultural Exchange</h3>
            <p className="text-sm text-gray-400">Learn about different cultures</p>
          </div>
          <div className="bg-slate-800/30 backdrop-blur p-4 rounded-lg border border-orange-500/20">
            <div className="text-3xl mb-2">🎮</div>
            <h3 className="font-semibold text-white mb-1">Party Game</h3>
            <p className="text-sm text-gray-400">Play with friends and family</p>
          </div>
          <div className="bg-slate-800/30 backdrop-blur p-4 rounded-lg border border-teal-500/20">
            <div className="text-3xl mb-2">🌐</div>
            <h3 className="font-semibold text-white mb-1">Bilingual</h3>
            <p className="text-sm text-gray-400">Arabic & English support</p>
          </div>
        </div>
      </div>
    </div>
  );
}
