import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Check, X, BookmarkMinus, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { mockWords } from '../data/mockData';
import { useNavigation } from '../context/NavigationContext';

export function Flashcards() {
  const { navigate } = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [stats, setStats] = useState({ correct: 0, difficult: 0, skipped: 0 });

  const currentWord = mockWords[currentIndex];
  const progress = ((currentIndex + 1) / mockWords.length) * 100;

  const handleAction = (action: 'correct' | 'difficult' | 'skip') => {
    setStats(prev => ({
      ...prev,
      [action]: prev[action] + 1,
    }));

    if (currentIndex < mockWords.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    } else {
      setSessionComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
    setStats({ correct: 0, difficult: 0, skipped: 0 });
  };

  if (sessionComplete) {
    return (
      <div className="h-full overflow-auto flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-6"
            >
              <Check className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-3xl font-semibold mb-4">Session Complete! 🎉</h2>
            <p className="text-muted-foreground mb-8">Great work on your study session</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-6 rounded-lg bg-green-500/10">
                <div className="text-3xl font-semibold text-green-500">{stats.correct}</div>
                <div className="text-sm text-muted-foreground mt-1">Mastered</div>
              </div>
              <div className="p-6 rounded-lg bg-orange-500/10">
                <div className="text-3xl font-semibold text-orange-500">{stats.difficult}</div>
                <div className="text-sm text-muted-foreground mt-1">Need Review</div>
              </div>
              <div className="p-6 rounded-lg bg-blue-500/10">
                <div className="text-3xl font-semibold text-blue-500">{stats.skipped}</div>
                <div className="text-sm text-muted-foreground mt-1">Skipped</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRestart} className="flex-1">
                <RotateCcw className="w-4 h-4" />
                Study Again
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
            <h1 className="text-2xl font-semibold">Flashcard Study</h1>
            <p className="text-muted-foreground">
              Card {currentIndex + 1} of {mockWords.length}
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>
            <X className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Progress Bar */}
        <div className="h-2 bg-accent rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>

        {/* Flashcard */}
        <div className="relative" style={{ perspective: '1000px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                style={{ transformStyle: 'preserve-3d' }}
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer"
              >
                <div
                  className="relative"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <Card className="min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                    <div className="text-sm text-muted-foreground mb-4 uppercase tracking-wider">
                      English Word
                    </div>
                    <h2 className="text-5xl font-semibold mb-6">{currentWord.english}</h2>
                    <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
                      {currentWord.category}
                    </div>
                    <p className="text-muted-foreground mt-8 text-sm">
                      Click to reveal translation
                    </p>
                  </Card>
                </div>

                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <Card className="min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                    <div className="text-sm text-muted-foreground mb-4 uppercase tracking-wider">
                      Translation
                    </div>
                    <h2 className="text-4xl font-semibold mb-8">{currentWord.translation}</h2>
                    <div className="space-y-4 text-left max-w-md">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Example:</div>
                        <p className="italic">{currentWord.example}</p>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Level:</div>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                          currentWord.level === 'advanced' ? 'bg-red-500/10 text-red-500' :
                          currentWord.level === 'intermediate' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-green-500/10 text-green-500'
                        }`}>
                          {currentWord.level}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleAction('skip')}
            className="flex-col h-auto py-6 hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-500"
          >
            <ArrowRight className="w-6 h-6 mb-2" />
            <span>Skip</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => handleAction('difficult')}
            className="flex-col h-auto py-6 hover:bg-orange-500/10 hover:border-orange-500 hover:text-orange-500"
          >
            <BookmarkMinus className="w-6 h-6 mb-2" />
            <span>Review Later</span>
          </Button>

          <Button
            size="lg"
            onClick={() => handleAction('correct')}
            className="flex-col h-auto py-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
          >
            <Check className="w-6 h-6 mb-2" />
            <span>I Know This</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
