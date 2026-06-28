import test from "node:test";
import assert from "node:assert/strict";
import {
  PRACTICE_MODE_LABELS,
  answerMatches,
  buildImportPreview,
  categoryAccuracy,
  dailyGoalSummary,
  dueWords,
  guessMappings,
  learnedTimeline,
  learningDistribution,
  levelLabel,
  normalizeLanguage,
  paginateItems,
  pickEnglishSpeechVoice,
  practiceModeLabel,
  restoreBackup,
  serializeBackup,
  sessionSummaryFor,
  statusLabel,
  todayReviewWords,
  updateWordProgress,
  weeklyHeatmap,
  weeklyGoalSummary,
  weakWordPool,
  wordDetailSummary,
} from "../src/wordflowCore.js";

test("answer matching accepts punctuation, accents, case, and alternatives", () => {
  const word = {
    english: "improve",
    alternatives: ["get better", "make progress"],
  };

  assert.equal(answerMatches(" Improve! ", word), true);
  assert.equal(answerMatches("get-better", word), true);
  assert.equal(answerMatches("MAKE   PROGRESS", word), true);
  assert.equal(answerMatches("improving", word), false);
  assert.equal(answerMatches("", word), false);
});

test("speech voice picker prefers English voices over browser defaults", () => {
  const turkishVoice = { name: "Microsoft Emel", lang: "tr-TR" };
  const britishVoice = { name: "English United Kingdom", lang: "en-GB" };
  const americanVoice = { name: "Google US English", lang: "en-US" };

  assert.equal(pickEnglishSpeechVoice([turkishVoice, britishVoice, americanVoice]), americanVoice);
  assert.equal(pickEnglishSpeechVoice([turkishVoice, britishVoice]), britishVoice);
  assert.equal(pickEnglishSpeechVoice([turkishVoice]), null);
});

test("import mapping recognizes common English and Turkish headers", () => {
  const mappings = guessMappings(["Kelime", "T\u00fcrk\u00e7e", "Ornek", "Kategori", "Seviye", "Accepted Answers", "Notes"]);

  assert.deepEqual(mappings, [
    { file: "Kelime", system: "english" },
    { file: "T\u00fcrk\u00e7e", system: "translation" },
    { file: "Ornek", system: "example" },
    { file: "Kategori", system: "category" },
    { file: "Seviye", system: "level" },
    { file: "Accepted Answers", system: "alternatives" },
    { file: "Notes", system: "skip" },
  ]);
});

test("import preview skips missing rows and duplicates", () => {
  const mappings = guessMappings(["English", "Translation", "Example", "Level", "Alternatives"]);
  const rows = [
    { English: "Improve", Translation: "gelistirmek", Example: "I improve daily.", Level: "B1", Alternatives: "get better" },
    { English: "", Translation: "bos", Example: "", Level: "A1", Alternatives: "" },
    { English: "Fluent", Translation: "akici", Example: "She is fluent.", Level: "B2", Alternatives: "smooth" },
    { English: "fluent", Translation: "akici", Example: "", Level: "B2", Alternatives: "" },
  ];

  const result = buildImportPreview(rows, mappings, [{ english: "improve" }]);

  assert.equal(result.valid.length, 1);
  assert.equal(result.valid[0].english, "Fluent");
  assert.deepEqual(result.issues, [
    "Row 3: English and translation are required.",
    "2 duplicate words skipped (already in your library or repeated in the file).",
  ]);

  const turkishResult = buildImportPreview(rows, mappings, [{ english: "improve" }], "tr");
  assert.deepEqual(turkishResult.issues, [
    "Satir 3: Ingilizce kelime ve ceviri zorunlu.",
    "2 tekrar eden kelime atlandi (kutuphanende var veya dosyada tekrar ediyor).",
  ]);
});

