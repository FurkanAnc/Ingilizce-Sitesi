import { useState } from 'react';
import { motion } from 'motion/react';
import { Moon, Sun, Download, Upload, RotateCcw, Bell, Globe } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { toast } from 'sonner';

export function Settings() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState(true);
  const [dailyGoal, setDailyGoal] = useState(15);

  const handleExport = () => {
    toast.success('Data exported successfully!');
  };

  const handleImport = () => {
    toast.success('Data imported successfully!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
      toast.success('Progress reset successfully');
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-semibold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your preferences and data
          </p>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <h3 className="text-xl font-semibold mb-6">Appearance</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium mb-1">Theme</div>
                  <div className="text-sm text-muted-foreground">
                    Choose your preferred color theme
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTheme('light')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      theme === 'light'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTheme('dark')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      theme === 'dark'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Learning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <h3 className="text-xl font-semibold mb-6">Learning Preferences</h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium mb-1">Daily Goal</div>
                  <div className="text-sm text-muted-foreground">
                    Number of words to study each day
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(Number(e.target.value))}
                    className="w-32"
                  />
                  <div className="w-12 text-center font-semibold">{dailyGoal}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium mb-1">Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Receive study reminders
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    notifications ? 'bg-primary' : 'bg-accent'
                  }`}
                >
                  <motion.div
                    animate={{ x: notifications ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                  />
                </motion.button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <h3 className="text-xl font-semibold mb-6">Data Management</h3>

            <div className="space-y-3">
              <motion.button
                whileHover={{ x: 4 }}
                onClick={handleExport}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Download className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Export Data</div>
                    <div className="text-sm text-muted-foreground">
                      Download your vocabulary and progress
                    </div>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ x: 4 }}
                onClick={handleImport}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Upload className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Import Data</div>
                    <div className="text-sm text-muted-foreground">
                      Restore from a previous backup
                    </div>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ x: 4 }}
                onClick={handleReset}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors border border-destructive/20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-destructive/20 rounded-lg">
                    <RotateCcw className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-destructive">Reset Progress</div>
                    <div className="text-sm text-muted-foreground">
                      Clear all learning data (cannot be undone)
                    </div>
                  </div>
                </div>
              </motion.button>
            </div>
          </Card>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <h3 className="text-xl font-semibold mb-6">About</h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Version</span>
                <span className="font-medium text-foreground">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Total Words</span>
                <span className="font-medium text-foreground">1,247</span>
              </div>
              <div className="flex justify-between">
                <span>Study Days</span>
                <span className="font-medium text-foreground">42</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
