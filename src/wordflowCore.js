export const STORAGE_KEY = "wordflow:functional:v3";
export const LEGACY_KEYS = ["wordflow:functional:v2", "wordflow:functional:v1", "wordflow:v2", "wordflow:v1"];
export const LEVELS = ["A1", "A2", "B1", "B2", "C1"];
export const LANGUAGES = ["tr", "en"];
export const PRACTICE_MODE_LABELS = {
  reviews: "Reviews",
  flashcards: "Flashcards",
  listening: "Listening",
  quiz: "Quiz",
  writing: "Writing",
  "weak-drill": "Weak Drill",
};
const PRACTICE_MODE_LABELS_BY_LANGUAGE = {
  en: PRACTICE_MODE_LABELS,
  tr: {
    reviews: "Tekrarlar",
    flashcards: "Kartlar",
    listening: "Dinleme",
    quiz: "Quiz",
    writing: "Yazma",
    "weak-drill": "Zayif Kelimeler",
  },
};
const STATUS_LABELS_BY_LANGUAGE = {
  en: {
    new: "New",
    learning: "Learning",
    known: "Learned",
    difficult: "Review",
    repeat: "Repeat",
  },
  tr: {
    new: "Yeni",
    learning: "Ogreniliyor",
    known: "Ogrenildi",
    difficult: "Tekrar",
    repeat: "Tekrar",
  },
};
const LEVEL_LABELS_BY_LANGUAGE = {
  en: {
    A1: "beginner",
    A2: "beginner",
    B1: "intermediate",
    B2: "intermediate",
    C1: "advanced",
  },
  tr: {
    A1: "baslangic",
    A2: "baslangic",
    B1: "orta",
    B2: "orta",
    C1: "ileri",
  },
};

const FIELD_ALIASES = {
  english: ["english", "word", "term", "ingilizce", "kelime"],
  turkish: ["turkish", "translation", "meaning", "turkce", "anlam"],
  example: ["example", "example sentence", "sentence", "ornek"],
  category: ["category", "kategori", "group"],
  level: ["level", "seviye"],
  alternatives: ["alternatives", "alternative answers", "accepted answers", "answers", "aliases", "alternatif"],
};

export async function loadXlsx() {
  return import("xlsx");
}

export function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function clean(value) {
  return String(value ?? "").trim();
}

export function normalizeLanguage(value) {
  return clean(value).toLowerCase() === "en" ? "en" : "tr";
}

export function textKey(value) {
  return clean(value).toLocaleLowerCase("tr-TR");
}

