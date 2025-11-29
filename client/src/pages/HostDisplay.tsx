import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Loader2, Users, Copy, Check, Trophy, Clock, Zap, Crown } from "lucide-react";
import { useParams } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function HostDisplay() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [copied, setCopied] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  const { data: roomState, isLoading, refetch } = trpc.game.getRoomState.useQuery(
    { roomCode: roomCode || "" },
    { enabled: !!roomCode, refetchInterval: 1000 }
  );

  const { data: culturalPacks } = trpc.game.getCulturalPacks.useQuery();

  const { data: currentQuestion, refetch: refetchQuestion } = trpc.game.getCurrentQuestion.useQuery(
    { roomCode: roomCode || "" },
    { enabled: !!roomCode && roomState?.room.status === "playing", refetchInterval: 1000 }
  );

  const { data: gameResults } = trpc.game.getGameResults.useQuery(
    { roomCode: roomCode || "" },
    { enabled: !!roomCode && (roomState?.room.status === "finished" || showResults) }
  );

  const startGameMutation = trpc.game.startGame.useMutation({
    onSuccess: () => {
      toast.success("Game started!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to start game: ${error.message}`);
    },
  });

  const nextQuestionMutation = trpc.game.nextQuestion.useMutation({
    onSuccess: (data) => {
      if (data.finished) {
        toast.success("Game finished!");
        setShowResults(true);
      } else {
        toast.success(`Question ${data.questionNumber}`);
      }
      refetch();
      refetchQuestion();
    },
    onError: (error) => {
      toast.error(`Failed to advance: ${error.message}`);
    },
  });

  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      toast.success("Room code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartGame = () => {
    if (!selectedPackId) {
      toast.error("Please select a cultural pack");
      return;
    }
    startGameMutation.mutate({ roomCode: roomCode || "", culturalPackId: selectedPackId });
  };

  const handleNextQuestion = () => {
    nextQuestionMutation.mutate({ roomCode: roomCode || "" });
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

  const { room, players } = roomState;
  const joinUrl = `${window.location.origin}/play/${roomCode}`;

  // Show results screen
  if ((room.status === "finished" || showResults) && gameResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-orange-900 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-4xl font-bold text-white mb-2">Game Complete!</h1>
            <p className="text-gray-400">Final Results</p>
          </div>

          {/* Leaderboard */}
          <Card className="bg-slate-800/50 border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-6 h-6 text-orange-400" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {gameResults.players.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    index === 0
                      ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50"
                      : index === 1
                      ? "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/50"
                      : index === 2
                      ? "bg-gradient-to-r from-amber-700/20 to-amber-800/20 border border-amber-700/50"
                      : "bg-slate-700/50"
                  }`}
                >
                  <div className="text-3xl font-bold text-white w-12 text-center">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-bold text-white">{player.name}</p>
                    <p className="text-gray-400 text-sm">
                      {player.correctAnswers}/{player.totalAnswers} correct ({player.accuracy}%)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-orange-400">{player.score}</p>
                    <p className="text-gray-400 text-sm">points</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Play Again Button */}
          <div className="text-center">
            <Button
              onClick={() => window.location.href = "/"}
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600 text-white font-bold text-xl px-12 py-6"
            >
              Play Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-orange-900 p-8">
      {/* Header with Room Code */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-400 mb-2">
              TURATHNA
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
                        <p className="text-teal-400 text-sm mt-1">Ready</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Cultural Pack Selection */}
            {players.length >= 1 && (
              <Card className="bg-slate-800/50 border-teal-500/30 p-6">
                <h3 className="text-2xl font-bold text-white mb-4">Select Cultural Pack</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {culturalPacks?.map((pack) => (
                    <button
                      key={pack.id}
                      onClick={() => setSelectedPackId(pack.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedPackId === pack.id
                          ? "bg-teal-500/20 border-teal-500"
                          : "bg-slate-700/50 border-gray-600 hover:border-teal-500/50"
                      }`}
                    >
                      <p className="text-xl font-bold text-white">{pack.name}</p>
                      <p className="text-orange-400">{pack.nameAr}</p>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Start Game Button */}
            {players.length >= 1 && selectedPackId && (
              <div className="text-center">
                <Button
                  onClick={handleStartGame}
                  disabled={startGameMutation.isPending}
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600 text-white font-bold text-xl px-12 py-6"
                >
                  {startGameMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    "Start Game"
                  )}
                </Button>
              </div>
            )}

            {/* Waiting Message */}
            {players.length === 0 && (
              <Card className="bg-slate-800/50 border-teal-500/30 p-8">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🎮</div>
                  <h2 className="text-3xl font-bold text-white">Waiting for Players...</h2>
                  <p className="text-gray-400 text-lg">
                    Share the room code with your friends to get started!
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {room.status === "playing" && currentQuestion && !currentQuestion.finished && (
          <div className="space-y-6">
            {/* Progress and Round Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-teal-500/30">
                  <p className="text-gray-400 text-sm">Round</p>
                  <p className="text-2xl font-bold text-white">{room.currentRound}/5</p>
                </div>
                <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-orange-500/30">
                  <p className="text-gray-400 text-sm">Question</p>
                  <p className="text-2xl font-bold text-white">
                    {currentQuestion.questionNumber}/{currentQuestion.totalQuestions}
                  </p>
                </div>
                {currentQuestion.roundType === "speed" && (
                  <div className="bg-yellow-500/20 px-4 py-2 rounded-lg border border-yellow-500/50 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">Speed Round (1.5x)</span>
                  </div>
                )}
                {currentQuestion.roundType === "final" && (
                  <div className="bg-purple-500/20 px-4 py-2 rounded-lg border border-purple-500/50 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-400 font-bold">Final Round (2x)</span>
                  </div>
                )}
              </div>
              <Progress
                value={(currentQuestion.questionNumber / currentQuestion.totalQuestions) * 100}
                className="w-48 h-3"
              />
            </div>

            {/* Current Question Display */}
            <Card className="bg-slate-800/50 border-teal-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    currentQuestion.question?.difficulty === "easy"
                      ? "bg-green-500/20 text-green-400"
                      : currentQuestion.question?.difficulty === "medium"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {currentQuestion.question?.difficulty?.toUpperCase()}
                  </span>
                </div>
                <CardTitle className="text-white text-3xl leading-relaxed mt-4">
                  {currentQuestion.question?.questionText}
                </CardTitle>
                {currentQuestion.question?.questionTextAr && (
                  <p className="text-gray-400 text-xl mt-2 text-right" dir="rtl">
                    {currentQuestion.question.questionTextAr}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.question?.options &&
                    JSON.parse(currentQuestion.question.options).map((option: string, index: number) => {
                      const optionsAr = currentQuestion.question?.optionsAr
                        ? JSON.parse(currentQuestion.question.optionsAr)
                        : [];
                      return (
                        <div
                          key={index}
                          className="bg-slate-700/50 p-6 rounded-lg border border-gray-600"
                        >
                          <p className="text-white text-xl">{option}</p>
                          {optionsAr[index] && (
                            <p className="text-gray-400 mt-1 text-right" dir="rtl">
                              {optionsAr[index]}
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Players Who Answered */}
            <Card className="bg-slate-800/50 border-orange-500/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <span className="text-white font-semibold">
                    {currentQuestion.answeredPlayerIds?.length || 0}/{players.length} players answered
                  </span>
                </div>
                <div className="flex gap-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentQuestion.answeredPlayerIds?.includes(player.id)
                          ? "bg-teal-500 text-white"
                          : "bg-slate-600 text-gray-400"
                      }`}
                      title={player.playerName}
                    >
                      {player.playerName.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Next Question Button */}
            <div className="text-center">
              <Button
                onClick={handleNextQuestion}
                disabled={nextQuestionMutation.isPending}
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600 text-white font-bold text-xl px-12 py-6"
              >
                {nextQuestionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Loading...
                  </>
                ) : currentQuestion.questionNumber < currentQuestion.totalQuestions ? (
                  "Next Question"
                ) : (
                  "Finish Game"
                )}
              </Button>
            </div>

            {/* Live Scoreboard */}
            <Card className="bg-slate-800/50 border-orange-500/30 p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-400" />
                Live Scores
              </h4>
              <div className="flex gap-4 overflow-x-auto">
                {[...players].sort((a, b) => b.score - a.score).map((player, index) => (
                  <div
                    key={player.id}
                    className="flex-shrink-0 bg-slate-700/50 p-3 rounded-lg text-center min-w-[100px]"
                  >
                    <p className="text-2xl mb-1">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "👤"}
                    </p>
                    <p className="text-white font-semibold text-sm">{player.playerName}</p>
                    <p className="text-orange-400 font-bold">{player.score}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {room.status === "playing" && currentQuestion?.finished && (
          <Card className="bg-slate-800/50 border-teal-500/30 p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-4">All Questions Complete!</h2>
            <Button
              onClick={() => setShowResults(true)}
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600 text-white font-bold text-xl px-12 py-6"
            >
              View Results
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