test("review progress schedules correct answers and prioritizes difficult words", () => {
  const today = new Date("2026-06-05T12:00:00Z");
  const baseWord = {
    id: "w1",
    english: "fluent",
    turkish: "akici",
    status: "new",
    correct: 0,
    wrong: 0,
    repeated: 0,
    reviewInterval: 0,
    nextReview: "2026-06-05",
    lastAnswered: "",
  };

  const correct = updateWordProgress(baseWord, "correct", today);
  assert.equal(correct.correct, 1);
  assert.equal(correct.status, "learning");
  assert.equal(correct.reviewInterval, 1);
  assert.equal(correct.nextReview, "2026-06-06");

  const difficult = updateWordProgress({ ...baseWord, nextReview: "2026-06-30" }, "incorrect", today, "writing");
  assert.equal(difficult.wrong, 1);
  assert.equal(difficult.status, "difficult");
  assert.equal(difficult.nextReview, "2026-06-05");
  assert.deepEqual(difficult.modeMistakes, { writing: 1 });

  const listening = updateWordProgress(difficult, "incorrect", today, "listening");
  assert.equal(PRACTICE_MODE_LABELS.listening, "Listening");
  assert.equal(listening.modeMistakes.writing, 1);
  assert.equal(listening.modeMistakes.listening, 1);

  assert.deepEqual(dueWords([correct], "2026-06-05"), []);
  assert.deepEqual(todayReviewWords([baseWord], "2026-06-05"), []);
  assert.deepEqual(todayReviewWords([difficult], "2026-06-05").map((word) => word.id), ["w1"]);
});

test("language settings and labels support Turkish and English", () => {
  assert.equal(normalizeLanguage("en"), "en");
  assert.equal(normalizeLanguage("tr"), "tr");
  assert.equal(normalizeLanguage("de"), "tr");
  assert.equal(restoreBackup(JSON.stringify({ words: [], settings: {} })).settings.language, "tr");
  assert.equal(restoreBackup(JSON.stringify({ words: [], settings: { language: "en" } })).settings.language, "en");
  assert.equal(restoreBackup(JSON.stringify({ words: [], settings: { language: "fr" } })).settings.language, "tr");
  assert.equal(statusLabel("known", "tr"), "Ogrenildi");
  assert.equal(statusLabel("known", "en"), "Learned");
  assert.equal(practiceModeLabel("listening", "tr"), "Dinleme");
  assert.equal(practiceModeLabel("listening", "en"), "Listening");
  assert.equal(levelLabel("B1", "tr"), "orta");
  assert.equal(levelLabel("B1", "en"), "intermediate");
});

test("daily goal summary tracks remaining words, streak, and last seven days", () => {
  const today = new Date(2026, 5, 5, 12);
  const summary = dailyGoalSummary({
    "2026-06-03": { correct: 1, wrong: 0, repeat: 0 },
    "2026-06-04": { correct: 8, wrong: 2, repeat: 2 },
    "2026-06-05": { correct: 6, wrong: 1, repeat: 1 },
  }, 10, today);

  assert.equal(summary.studied, 8);
  assert.equal(summary.remaining, 2);
  assert.equal(summary.percent, 80);
  assert.equal(summary.goalMet, false);
  assert.equal(summary.streak, 3);
  assert.equal(summary.days.length, 7);
  assert.deepEqual(summary.days.slice(-3).map((day) => [day.key, day.total, day.goalMet]), [
    ["2026-06-03", 1, false],
    ["2026-06-04", 12, true],
    ["2026-06-05", 8, false],
  ]);

  const weekly = weeklyGoalSummary({
    "2026-06-01": { correct: 20, wrong: 0, repeat: 0 },
    "2026-06-03": { correct: 15, wrong: 5, repeat: 0 },
    "2026-06-05": { correct: 6, wrong: 1, repeat: 1 },
  }, 60, today);

  assert.equal(weekly.startKey, "2026-06-01");
  assert.equal(weekly.endKey, "2026-06-07");
  assert.equal(weekly.studied, 48);
  assert.equal(weekly.remaining, 12);
  assert.equal(weekly.percent, 80);
  assert.equal(weekly.goalMet, false);
});