export function answerKey(value) {
  return clean(value)
    .replace(/[\u0131\u0130]/g, (letter) => (letter === "\u0131" ? "i" : "I"))
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['`.,!?;:()[\]{}-]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

export function splitAlternatives(value) {
  if (Array.isArray(value)) return value.map(clean).filter(Boolean);
  return clean(value)
    .split(/[,\n;|/]+/)
    .map(clean)
    .filter(Boolean);
}

export function uniqueValues(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = answerKey(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function acceptedAnswers(word) {
  return uniqueValues([word.english, ...(word.alternatives || [])]);
}

export function answerMatches(input, word) {
  const key = answerKey(input);
  return Boolean(key) && acceptedAnswers(word).some((answer) => answerKey(answer) === key);
}

export function pickEnglishSpeechVoice(voices = []) {
  const list = Array.from(voices || []);
  const voiceRows = list.map((voice) => ({
    voice,
    lang: clean(voice?.lang).toLowerCase(),
    name: clean(voice?.name).toLowerCase(),
  }));
  const englishVoices = voiceRows.filter((item) => item.lang.startsWith("en"));
  return (
    englishVoices.find((item) => item.lang === "en-us")?.voice ||
    englishVoices.find((item) => item.lang === "en_us")?.voice ||
    englishVoices.find((item) => item.name.includes("english") && (item.name.includes("united states") || item.name.includes(" us ")))?.voice ||
    englishVoices.find((item) => item.lang === "en-gb")?.voice ||
    englishVoices[0]?.voice ||
    null
  );
}

export function uid() {
  const randomId = globalThis.crypto?.randomUUID?.();
  return randomId || `${Date.now()}-${Math.random()}`;
}

export function defaultState() {
  return {
    words: [],
    mistakes: [],
    daily: {},
    settings: {
      darkMode: false,
      language: "tr",
      dailyGoal: 15,
      weeklyGoal: 100,
      notifications: true,
    },
  };
}

export function normalizeStatus(status, word = {}) {
  const raw = answerKey(status);
  if (raw.includes("known") || raw.includes("learned") || raw.includes("ogren")) return "known";
  if (raw.includes("difficult") || raw.includes("hard") || raw.includes("zor")) return "difficult";
  if (raw.includes("repeat") || raw.includes("again")) return "repeat";
  if (raw.includes("learning") || raw.includes("reniliyor")) return "learning";
  if (word.learned) return "known";
  if (word.isDifficult) return "difficult";
  return "new";
}

export function normalizeLevel(level) {
  const next = clean(level).toUpperCase();
  return LEVELS.includes(next) ? next : "A1";
}

export function normalizeModeMistakes(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([mode, count]) => [clean(mode), Math.max(0, Number(count) || 0)])
      .filter(([mode, count]) => mode && count > 0),
  );
}

export function normalizeWord(word) {
  return {
    id: clean(word.id) || uid(),
    english: clean(word.english ?? word.word),
    turkish: clean(word.turkish ?? word.translation ?? word.meaning),
    example: clean(word.example ?? word.sentence),
    category: clean(word.category),
    level: normalizeLevel(word.level),
    alternatives: uniqueValues(splitAlternatives(word.alternatives ?? word.alternativeAnswers ?? word.answers ?? word.aliases)),
    status: normalizeStatus(word.status, word),
    correct: Number(word.correct ?? word.correctCount ?? 0),
    wrong: Number(word.wrong ?? word.incorrectCount ?? 0),
    repeated: Number(word.repeated ?? 0),
    reviewInterval: Number(word.reviewInterval ?? 0),
    nextReview: clean(word.nextReview) || todayKey(),
    lastAnswered: clean(word.lastAnswered),
    createdAt: clean(word.createdAt) || new Date().toISOString(),
    modeMistakes: normalizeModeMistakes(word.modeMistakes ?? word.mistakeModes ?? word.wrongByMode),
  };
}

export function normalizeState(raw) {
  const base = defaultState();
  const words = Array.isArray(raw?.words) ? raw.words.map(normalizeWord).filter((word) => word.english && word.turkish) : [];
  const rawSettings = raw?.settings && typeof raw.settings === "object" ? { ...raw.settings } : {};
  delete rawSettings.speechVoiceURI;
  return {
    ...base,
    ...raw,
    words,
    mistakes: Array.isArray(raw?.mistakes) ? [...new Set(raw.mistakes)] : [],
    daily: raw?.daily && typeof raw.daily === "object" ? raw.daily : {},
    settings: {
      ...base.settings,
      ...rawSettings,
      darkMode: raw?.settings?.darkMode ?? raw?.darkMode ?? raw?.dark ?? false,
      language: normalizeLanguage(raw?.settings?.language ?? raw?.language),
      dailyGoal: Number(raw?.settings?.dailyGoal ?? raw?.dailyGoal ?? 15),
      weeklyGoal: Number(raw?.settings?.weeklyGoal ?? raw?.weeklyGoal ?? 100),
      notifications: raw?.settings?.notifications ?? raw?.notifications ?? true,
    },
  };
}

export function serializeBackup(state) {
  return JSON.stringify(normalizeState(state), null, 2);
}

export function restoreBackup(text) {
  return normalizeState(JSON.parse(text));
}

export function createWord(row) {
  return normalizeWord({
    ...row,
    id: uid(),
    status: "new",
    correct: 0,
    wrong: 0,
    repeated: 0,
    reviewInterval: 0,
    nextReview: todayKey(),
    lastAnswered: "",
    modeMistakes: {},
    createdAt: new Date().toISOString(),
  });
}

export function isKnown(word) {
  return word.status === "known";
}

export function isDifficult(word) {
  return word.status === "difficult" || word.wrong > word.correct;
}

export function practiceModeLabel(mode, language = "en") {
  const lang = normalizeLanguage(language);
  return PRACTICE_MODE_LABELS_BY_LANGUAGE[lang][mode] || PRACTICE_MODE_LABELS[mode] || mode;
}

export function statusLabel(status, language = "en") {
  const lang = normalizeLanguage(language);
  return STATUS_LABELS_BY_LANGUAGE[lang][status] || STATUS_LABELS_BY_LANGUAGE[lang].new;
}

export function levelLabel(level, language = "en") {
  const lang = normalizeLanguage(language);
  return LEVEL_LABELS_BY_LANGUAGE[lang][level] || LEVEL_LABELS_BY_LANGUAGE[lang].A1;
}

export function addDays(days, fromDate = new Date()) {
  const date = new Date(fromDate);
  date.setDate(date.getDate() + days);
  return todayKey(date);
}

function addModeMistake(word, mode) {
  const modeKey = clean(mode);
  if (!modeKey) return normalizeModeMistakes(word.modeMistakes);
  const current = normalizeModeMistakes(word.modeMistakes);
  return {
    ...current,
    [modeKey]: (current[modeKey] || 0) + 1,
  };
}

export function updateWordProgress(word, action, today = new Date(), mode = "") {
  const currentDay = todayKey(today);

  if (action === "know" || action === "correct") {
    const interval = Math.max(1, word.reviewInterval ? word.reviewInterval * 2 : 1);
    const correct = word.correct + 1;
    return {
      ...word,
      correct,
      status: action === "know" || correct >= 3 || interval >= 4 ? "known" : "learning",
      reviewInterval: interval,
      nextReview: addDays(interval, today),
      lastAnswered: currentDay,
      modeMistakes: normalizeModeMistakes(word.modeMistakes),
    };
  }

  if (action === "difficult" || action === "incorrect") {
    return {
      ...word,
      wrong: word.wrong + 1,
      status: "difficult",
      reviewInterval: 0,
      nextReview: currentDay,
      lastAnswered: currentDay,
      modeMistakes: addModeMistake(word, mode),
    };
  }

  return {
    ...word,
    repeated: word.repeated + 1,
    status: "repeat",
    reviewInterval: 0,
    nextReview: currentDay,
    lastAnswered: currentDay,
    modeMistakes: normalizeModeMistakes(word.modeMistakes),
  };
}

export function dueWords(words, today = todayKey()) {
  return words.filter((word) => !word.nextReview || word.nextReview <= today || isDifficult(word) || word.status === "repeat");
}

export function todayReviewWords(words, today = todayKey()) {
  return words.filter((word) => {
    const practiced = Boolean(word.correct || word.wrong || word.repeated || word.lastAnswered);
    if (!practiced && word.status === "new") return false;
    return isDifficult(word) || word.status === "repeat" || !word.nextReview || word.nextReview <= today;
  });
}

export function studyPool(words, today = todayKey()) {
  const due = dueWords(words, today);
  return due.length ? due : words;
}

export function weightedWords(words, today = todayKey()) {
  return words.flatMap((word) => {
    const weight = isDifficult(word) ? 4 : word.status === "repeat" ? 3 : !word.nextReview || word.nextReview <= today ? 2 : 1;
    return Array.from({ length: weight }, () => word);
  });
}

export function pickWord(words, currentId, today = todayKey()) {
  const pool = weightedWords(words, today).filter((word) => word.id !== currentId);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : words[0];
}

export function makeOptions(words, correctWord) {
  const options = new Set([correctWord.turkish]);
  [...words]
    .filter((word) => word.id !== correctWord.id && word.turkish)
    .sort(() => Math.random() - 0.5)
    .forEach((word) => {
      if (options.size < 4) options.add(word.turkish);
    });
  return [...options].sort(() => Math.random() - 0.5);
}

export function buildQuiz(words) {
  if (words.length < 4) return [];
  const pool = studyPool(words);
  return [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(10, pool.length))
    .map((word) => ({ wordId: word.id, options: makeOptions(words, word), correctAnswer: word.turkish }));
}

export function dayTotal(row) {
  return (row?.correct || 0) + (row?.wrong || 0) + (row?.repeat || 0);
}

export function paginateItems(items = [], page = 1, pageSize = 50) {
  const safeItems = Array.isArray(items) ? items : [];
  const safePageSize = Math.max(1, Number(pageSize) || 50);
  const totalItems = safeItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const startIndex = (currentPage - 1) * safePageSize;
  const endIndex = Math.min(startIndex + safePageSize, totalItems);

  return {
    items: safeItems.slice(startIndex, endIndex),
    currentPage,
    pageSize: safePageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    displayStart: totalItems ? startIndex + 1 : 0,
    displayEnd: endIndex,
  };
}

export function calcStreak(daily, today = new Date()) {
  let streak = 0;
  for (let i = 0; i < 3650; i += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const active = dayTotal(daily[todayKey(date)]) > 0;
    if (active) {
      streak += 1;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

export function statsFor(words, daily) {
  const correct = words.reduce((sum, word) => sum + word.correct, 0);
  const wrong = words.reduce((sum, word) => sum + word.wrong, 0);
  const total = correct + wrong;
  const today = daily[todayKey()] || { correct: 0, wrong: 0, repeat: 0 };
  return {
    totalWords: words.length,
    learnedWords: words.filter(isKnown).length,
    difficultWords: words.filter(isDifficult).length,
    due: dueWords(words).length,
    accuracy: total ? Math.round((correct / total) * 100) : 0,
    streak: calcStreak(daily),
    todayCorrect: today.correct || 0,
    todayWrong: today.wrong || 0,
    todayStudied: dayTotal(today),
  };
}

export function dailyGoalSummary(daily, dailyGoal = 15, today = new Date(), language = "en") {
  const goal = Math.max(1, Number(dailyGoal) || 15);
  const locale = normalizeLanguage(language) === "tr" ? "tr-TR" : "en-US";
  const key = todayKey(today);
  const todayRow = daily?.[key] || { correct: 0, wrong: 0, repeat: 0 };
  const studied = dayTotal(todayRow);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - index));
    const dayKey = todayKey(date);
    const row = daily?.[dayKey] || { correct: 0, wrong: 0, repeat: 0 };
    const total = dayTotal(row);
    return {
      key: dayKey,
      label: date.toLocaleDateString(locale, { weekday: "short" }),
      total,
      active: total > 0,
      goalMet: total >= goal,
    };
  });

  return {
    key,
    goal,
    studied,
    correct: todayRow.correct || 0,
    wrong: todayRow.wrong || 0,
    repeat: todayRow.repeat || 0,
    remaining: Math.max(goal - studied, 0),
    percent: Math.min(100, Math.round((studied / goal) * 100)),
    goalMet: studied >= goal,
    streak: calcStreak(daily || {}, today),
    days,
  };
}

export function weeklyGoalSummary(daily, weeklyGoal = 100, today = new Date(), language = "en") {
  const goal = Math.max(1, Number(weeklyGoal) || 100);
  const locale = normalizeLanguage(language) === "tr" ? "tr-TR" : "en-US";
  const start = new Date(today);
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = todayKey(date);
    const row = daily?.[key] || { correct: 0, wrong: 0, repeat: 0 };
    const total = dayTotal(row);
    return {
      key,
      label: date.toLocaleDateString(locale, { weekday: "short" }),
      total,
      active: total > 0,
      goalMet: total >= Math.ceil(goal / 7),
    };
  });

  const studied = days.reduce((sum, day) => sum + day.total, 0);
  const end = days[days.length - 1];

  return {
    startKey: days[0].key,
    endKey: end.key,
    goal,
    studied,
    remaining: Math.max(goal - studied, 0),
    percent: Math.min(100, Math.round((studied / goal) * 100)),
    goalMet: studied >= goal,
    days,
  };
}

