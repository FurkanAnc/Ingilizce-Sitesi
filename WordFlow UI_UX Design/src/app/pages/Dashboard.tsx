import { motion } from 'motion/react';
import { BookOpen, Brain, TrendingUp, Target, Clock, Award, ArrowRight, Zap } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useNavigation } from '../context/NavigationContext';
import { mockWords, mockSessions } from '../data/mockData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export function Dashboard() {
  const { navigate } = useNavigation();

  const stats = {
    totalWords: mockWords.length,
    learnedWords: mockWords.filter(w => w.learned).length,
    accuracy: Math.round(mockSessions.slice(0, 7).reduce((acc, s) => acc + s.accuracy, 0) / 7),
    streak: 7,
  };

  const difficultWords = mockWords.filter(w => w.isDifficult).slice(0, 3);

  const chartData = mockSessions.slice().reverse().map(s => ({
    date: s.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    accuracy: s.accuracy,
    words: s.wordsStudied,
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Welcome back! 👋</h1>
              <p className="text-muted-foreground">
                Ready to continue your learning journey?
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => navigate('/flashcards')} size="lg">
                <Zap className="w-5 h-5" />
                Start Studying
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={itemVariants}>
            <Card hover className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total</span>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-semibold">{stats.totalWords}</div>
                  <div className="text-sm text-muted-foreground">Words in library</div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card hover className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -mr-16 -mt-16" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Target className="w-6 h-6 text-green-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Learned</span>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-semibold">{stats.learnedWords}</div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round((stats.learnedWords / stats.totalWords) * 100)}% complete
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card hover className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-16 -mt-16" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Accuracy</span>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-semibold">{stats.accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Last 7 days</div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card hover className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full -mr-16 -mt-16" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <Award className="w-6 h-6 text-orange-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Streak</span>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-semibold">{stats.streak}</div>
                  <div className="text-sm text-muted-foreground">Days in a row 🔥</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">Learning Progress</h3>
                <div className="text-sm text-muted-foreground">Last 7 days</div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth={2}
                    fill="url(#accuracyGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Card>
              <h3 className="font-semibold mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => navigate('/flashcards')}
                  className="w-full flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Study Flashcards</div>
                      <div className="text-sm text-muted-foreground">Review your words</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </motion.button>

                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => navigate('/quiz')}
                  className="w-full flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Take a Quiz</div>
                      <div className="text-sm text-muted-foreground">Test your knowledge</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </motion.button>

                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => navigate('/upload')}
                  className="w-full flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Add New Words</div>
                      <div className="text-sm text-muted-foreground">Upload a word list</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Difficult Words */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Words to Review</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/words')}>
                View all
              </Button>
            </div>
            <div className="space-y-3">
              {difficultWords.map((word, index) => (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                >
                  <div>
                    <div className="font-medium">{word.english}</div>
                    <div className="text-sm text-muted-foreground">{word.translation}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      {word.correctCount}/{word.correctCount + word.incorrectCount}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      word.isDifficult ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {word.isDifficult ? 'Review' : 'Learning'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
