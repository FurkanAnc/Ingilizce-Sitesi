import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Trophy, RotateCcw, Brain } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { mockWords } from '../data/mockData';
import { useNavigation } from '../context/NavigationContext';

interface Question {
  word: typeof mockWords[0];
  options: string[];
  correctAnswer: string;
}

export function Quiz() {
  const { navigate } = useNavigation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = () => {
    const quizQuestions: Question[] = mockWords.slice(0, 5).map(word => {
      const wrongAnswers = mockWords
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.translation);

      const options = [word.translation, ...wrongAnswers].sort(() => Math.random() - 0.5);

      return {
        word,
        options,
        correctAnswer: word.translation,
      };
    });

    setQuestions(quizQuestions);
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (answer === questions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizComplete(false);
    generateQuestions();
  };

  if (questions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse">Loading quiz...</div>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="h-full overflow-auto flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
                percentage >= 80 ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                percentage >= 60 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                'bg-gradient-to-br from-red-500 to-pink-500'
              }`}
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>

            <h2 className="text-3xl font-semibold mb-2">Quiz Complete!</h2>
            <p className="text-muted-foreground mb-8">
              {percentage >= 80 ? 'Excellent work!' :
               percentage >= 60 ? 'Good effort!' :
               'Keep practicing!'}
            </p>

            <div className="max-w-md mx-auto mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">Your Score</span>
                <span className="text-2xl font-semibold">{score}/{questions.length}</span>
              </div>
              <div className="h-4 bg-accent rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className={`h-full ${
                    percentage >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    percentage >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    'bg-gradient-to-r from-red-500 to-pink-500'
                  }`}
                />
              </div>
              <div className="text-right mt-2">
                <span className="text-3xl font-semibold">{percentage}%</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRestart} className="flex-1">
                <RotateCcw className="w-4 h-4" />
                Try Again
              </Button>
              <Button onClick={() => navigate('/')} className="flex-1">
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-semibold">Vocabulary Quiz</h1>
            <p className="text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-xl font-semibold">{score}/{currentQuestion + (isAnswered ? 1 : 0)}</div>
            </div>
            <Button variant="ghost" onClick={() => navigate('/')}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="h-2 bg-accent rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
              <div className="flex items-start gap-4 mb-8">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm text-muted-foreground mb-2">What is the translation of:</h3>
                  <h2 className="text-4xl font-semibold">{question.word.english}</h2>
                  <p className="text-muted-foreground mt-4 italic">"{question.word.example}"</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option, index) => {
            const isCorrect = option === question.correctAnswer;
            const isSelected = option === selectedAnswer;
            const showResult = isAnswered;

            let bgClass = 'bg-card hover:bg-accent';
            let borderClass = 'border-border';

            if (showResult) {
              if (isCorrect) {
                bgClass = 'bg-green-500/10';
                borderClass = 'border-green-500';
              } else if (isSelected && !isCorrect) {
                bgClass = 'bg-red-500/10';
                borderClass = 'border-red-500';
              }
            } else if (isSelected) {
              bgClass = 'bg-primary/10';
              borderClass = 'border-primary';
            }

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={!isAnswered ? { scale: 1.02 } : {}}
                whileTap={!isAnswered ? { scale: 0.98 } : {}}
                onClick={() => handleAnswer(option)}
                disabled={isAnswered}
                className={`p-6 rounded-xl border-2 text-left transition-all ${bgClass} ${borderClass} ${
                  isAnswered ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{option}</span>
                  {showResult && isCorrect && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      <Check className="w-6 h-6 text-green-500" />
                    </motion.div>
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      <X className="w-6 h-6 text-red-500" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Next Button */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Button onClick={handleNext} size="lg" className="w-full">
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'View Results'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