export function sessionSummaryFor(words, attempts = []) {
  const wordsById = new Map(words.map((word) => [word.id, word]));
  const rowsById = new Map();
  const totals = { correct: 0, difficult: 0, repeat: 0, hints: 0 };

  attempts.forEach((attempt) => {
    const word = wordsById.get(attempt.wordId);
    if (!word) return;

    const action = attempt.action === "know" ? "correct" : attempt.action === "skip" ? "repeat" : attempt.action;
    const row = rowsById.get(word.id) || {
      id: word.id,
      english: word.english,
      turkish: word.turkish,
      category: word.category,
      level: word.level,
      correct: 0,
      difficult: 0,
      repeat: 0,
      hints: 0,
      score: 0,
      lastAnswer: "",
    };

    if (action === "correct") {
      row.correct += 1;
      totals.correct += 1;
    } else if (action === "difficult" || action === "incorrect") {
      row.difficult += 1;
      totals.difficult += 1;
    } else {
      row.repeat += 1;
      totals.repeat += 1;
    }

    if (attempt.hinted) {
      row.hints += 1;
      totals.hints += 1;
    }

    row.lastAnswer = clean(attempt.answer);
    row.score = row.difficult * 3 + row.repeat * 2 + row.hints;
    rowsById.set(word.id, row);
  });

  const rows = [...rowsById.values()].sort((a, b) => b.score - a.score || b.difficult - a.difficult || b.repeat - a.repeat || a.english.localeCompare(b.english));
  const reviewWords = rows.filter((row) => row.score > 0);

  return {
    total: attempts.length,
    correct: totals.correct,
    difficult: totals.difficult,
    repeat: totals.repeat,
    hints: totals.hints,
    toughWords: reviewWords.slice(0, 3),
    reviewWords: reviewWords.slice(0, 5),
    masteredWords: rows.filter((row) => row.score === 0 && row.correct > 0).slice(0, 5),
  };
}

