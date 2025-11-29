import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Loader2, Gamepad2, Trophy, Check, X, Zap, Languages, Users, Crown } from "lucide-react";
import { useParams, useSearch } from "wouter";
import { toast } from "sonner";
import { useState, useEffect } from "react";

type LifelineResult = {
  type: string;
  removedOptions?: string[];
  questionTextAr?: string | null;
  optionsAr?: string | null;
  hint?: string;
};

export default function PlayerController() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const search = useSearch();
  const playerId = Number(new URLSearchParams(search).get("playerId"));

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean; pointsEarned: number; correctAnswer: string } | null>(null);
  const [removedOptions, setRemovedOptions] = useState<string[]>([]);
  const [showArabic, setShowArabic] = useState(false);
  const [nativeHint, setNativeHint] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "ar">("en");

  const { data: roomState, isLoading } = trpc.game.getRoomState.useQuery(
    { roomCode: roomCode || "" },
    { enabled: !!roomCode, refetchInterval: 1000 }
  );

  const { data: currentQuestion, refetch: refetchQuestion } = trpc.game.getCurrentQuestion.useQuery(
    { roomCode: roomCode || "", playerId },
    { enabled: !!roomCode && roomState?.room.status === "playing", refetchInterval: 1000 }
  );

  const { data: gameResults } = trpc.game.getGameResults.useQuery(
    { roomCode: roomCode || "" },
    { enabled: !!roomCode && roomState?.room.status === "finished" }
  );

  const submitAnswerMutation = trpc.game.submitAnswer.useMutation({
    onSuccess: (data) => {
      setAnswerResult(data);
      if (data.isCorrect) {
        toast.success(`Correct! +${data.pointsEarned} points`);
      } else {
        toast.error(`Wrong! The correct answer was ${data.correctAnswer}`);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const useLifelineMutation = trpc.game.useLifeline.useMutation({
    onSuccess: (data: LifelineResult) => {
      if (data.type === "fifty_fifty" && data.removedOptions) {
        setRemovedOptions(data.removedOptions);
        toast.success("50/50: Two wrong answers removed!");
      } else if (data.type === "translate") {
        setShowArabic(true);
        toast.success("Translation activated!");
      } else if (data.type === "ask_native" && data.hint) {
        setNativeHint(data.hint);
        toast.success("The native has given you a hint!");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Reset state when question changes
  useEffect(() => {
    if (currentQuestion?.questionNumber) {
      setSelectedAnswer(null);
      setAnswerResult(null);
      setRemovedOptions([]);
      setShowArabic(false);
      setNativeHint(null);
    }
  }, [currentQuestion?.questionNumber]);

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !roomCode) return;
    submitAnswerMutation.mutate({
      roomCode,
      playerId,
      answer: selectedAnswer,
    });
  };

  const handleUseLifeline = (type: "fifty_fifty" | "ask_native" | "translate") => {
    if (!roomCode) return;
    useLifelineMutation.mutate({
      roomCode,
      playerId,
      lifelineType: type,
    });
  };

  const hasAnswered = answerResult !== null || currentQuestion?.answeredPlayerIds?.includes(playerId);

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
  const currentPlayer = players.find((p) => p.id === playerId);

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-orange-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 p-8 text-center">
          <p className="text-white text-xl">Player not found</p>
        </Card>
      </div>
    );
  }

  // Show results screen
  if (room.status === "finished" && gameResults) {
    const playerRank = gameResults.players.findIndex(p => p.id === playerId) + 1;
    const playerStats = gameResults.players.find(p => p.id === playerId);

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-orange-900 p-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Header */}
          <div className="text-center py-4">
            <div className="text-6xl mb-4">
              {playerRank === 1 ? "🥇" : playerRank === 2 ? "🥈" : playerRank === 3 ? "🥉" : "🎮"}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Game Over!</h1>
            <p className="text-gray-400">
              {playerRank === 1 ? "Congratulations, you won!" : `You finished #${playerRank}`}
            </p>
          </div>

          {/* Your Stats */}
          <Card className="bg-slate-800/50 border-orange-500/30">
            <CardContent className="pt-6 space-y-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Your Score</p>
                <p className="text-5xl font-bold text-orange-400">{playerStats?.score || 0}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-700/50 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-teal-400">
                    {playerStats?.correctAnswers || 0}/{playerStats?.totalAnswers || 0}
                  </p>
                  <p className="text-gray-400 text-sm">Correct</p>
                </div>
                <div className="bg-slate-700/50 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-teal-400">{playerStats?.accuracy || 0}%</p>
                  <p className="text-gray-400 text-sm">Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="bg-slate-800/50 border-teal-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Crown className="w-5 h-5 text-orange-400" />
                Final Standings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {gameResults.players.slice(0, 5).map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    player.id === playerId ? "bg-teal-500/20 border border-teal-500/50" : "bg-slate-700/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                    </span>
                    <span className="text-white font-semibold">{player.name}</span>
                  </div>
                  <span className="text-orange-400 font-bold">{player.score}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Play Again */}
          <Button
            onClick={() => window.location.href = "/"}
            className="w-full bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600 text-white font-bold py-6"
          >
            Play Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-orange-900 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <Card className="bg-slate-800/50 border-teal-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Room Code</p>
                <p className="text-2xl font-bold text-white font-mono">{roomCode}</p>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-400" />
                <span className="text-2xl font-bold text-orange-400">{currentPlayer.score}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Player Info */}
        <Card className="bg-slate-800/50 border-orange-500/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-4xl">👤</div>
                <div>
                  <p className="text-xl font-bold text-white">{currentPlayer.playerName}</p>
                  <p className="text-gray-400 text-sm">{players.length} players in game</p>
                </div>
              </div>
              <Gamepad2 className="w-8 h-8 text-teal-400" />
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

        {room.status === "playing" && currentQuestion && !currentQuestion.finished && (
          <div className="space-y-4">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                Question {currentQuestion.questionNumber}/{currentQuestion.totalQuestions}
              </span>
              {currentQuestion.roundType === "speed" && (
                <span className="text-yellow-400 flex items-center gap-1">
                  <Zap className="w-4 h-4" /> 1.5x
                </span>
              )}
              {currentQuestion.roundType === "final" && (
                <span className="text-purple-400 flex items-center gap-1">
                  <Trophy className="w-4 h-4" /> 2x
                </span>
              )}
            </div>
            <Progress
              value={(currentQuestion.questionNumber / currentQuestion.totalQuestions) * 100}
              className="h-2"
            />

            {/* Question */}
            <Card className="bg-slate-800/50 border-teal-500/30">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    currentQuestion.question?.difficulty === "easy"
                      ? "bg-green-500/20 text-green-400"
                      : currentQuestion.question?.difficulty === "medium"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {currentQuestion.question?.difficulty?.toUpperCase()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                    className="text-gray-400 hover:text-white"
                  >
                    {language === "en" ? "العربية" : "English"}
                  </Button>
                </div>
                <CardTitle className={`text-white text-lg leading-relaxed ${language === "ar" ? "text-right" : ""}`} dir={language === "ar" ? "rtl" : "ltr"}>
                  {language === "en"
                    ? currentQuestion.question?.questionText
                    : (currentQuestion.question?.questionTextAr || currentQuestion.question?.questionText)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentQuestion.question?.options &&
                  JSON.parse(currentQuestion.question.options).map((option: string, index: number) => {
                    const optionLetter = option.charAt(0);
                    const isRemoved = removedOptions.includes(optionLetter);
                    const isSelected = selectedAnswer === optionLetter;
                    const isCorrect = answerResult?.correctAnswer === optionLetter;
                    const isWrong = answerResult && isSelected && !answerResult.isCorrect;

                    if (isRemoved) return null;

                    const optionsAr = currentQuestion.question?.optionsAr
                      ? JSON.parse(currentQuestion.question.optionsAr)
                      : [];

                    return (
                      <button
                        key={index}
                        onClick={() => !hasAnswered && setSelectedAnswer(optionLetter)}
                        disabled={hasAnswered}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          answerResult
                            ? isCorrect
                              ? "bg-green-500/20 border-green-500"
                              : isWrong
                              ? "bg-red-500/20 border-red-500"
                              : "bg-slate-700/50 border-gray-600 opacity-50"
                            : isSelected
                            ? "bg-teal-500/20 border-teal-500"
                            : "bg-slate-700/50 border-gray-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-white ${language === "ar" ? "text-right w-full" : ""}`} dir={language === "ar" ? "rtl" : "ltr"}>
                            {language === "en" ? option : (optionsAr[index] || option)}
                          </span>
                          {answerResult && isCorrect && <Check className="w-5 h-5 text-green-500" />}
                          {answerResult && isWrong && <X className="w-5 h-5 text-red-500" />}
                        </div>
                      </button>
                    );
                  })}
              </CardContent>
            </Card>

            {/* Native Hint */}
            {nativeHint && (
              <Card className="bg-purple-500/20 border-purple-500/50 p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <p className="text-purple-300">{nativeHint}</p>
                </div>
              </Card>
            )}

            {/* Lifelines */}
            {!hasAnswered && (
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleUseLifeline("fifty_fifty")}
                  disabled={currentQuestion.usedLifelines?.includes("fifty_fifty") || useLifelineMutation.isPending}
                  className={`flex-col py-3 h-auto ${
                    currentQuestion.usedLifelines?.includes("fifty_fifty")
                      ? "opacity-50 cursor-not-allowed"
                      : "bg-slate-700/50 border-orange-500/50 hover:bg-orange-500/20"
                  }`}
                >
                  <span className="text-2xl">50:50</span>
                  <span className="text-xs text-gray-400">Remove 2</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUseLifeline("ask_native")}
                  disabled={currentQuestion.usedLifelines?.includes("ask_native") || useLifelineMutation.isPending}
                  className={`flex-col py-3 h-auto ${
                    currentQuestion.usedLifelines?.includes("ask_native")
                      ? "opacity-50 cursor-not-allowed"
                      : "bg-slate-700/50 border-purple-500/50 hover:bg-purple-500/20"
                  }`}
                >
                  <Users className="w-6 h-6 text-purple-400" />
                  <span className="text-xs text-gray-400">Ask Native</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUseLifeline("translate")}
                  disabled={currentQuestion.usedLifelines?.includes("translate") || useLifelineMutation.isPending}
                  className={`flex-col py-3 h-auto ${
                    currentQuestion.usedLifelines?.includes("translate")
                      ? "opacity-50 cursor-not-allowed"
                      : "bg-slate-700/50 border-teal-500/50 hover:bg-teal-500/20"
                  }`}
                >
                  <Languages className="w-6 h-6 text-teal-400" />
                  <span className="text-xs text-gray-400">Translate</span>
                </Button>
              </div>
            )}

            {/* Submit Button */}
            {!hasAnswered ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer || submitAnswerMutation.isPending}
                className="w-full bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600 text-white font-bold py-6 text-lg"
              >
                {submitAnswerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Answer"
                )}
              </Button>
            ) : (
              <Card className={`p-4 text-center ${
                answerResult?.isCorrect ? "bg-green-500/20 border-green-500" : "bg-red-500/20 border-red-500"
              }`}>
                <div className="flex items-center justify-center gap-2">
                  {answerResult?.isCorrect ? (
                    <>
                      <Check className="w-6 h-6 text-green-400" />
                      <span className="text-green-400 font-bold text-lg">
                        Correct! +{answerResult.pointsEarned} points
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="w-6 h-6 text-red-400" />
                      <span className="text-red-400 font-bold text-lg">
                        Wrong! Answer: {answerResult?.correctAnswer}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-gray-400 mt-2 text-sm">Waiting for next question...</p>
              </Card>
            )}
          </div>
        )}

        {room.status === "playing" && currentQuestion?.finished && (
          <Card className="bg-slate-800/50 border-teal-500/30 p-6">
            <div className="text-center space-y-4">
              <div className="text-5xl">🎉</div>
              <h3 className="text-xl font-bold text-white">All Questions Complete!</h3>
              <p className="text-gray-400">Waiting for final results...</p>
              <Loader2 className="w-8 h-8 animate-spin text-teal-400 mx-auto" />
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-slate-800/30 border-gray-700/30 p-4">
          <p className="text-gray-400 text-sm text-center">
            Keep this screen open during the game. Answer quickly for more points!
          </p>
        </Card>
      </div>
    </div>
  );
}
