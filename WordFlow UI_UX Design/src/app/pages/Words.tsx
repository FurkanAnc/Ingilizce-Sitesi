import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Plus, Edit2, Trash2, BookmarkMinus, Check, X } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { mockWords, categories, type Word } from '../data/mockData';

export function Words() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showDifficult, setShowDifficult] = useState(false);
  const [editingWord, setEditingWord] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredWords = mockWords.filter(word => {
    const matchesSearch = word.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          word.translation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || word.category === filterCategory;
    const matchesLevel = filterLevel === 'all' || word.level === filterLevel;
    const matchesDifficult = !showDifficult || word.isDifficult;

    return matchesSearch && matchesCategory && matchesLevel && matchesDifficult;
  });

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-semibold mb-2">My Words</h1>
            <p className="text-muted-foreground">
              Manage your vocabulary library
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Add Word
          </Button>
        </motion.div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search words..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setShowDifficult(!showDifficult)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showDifficult
                  ? 'bg-orange-500 text-white'
                  : 'bg-accent text-foreground hover:bg-accent/80'
              }`}
            >
              <BookmarkMinus className="w-4 h-4 inline mr-2" />
              Difficult Words Only
            </button>
            <div className="text-sm text-muted-foreground">
              {filteredWords.length} word{filteredWords.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </Card>

        {/* Words Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-medium">English</th>
                  <th className="text-left py-4 px-4 font-medium">Translation</th>
                  <th className="text-left py-4 px-4 font-medium hidden lg:table-cell">Example</th>
                  <th className="text-left py-4 px-4 font-medium">Category</th>
                  <th className="text-left py-4 px-4 font-medium">Level</th>
                  <th className="text-left py-4 px-4 font-medium">Status</th>
                  <th className="text-left py-4 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredWords.map((word, index) => (
                    <motion.tr
                      key={word.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border hover:bg-accent/30 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium">{word.english}</td>
                      <td className="py-4 px-4">{word.translation}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground hidden lg:table-cell max-w-xs truncate">
                        {word.example}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs whitespace-nowrap">
                          {word.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                          word.level === 'advanced' ? 'bg-red-500/10 text-red-500' :
                          word.level === 'intermediate' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-green-500/10 text-green-500'
                        }`}>
                          {word.level}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          {word.learned && (
                            <span className="flex items-center gap-1 text-xs text-green-500">
                              <Check className="w-3 h-3" />
                              Learned
                            </span>
                          )}
                          {word.isDifficult && (
                            <span className="flex items-center gap-1 text-xs text-orange-500">
                              <BookmarkMinus className="w-3 h-3" />
                              Review
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredWords.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-muted-foreground mb-2">No words found</div>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </motion.div>
          )}
        </Card>

        {/* Add Word Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card border border-border rounded-xl p-6 max-w-2xl w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Add New Word</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">English Word</label>
                    <input
                      type="text"
                      placeholder="Enter English word"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Translation</label>
                    <input
                      type="text"
                      placeholder="Enter translation"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Example Sentence</label>
                    <textarea
                      placeholder="Enter example sentence"
                      rows={3}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Level</label>
                      <select className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={() => setShowAddModal(false)} className="flex-1">
                      Add Word
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