export function wordDetailSummary(word, language = "en") {
  const correct = Number(word?.correct || 0);
  const wrong = Number(word?.wrong || 0);
  const repeated = Number(word?.repeated || 0);
  const answered = correct + wrong;
  const modeMistakes = Object.entries(normalizeModeMistakes(word?.modeMistakes))
    .map(([mode, count]) => ({
      mode,
      label: practiceModeLabel(mode, language),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return {
    correct,
    wrong,
    repeated,
    attempts: answered + repeated,
    accuracy: answered ? Math.round((correct / answered) * 100) : 0,
    lastAnswered: clean(word?.lastAnswered),
    nextReview: clean(word?.nextReview),
    reviewInterval: Number(word?.reviewInterval || 0),
    status: normalizeStatus(word?.status, word),
    modeMistakes,
  };
}

export function dateKeyFromValue(value) {
  const raw = clean(value);
  if (!raw) return "";
  const direct = raw.match(/^\d{4}-\d{2}-\d{2}/);
  if (direct) return direct[0];
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? "" : todayKey(date);
}

export function learnedTimeline(words, days = 30, today = new Date(), language = "en") {
  const length = Math.max(1, Number(days) || 30);
  const locale = normalizeLanguage(language) === "tr" ? "tr-TR" : "en-US";
  const learnedDates = words
    .filter(isKnown)
    .map((word) => dateKeyFromValue(word.lastAnswered) || dateKeyFromValue(word.createdAt) || todayKey(today))
    .sort();

  return Array.from({ length }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (length - 1 - index));
    const key = todayKey(date);
    return {
      key,
      date: date.toLocaleDateString(locale, { month: "short", day: "numeric" }),
      learned: learnedDates.filter((learnedKey) => learnedKey <= key).length,
    };
  });
}

export function weeklyHeatmap(daily, weeks = 8, dailyGoal = 15, today = new Date(), language = "en") {
  const weekCount = Math.max(1, Number(weeks) || 8);
  const goal = Math.max(1, Number(dailyGoal) || 15);
  const locale = normalizeLanguage(language) === "tr" ? "tr-TR" : "en-US";
  const days = Array.from({ length: weekCount * 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (weekCount * 7 - 1 - index));
    const key = todayKey(date);
    const total = dayTotal(daily?.[key]);
    return {
      key,
      label: date.toLocaleDateString(locale, { month: "short", day: "numeric" }),
      weekday: date.toLocaleDateString(locale, { weekday: "short" }),
      total,
      intensity: total ? Math.min(4, Math.ceil((total / goal) * 4)) : 0,
      goalMet: total >= goal,
    };
  });

  return Array.from({ length: weekCount }, (_, index) => days.slice(index * 7, index * 7 + 7));
}

