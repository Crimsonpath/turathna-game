import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, X, Trophy, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type Question = {
  id: number;
  questionText: string;
  questionTextAr: string | null;
  options: string | null;
  optionsAr: string | null;
  correctAnswer: string;
  culturalPackId: number;
};

export default function SoloPlay() {
  const [, setLocation] = useLocation();
  const [selectedPack, setSelectedPack] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [language, setLanguage] = useState<"en" | "ar">("en");

  const { data: culturalPacks, isLoading: packsLoading } = trpc.game.getCulturalPacks.useQuery();

  const { refetch: fetchQuestions } = trpc.solo.getRandomQuestions.useQuery(
    { culturalPackId: selectedPack || 0, count: 10 },
    { enabled: false }
  );

  const startQuiz = async (packId: number) => {
    try {
      setSelectedPack(packId);
      const result = await fetchQuestions();
      const fetchedQuestions = result.data;
      
      if (!fetchedQuestions || fetchedQuestions.length === 0) {
        toast.error("No questions available for this cultural pack");
        return;
      }

      setQuestions(fetchedQuestions as Question[]);
      setSelectedPack(packId);
      setCurrentQuestionIndex(0);
      setScore(0);
      setGameFinished(false);
    } catch (error) {
      toast.error("Failed to load questions");
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !questions[currentQuestionIndex]) return;

    const isCorrect = selectedAnswer === questions[currentQuestionIndex].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 100);
      toast.success("Correct! +100 points");
    } else {
      toast.error(`Wrong! Correct answer was ${questions[currentQuestionIndex].correctAnswer}`);
    }

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameFinished(true);
    }
  };

  const resetQuiz = () => {
    setSelectedPack(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setGameFinished(false);
  };

  if (packsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-orange-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-teal-400" />
      </div>
    );
  }

  // Culture Pack Selection
  if (!selectedPack) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-orange-900 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation("/")}
              className="bg-slate-800/50 border-purple-500/50 hover:bg-purple-500/20"
            >
              <ArrowLeft className="h-5 w-5 text-purple-400" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Solo Practice</h1>
              <p className="text-gray-400">Choose a cultural pack to begin</p>
            </div>
          </div>

          {/* Cultural Packs Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {culturalPacks?.map((pack) => (
              <Card
                key={pack.id}
                className="bg-slate-800/50 border-purple-500/30 hover:border-purple-500/60 transition-all cursor-pointer"
                onClick={() => startQuiz(pack.id)}
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>{pack.name}</span>
                    <span className="text-2xl">{pack.nameAr}</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {pack.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                    Start Quiz
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Game Finished
  if (gameFinished) {
    const percentage = Math.round((score / (questions.length * 100)) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-orange-900 p-4 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-purple-500/30 max-w-md w-full">
          <CardContent className="pt-6 space-y-6 text-center">
            <div className="text-6xl">🏆</div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
              <p className="text-gray-400">Great job learning about cultures!</p>
            </div>
            
            <div className="bg-slate-700/50 p-6 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-white">
                <span>Final Score:</span>
                <span className="text-3xl font-bold text-purple-400">{score}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Questions:</span>
                <span>{questions.length}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Accuracy:</span>
                <span className="text-purple-400 font-semibold">{percentage}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={resetQuiz}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                Try Another Pack
              </Button>
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                className="w-full bg-slate-700/50 border-gray-600 hover:bg-slate-700"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz Interface
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  const options = JSON.parse(currentQuestion.options || "[]") as string[];
  const optionsAr = currentQuestion.optionsAr ? JSON.parse(currentQuestion.optionsAr) as string[] : [];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-orange-900 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={resetQuiz}
              className="bg-slate-800/50 border-purple-500/50 hover:bg-purple-500/20"
            >
              <ArrowLeft className="h-5 w-5 text-purple-400" />
            </Button>
            <div>
              <p className="text-gray-400 text-sm">Question {currentQuestionIndex + 1} of {questions.length}</p>
              <Progress value={progress} className="w-48 h-2 mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              className="bg-slate-800/50 border-purple-500/50"
            >
              {language === "en" ? "العربية" : "English"}
            </Button>
            <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-purple-500/30">
              <Trophy className="w-5 h-5 text-purple-400" />
              <span className="text-white font-bold">{score}</span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white text-2xl leading-relaxed">
              {language === "en" ? currentQuestion.questionText : (currentQuestion.questionTextAr || currentQuestion.questionText)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {options.map((option, index) => {
              const optionLetter = option.charAt(0);
              const isSelected = selectedAnswer === optionLetter;
              const isCorrect = optionLetter === currentQuestion.correctAnswer;
              const showCorrectness = showResult && (isSelected || isCorrect);

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(optionLetter)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    showCorrectness
                      ? isCorrect
                        ? "bg-green-500/20 border-green-500 text-white"
                        : isSelected
                        ? "bg-red-500/20 border-red-500 text-white"
                        : "bg-slate-700/50 border-gray-600 text-gray-400"
                      : isSelected
                      ? "bg-purple-500/20 border-purple-500 text-white"
                      : "bg-slate-700/50 border-gray-600 text-white hover:border-purple-500/50 hover:bg-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1">
                      {language === "en" ? option : (optionsAr[index] || option)}
                    </span>
                    {showResult && isCorrect && <Check className="w-5 h-5 text-green-500" />}
                    {showResult && isSelected && !isCorrect && <X className="w-5 h-5 text-red-500" />}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-center">
          {!showResult ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold px-12 py-6 text-lg"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600 text-white font-bold px-12 py-6 text-lg"
            >
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