test("word detail summary reports history and mode mistakes", () => {
  const summary = wordDetailSummary({
    status: "difficult",
    correct: 3,
    wrong: 2,
    repeated: 1,
    reviewInterval: 2,
    lastAnswered: "2026-06-05",
    nextReview: "2026-06-07",
    modeMistakes: { writing: 2, quiz: 1, unused: 0 },
  });

  assert.equal(summary.correct, 3);
  assert.equal(summary.wrong, 2);
  assert.equal(summary.repeated, 1);
  assert.equal(summary.attempts, 6);
  assert.equal(summary.accuracy, 60);
  assert.equal(summary.lastAnswered, "2026-06-05");
  assert.equal(summary.nextReview, "2026-06-07");
  assert.deepEqual(summary.modeMistakes.map((item) => [item.mode, item.label, item.count]), [
    ["writing", "Writing", 2],
    ["quiz", "Quiz", 1],
  ]);
});

test("weak word pool prioritizes hardest words", () => {
  const pool = weakWordPool([
    { id: "easy", english: "easy", status: "known", correct: 5, wrong: 0, repeated: 0 },
    { id: "quiz", english: "quiz", status: "difficult", correct: 1, wrong: 2, repeated: 0 },
    { id: "repeat", english: "repeat", status: "repeat", correct: 0, wrong: 1, repeated: 3 },
    { id: "writing", english: "writing", status: "learning", correct: 0, wrong: 4, repeated: 0 },
  ], 2);

  assert.deepEqual(pool.map((word) => word.id), ["writing", "quiz"]);
});

test("pagination slices lists and clamps page bounds", () => {
  const items = Array.from({ length: 123 }, (_, index) => index + 1);
  const first = paginateItems(items, 1, 50);
  assert.deepEqual(first.items, items.slice(0, 50));
  assert.equal(first.currentPage, 1);
  assert.equal(first.totalPages, 3);
  assert.equal(first.displayStart, 1);
  assert.equal(first.displayEnd, 50);

  const last = paginateItems(items, 3, 50);
  assert.deepEqual(last.items, items.slice(100, 123));
  assert.equal(last.displayStart, 101);
  assert.equal(last.displayEnd, 123);

  const clamped = paginateItems(items, 99, 50);
  assert.equal(clamped.currentPage, 3);
  assert.deepEqual(clamped.items, last.items);

  const empty = paginateItems([], 2, 50);
  assert.deepEqual(empty.items, []);
  assert.equal(empty.currentPage, 1);
  assert.equal(empty.totalPages, 1);
  assert.equal(empty.displayStart, 0);
  assert.equal(empty.displayEnd, 0);
});

test("session summary highlights difficult and repeat words", () => {
  const words = [
    { id: "w1", english: "improve", turkish: "gelistirmek", level: "B1", category: "Verbs" },
    { id: "w2", english: "challenge", turkish: "zorluk", level: "B1", category: "Nouns" },
    { id: "w3", english: "fluent", turkish: "akici", level: "B2", category: "Adjectives" },
    { id: "w4", english: "accurate", turkish: "dogru", level: "B1", category: "Adjectives" },
  ];
  const summary = sessionSummaryFor(words, [
    { wordId: "w1", action: "correct" },
    { wordId: "w2", action: "incorrect", answer: "wrong" },
    { wordId: "w3", action: "repeat" },
    { wordId: "w4", action: "correct", hinted: true },
  ]);

  assert.equal(summary.total, 4);
  assert.equal(summary.correct, 2);
  assert.equal(summary.difficult, 1);
  assert.equal(summary.repeat, 1);
  assert.equal(summary.hints, 1);
  assert.deepEqual(summary.toughWords.map((word) => word.id), ["w2", "w3", "w4"]);
  assert.deepEqual(summary.reviewWords.map((word) => word.id), ["w2", "w3", "w4"]);
  assert.deepEqual(summary.masteredWords.map((word) => word.id), ["w1"]);
});