export function categoryAccuracy(words, language = "en") {
  const rows = new Map();
  const uncategorized = normalizeLanguage(language) === "tr" ? "Kategorisiz" : "Uncategorized";

  words.forEach((word) => {
    const category = clean(word.category) || uncategorized;
    const current = rows.get(category) || { category, correct: 0, wrong: 0, attempts: 0, accuracy: 0 };
    current.correct += Number(word.correct || 0);
    current.wrong += Number(word.wrong || 0);
    current.attempts = current.correct + current.wrong;
    current.accuracy = current.attempts ? Math.round((current.correct / current.attempts) * 100) : 0;
    rows.set(category, current);
  });

  return [...rows.values()].sort((a, b) => b.attempts - a.attempts || b.accuracy - a.accuracy || a.category.localeCompare(b.category));
}

export function learningDistribution(words, language = "en") {
  const counts = { learned: 0, learning: 0, new: 0 };
  const labels = normalizeLanguage(language) === "tr"
    ? { learned: "Ogrenildi", learning: "Ogreniliyor", new: "Yeni" }
    : { learned: "Learned", learning: "Learning", new: "New" };

  words.forEach((word) => {
    if (isKnown(word)) counts.learned += 1;
    else if (word.status === "new") counts.new += 1;
    else counts.learning += 1;
  });

  return [
    { key: "learned", name: labels.learned, value: counts.learned },
    { key: "learning", name: labels.learning, value: counts.learning },
    { key: "new", name: labels.new, value: counts.new },
  ];
}

