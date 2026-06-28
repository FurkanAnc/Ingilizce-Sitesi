import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, Check, X, Lightbulb, RotateCcw, Award } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { mockWords } from '../data/mockData';
import { useNavigation } from '../context/NavigationContext';

export function Writing() {
  const { navigate } = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, hints: 0 });

  const currentWord = mockWords[currentIndex];
  const progress = ((currentIndex + 1) / mockWords.length) * 100;

  const checkAnswer = () => {
    const isCorrect = userInput.trim().toLowerCase() === currentWord.english.toLowerCase();

    setIsChecked(true);
    setStats(prev => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }));
  };

  const handleNext = () => {
    if (currentIndex < mockWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setIsChecked(false);
      setShowHint(false);
    } else {
      setSessionComplete(true);
    }
  };

  const handleHint = () => {
    setShowHint(true);
    setStats(prev => ({ ...prev, hints: prev.hints + 1 }));
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserInput('');
    setIsChecked(false);
    setShowHint(false);
    setSessionComplete(false);
    setStats({ correct: 0, incorrect: 0, hints: 0 });
  };

  const isCorrect = userInput.trim().toLowerCase() === currentWord.english.toLowerCase();
  const hint = currentWord.english.substring(0, Math.ceil(currentWord.english.length / 2)) + '...';

  if (sessionComplete) {
    const accuracy = Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100);

    return (
      <div className="h-full overflow-auto flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="text-center">
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-6"
            >
              <Award className="w-12 h-12 text-white" />
            </motion.div>

            <h2 className="text-3xl font-semibold mb-4">Writing Practice Complete!</h2>
            <p className="text-muted-foreground mb-8">You've completed all writing exercises</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-6 rounded-lg bg-green-500/10">
                <div className="text-3xl font-semibold text-green-500">{stats.correct}</div>
                <div className="text-sm text-muted-foreground mt-1">Correct</div>
              </div>
              <div className="p-6 rounded-lg bg-red-500/10">
                <div className="text-3xl font-semibold text-red-500">{stats.incorrect}</div>
                <div className="text-sm text-muted-foreground mt-1">Incorrect</div>
              </div>
              <div className="p-6 rounded-lg bg-yellow-500/10">
                <div className="text-3xl font-semibold text-yellow-500">{stats.hints}</div>
                <div className="text-sm text-muted-foreground mt-1">Hints Used</div>
              </div>
            </div>

            <div className="max-w-md mx-auto mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="text-2xl font-semibold">{accuracy}%</span>
              </div>
              <div className="h-3 bg-accent rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${accuracy}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRestart} className="flex-1">
                <RotateCcw className="w-4 h-4" />
                Practice Again
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
            <h1 className="text-2xl font-semibold">Writing Practice</h1>
            <p className="text-muted-foreground">
              Word {currentIndex + 1} of {mockWords.length}
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>
            <X className="w-5 h-5" />
          </Button>
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
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <PenTool className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm text-muted-foreground mb-2">Write the English word for:</h3>
                  <h2 className="text-4xl font-semibold mb-4">{currentWord.translation}</h2>
                  <p className="text-muted-foreground italic">"{currentWord.example}"</p>
                </div>
              </div>

              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-3"
                  >
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <div>
                      <div className="text-sm font-medium text-yellow-700 dark:text-yellow-500">Hint</div>
                      <div className="text-sm">{hint}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Input Section */}
        <Card>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-muted-foreground mb-2 block">Your Answer</span>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userInput.trim() && !isChecked) {
                    checkAnswer();
                  }
                }}
                disabled={isChecked}
                placeholder="Type the English word..."
                className={`w-full px-4 py-3 rounded-lg border-2 bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                  isChecked
                    ? isCorrect
                      ? 'border-green-500 bg-green-500/5'
                      : 'border-red-500 bg-red-500/5'
                    : 'border-border'
                }`}
              />
            </label>

            <AnimatePresence>
              {isChecked && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-lg flex items-center gap-3 ${
                    isCorrect
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}
                >
                  {isCorrect ? (
                    <>
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-green-700 dark:text-green-500">Correct!</div>
                        <div className="text-sm text-muted-foreground">Great job! You got it right.</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-red-500 rounded-lg">
                        <X className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-red-700 dark:text-red-500">Incorrect</div>
                        <div className="text-sm text-muted-foreground">
                          The correct answer is: <span className="font-semibold">{currentWord.english}</span>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              {!isChecked ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleHint}
                    disabled={showHint}
                    className="flex-1"
                  >
                    <Lightbulb className="w-4 h-4" />
                    {showHint ? 'Hint Shown' : 'Show Hint'}
                  </Button>
                  <Button
                    onClick={checkAnswer}
                    disabled={!userInput.trim()}
                    className="flex-1"
                  >
                    Check Answer
                  </Button>
                </>
              ) : (
                <Button onClick={handleNext} className="w-full">
                  {currentIndex < mockWords.length - 1 ? 'Next Word' : 'Complete Session'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