test("progress stats build learned timeline and weekly heatmap", () => {
  const today = new Date(2026, 5, 5, 12);
  const words = [
    { id: "w1", status: "known", lastAnswered: "2026-06-02", createdAt: "2026-05-20" },
    { id: "w2", status: "known", lastAnswered: "2026-06-05", createdAt: "2026-05-21" },
    { id: "w3", status: "learning", lastAnswered: "2026-06-04", createdAt: "2026-05-22" },
  ];
  const timeline = learnedTimeline(words, 4, today);
  const heatmap = weeklyHeatmap({
    "2026-06-02": { correct: 3, wrong: 1, repeat: 1 },
    "2026-06-05": { correct: 8, wrong: 2, repeat: 0 },
  }, 1, 10, today);

  assert.deepEqual(timeline.map((row) => [row.key, row.learned]), [
    ["2026-06-02", 1],
    ["2026-06-03", 1],
    ["2026-06-04", 1],
    ["2026-06-05", 2],
  ]);
  assert.equal(heatmap.length, 1);
  assert.equal(heatmap[0].length, 7);
  assert.deepEqual(heatmap[0].slice(-4).map((day) => [day.key, day.total, day.intensity, day.goalMet]), [
    ["2026-06-02", 5, 2, false],
    ["2026-06-03", 0, 0, false],
    ["2026-06-04", 0, 0, false],
    ["2026-06-05", 10, 4, true],
  ]);
});

test("progress stats group category accuracy and learning distribution", () => {
  const words = [
    { category: "Verbs", status: "known", correct: 4, wrong: 1 },
    { category: "Verbs", status: "learning", correct: 1, wrong: 1 },
    { category: "Nouns", status: "new", correct: 0, wrong: 0 },
    { category: "", status: "difficult", correct: 1, wrong: 3 },
  ];

  assert.deepEqual(categoryAccuracy(words).map((row) => [row.category, row.attempts, row.accuracy]), [
    ["Verbs", 7, 71],
    ["Uncategorized", 4, 25],
    ["Nouns", 0, 0],
  ]);
  assert.deepEqual(learningDistribution(words), [
    { key: "learned", name: "Learned", value: 1 },
    { key: "learning", name: "Learning", value: 2 },
    { key: "new", name: "New", value: 1 },
  ]);
});

test("backup restore normalizes words, settings, and duplicate mistakes", () => {
  const backupText = serializeBackup({
    words: [
      {
        id: "w1",
        word: " improve ",
        translation: " gelistirmek ",
        alternatives: "get better; improve",
        status: "learned",
        correctCount: 2,
        incorrectCount: 1,
      },
      { id: "invalid", english: "missing translation" },
    ],
    mistakes: ["w1", "w1"],
    daily: { "2026-06-05": { correct: 2, wrong: 1, repeat: 0 } },
    settings: { dailyGoal: "20", darkMode: true, speechVoiceURI: "old-manual-voice" },
  });

  const restored = restoreBackup(backupText);

  assert.equal(restored.words.length, 1);
  assert.equal(restored.words[0].english, "improve");
  assert.equal(restored.words[0].turkish, "gelistirmek");
  assert.deepEqual(restored.words[0].alternatives, ["get better", "improve"]);
  assert.equal(restored.words[0].status, "known");
  assert.deepEqual(restored.mistakes, ["w1"]);
  assert.equal(restored.settings.dailyGoal, 20);
  assert.equal(restored.settings.weeklyGoal, 100);
  assert.equal(restored.settings.darkMode, true);
  assert.equal(restored.settings.language, "tr");
  assert.equal(restored.settings.speechVoiceURI, undefined);
  assert.equal(restored.daily["2026-06-05"].correct, 2);
});