export function weakWordPool(words, limit = 10) {
  const max = Math.max(1, Number(limit) || 10);
  return [...words]
    .filter((word) => Number(word.wrong || 0) > 0 || isDifficult(word))
    .sort((a, b) => {
      const wrongDiff = Number(b.wrong || 0) - Number(a.wrong || 0);
      if (wrongDiff) return wrongDiff;
      const difficultDiff = Number(isDifficult(b)) - Number(isDifficult(a));
      if (difficultDiff) return difficultDiff;
      const repeatDiff = Number(b.repeated || 0) - Number(a.repeated || 0);
      if (repeatDiff) return repeatDiff;
      return Number(a.correct || 0) - Number(b.correct || 0) || clean(a.english).localeCompare(clean(b.english));
    })
    .slice(0, max);
}

export function chartData(daily, language = "en") {
  const locale = normalizeLanguage(language) === "tr" ? "tr-TR" : "en-US";
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = todayKey(date);
    const row = daily[key] || { correct: 0, wrong: 0 };
    const total = (row.correct || 0) + (row.wrong || 0);
    return {
      date: date.toLocaleDateString(locale, { month: "short", day: "numeric" }),
      accuracy: total ? Math.round(((row.correct || 0) / total) * 100) : 0,
      words: total,
    };
  });
}

export function guessMappings(headers) {
  return headers.map((header) => {
    const normalized = answerKey(header);
    const field = Object.entries(FIELD_ALIASES).find(([, aliases]) => aliases.includes(normalized))?.[0] || "skip";
    return { file: header, system: field === "turkish" ? "translation" : field };
  });
}

export function buildImportPreview(rawRows, mappings, existingWords = [], language = "en") {
  const systemToColumn = Object.fromEntries(mappings.filter((item) => item.system !== "skip").map((item) => [item.system, item.file]));
  const lang = normalizeLanguage(language);
  const mapped = rawRows.map((row, index) => ({
    english: row[systemToColumn.english],
    turkish: row[systemToColumn.translation],
    example: row[systemToColumn.example],
    category: row[systemToColumn.category],
    level: row[systemToColumn.level],
    alternatives: row[systemToColumn.alternatives],
    index: index + 2,
  }));
  const existing = new Set(existingWords.map((word) => answerKey(word.english)));
  const seen = new Set();
  const issues = [];
  const valid = [];
  let duplicates = 0;

  mapped.forEach((row) => {
    if (!clean(row.english) || !clean(row.turkish)) {
      issues.push(lang === "tr" ? `Satir ${row.index}: Ingilizce kelime ve ceviri zorunlu.` : `Row ${row.index}: English and translation are required.`);
      return;
    }

    const key = answerKey(row.english);
    if (existing.has(key) || seen.has(key)) {
      duplicates += 1;
      return;
    }

    seen.add(key);
    valid.push(row);
  });

  if (duplicates) {
    issues.push(
      lang === "tr"
        ? `${duplicates} tekrar eden kelime atlandi (kutuphanende var veya dosyada tekrar ediyor).`
        : `${duplicates} duplicate word${duplicates > 1 ? "s" : ""} skipped (already in your library or repeated in the file).`,
    );
  }

  return { valid, issues };
}
