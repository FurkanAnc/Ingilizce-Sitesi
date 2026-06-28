import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload as UploadIcon, FileSpreadsheet, Check, X, AlertCircle, ArrowRight } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useNavigation } from '../context/NavigationContext';

type UploadState = 'idle' | 'uploading' | 'mapping' | 'preview' | 'success' | 'error';

interface ColumnMapping {
  file: string;
  system: 'english' | 'translation' | 'example' | 'category' | 'skip';
}

export function Upload() {
  const { navigate } = useNavigation();
  const [state, setState] = useState<UploadState>('idle');
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [columns, setColumns] = useState<string[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setState('uploading');

    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          const mockColumns = ['Word', 'Translation', 'Example Sentence', 'Category'];
          setColumns(mockColumns);
          setMappings(mockColumns.map(col => ({
            file: col,
            system: col.toLowerCase().includes('word') ? 'english' :
                    col.toLowerCase().includes('translation') ? 'translation' :
                    col.toLowerCase().includes('example') ? 'example' :
                    col.toLowerCase().includes('category') ? 'category' : 'skip'
          })));
          setState('mapping');
        }, 500);
      }
    }, 100);
  };

  const handleMapping = (index: number, value: string) => {
    const newMappings = [...mappings];
    newMappings[index].system = value as any;
    setMappings(newMappings);
  };

  const handlePreview = () => {
    const mockPreview = [
      { english: 'Serendipity', translation: 'Şans eseri güzel bir şey bulma', example: 'Finding this was serendipity.', category: 'Advanced' },
      { english: 'Ephemeral', translation: 'Geçici, kısa ömürlü', example: 'The beauty is ephemeral.', category: 'Advanced' },
      { english: 'Resilient', translation: 'Dayanıklı', example: 'She is resilient.', category: 'General' },
    ];
    setPreviewData(mockPreview);
    setState('preview');
  };

  const handleImport = () => {
    setState('uploading');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setState('success');
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const reset = () => {
    setState('idle');
    setFileName('');
    setProgress(0);
    setColumns([]);
    setMappings([]);
    setPreviewData([]);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-semibold mb-2">Upload Word List</h1>
          <p className="text-muted-foreground">
            Import your vocabulary from Excel or CSV files
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 hover:bg-accent/20 transition-all cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
                  >
                    <UploadIcon className="w-10 h-10 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">Drop your file here</h3>
                  <p className="text-muted-foreground mb-4">
                    or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports .xlsx, .xls, .csv files
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </Card>
            </motion.div>
          )}

          {state === 'uploading' && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-6">
                    <FileSpreadsheet className="w-8 h-8 text-blue-500 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Processing {fileName}</h3>
                  <div className="max-w-md mx-auto mt-6">
                    <div className="h-2 bg-accent rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {state === 'mapping' && (
            <motion.div
              key="mapping"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <h3 className="text-xl font-semibold mb-6">Map Your Columns</h3>
                <p className="text-muted-foreground mb-6">
                  Match your file columns to WordFlow fields
                </p>
                <div className="space-y-4">
                  {columns.map((col, index) => (
                    <motion.div
                      key={col}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-accent/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{col}</div>
                        <div className="text-sm text-muted-foreground">From your file</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      <select
                        value={mappings[index]?.system || 'skip'}
                        onChange={(e) => handleMapping(index, e.target.value)}
                        className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="english">English Word</option>
                        <option value="translation">Translation</option>
                        <option value="example">Example</option>
                        <option value="category">Category</option>
                        <option value="skip">Skip</option>
                      </select>
                    </motion.div>
                  ))}
                </div>
                <div className="flex gap-3 mt-8">
                  <Button variant="outline" onClick={reset} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handlePreview} className="flex-1">
                    Preview Data
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {state === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <h3 className="text-xl font-semibold mb-6">Preview Import</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">English</th>
                        <th className="text-left py-3 px-4 font-medium">Translation</th>
                        <th className="text-left py-3 px-4 font-medium">Example</th>
                        <th className="text-left py-3 px-4 font-medium">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-b border-border hover:bg-accent/30"
                        >
                          <td className="py-3 px-4">{row.english}</td>
                          <td className="py-3 px-4">{row.translation}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{row.example}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-sm">
                              {row.category}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-3 mt-8">
                  <Button variant="outline" onClick={() => setState('mapping')} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleImport} className="flex-1">
                    Import {previewData.length} Words
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {state === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6"
                >
                  <Check className="w-10 h-10 text-green-500" />
                </motion.div>
                <h3 className="text-2xl font-semibold mb-2">Import Successful!</h3>
                <p className="text-muted-foreground mb-8">
                  {previewData.length} words have been added to your library
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={reset}>
                    Upload Another
                  </Button>
                  <Button onClick={() => navigate('/words')}>
                    View My Words
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
