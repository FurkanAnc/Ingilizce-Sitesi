export interface Word {
  id: string;
  english: string;
  translation: string;
  example: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  isDifficult: boolean;
  learned: boolean;
  lastReviewed?: Date;
  correctCount: number;
  incorrectCount: number;
}

export interface StudySession {
  id: string;
  date: Date;
  wordsStudied: number;
  accuracy: number;
  duration: number;
}

export const mockWords: Word[] = [
  {
    id: '1',
    english: 'Serendipity',
    translation: 'Şans eseri güzel bir şey bulma',
    example: 'Finding this book was pure serendipity.',
    category: 'Advanced Vocabulary',
    level: 'advanced',
    isDifficult: false,
    learned: true,
    correctCount: 5,
    incorrectCount: 1,
    lastReviewed: new Date('2026-05-10'),
  },
  {
    id: '2',
    english: 'Ephemeral',
    translation: 'Geçici, kısa ömürlü',
    example: 'The beauty of cherry blossoms is ephemeral.',
    category: 'Advanced Vocabulary',
    level: 'advanced',
    isDifficult: true,
    learned: false,
    correctCount: 2,
    incorrectCount: 3,
    lastReviewed: new Date('2026-05-09'),
  },
  {
    id: '3',
    english: 'Meticulous',
    translation: 'Titiz, dikkatli',
    example: 'She is meticulous about her work.',
    category: 'Professional English',
    level: 'intermediate',
    isDifficult: false,
    learned: true,
    correctCount: 8,
    incorrectCount: 0,
    lastReviewed: new Date('2026-05-11'),
  },
  {
    id: '4',
    english: 'Resilient',
    translation: 'Dayanıklı, çabuk toparlanabilen',
    example: 'Children are naturally resilient.',
    category: 'General Vocabulary',
    level: 'intermediate',
    isDifficult: false,
    learned: true,
    correctCount: 6,
    incorrectCount: 1,
    lastReviewed: new Date('2026-05-08'),
  },
  {
    id: '5',
    english: 'Ambiguous',
    translation: 'Belirsiz, müphem',
    example: 'His answer was deliberately ambiguous.',
    category: 'Academic English',
    level: 'advanced',
    isDifficult: true,
    learned: false,
    correctCount: 1,
    incorrectCount: 4,
  },
];

export const mockSessions: StudySession[] = [
  { id: '1', date: new Date('2026-05-11'), wordsStudied: 15, accuracy: 87, duration: 22 },
  { id: '2', date: new Date('2026-05-10'), wordsStudied: 20, accuracy: 92, duration: 28 },
  { id: '3', date: new Date('2026-05-09'), wordsStudied: 12, accuracy: 75, duration: 18 },
  { id: '4', date: new Date('2026-05-08'), wordsStudied: 18, accuracy: 88, duration: 25 },
  { id: '5', date: new Date('2026-05-07'), wordsStudied: 10, accuracy: 90, duration: 15 },
  { id: '6', date: new Date('2026-05-06'), wordsStudied: 22, accuracy: 85, duration: 30 },
  { id: '7', date: new Date('2026-05-05'), wordsStudied: 16, accuracy: 94, duration: 20 },
];

export const categories = [
  'Advanced Vocabulary',
  'Professional English',
  'General Vocabulary',
  'Academic English',
  'Business English',
  'Idioms & Expressions',
];
