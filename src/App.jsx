import React, { createContext, lazy, Suspense, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BadgeCheck,
  BarChart3,
  BookOpen,
  BookmarkMinus,
  Brain,
  CalendarCheck,
  Check,
  Download,
  Edit2,
  FileSpreadsheet,
  Flame,
  Headphones,
  Home,
  Library,
  Lightbulb,
  Menu,
  Moon,
  PenTool,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RotateCcw,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Sun,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  Upload as UploadIcon,
  UserRound,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import wordflowLogoIcon from "./assets/wordflow-logo-icon.png";
import {
  LEVELS,
  LEGACY_KEYS,
  STORAGE_KEY,
  acceptedAnswers,
  answerMatches,
  buildImportPreview,
  buildQuiz,
  categoryAccuracy,
  chartData,
  clean,
  createWord,
  dailyGoalSummary,
  defaultState,
  guessMappings,
  isDifficult,
  isKnown,
  learnedTimeline,
  learningDistribution,
  levelLabel,
  loadXlsx,
  normalizeLanguage,
  normalizeState,
  normalizeWord,
  paginateItems,
  pickEnglishSpeechVoice,
  restoreBackup,
  serializeBackup,
  sessionSummaryFor,
  statsFor,
  statusLabel,
  studyPool,
  textKey,
  todayKey,
  todayReviewWords,
  updateWordProgress,
  weakWordPool,
  weeklyGoalSummary,
  weeklyHeatmap,
  wordDetailSummary,
} from "./wordflowCore.js";

const SIDEBAR_KEY = "wordflow:sidebar-open";
const APP_VERSION = "1.8.1";
const WORDS_PAGE_SIZE = 50;
const CategoryAccuracyChart = lazy(() => import("./components/CategoryAccuracyChart.jsx"));
const LearnedTimelineChart = lazy(() => import("./components/LearnedTimelineChart.jsx"));
const LearningDistributionChart = lazy(() => import("./components/LearningDistributionChart.jsx"));
const LearningProgressChart = lazy(() => import("./components/LearningProgressChart.jsx"));
const ROUTES = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/stats", label: "Stats", icon: BarChart3 },
  { path: "/reviews", label: "Reviews", icon: CalendarCheck },
  { path: "/upload", label: "Upload", icon: UploadIcon },
  { path: "/flashcards", label: "Flashcards", icon: BookOpen },
  { path: "/listening", label: "Listening", icon: Headphones },
  { path: "/weak-drill", label: "Weak Drill", icon: BookmarkMinus },
  { path: "/quiz", label: "Quiz", icon: Brain },
  { path: "/writing", label: "Writing", icon: PenTool },
  { path: "/words", label: "My Words", mobileLabel: "Words", icon: Library },
  { path: "/profile", label: "Profile", icon: UserRound },
  { path: "/settings", label: "Settings", icon: SettingsIcon },
];

const TRANSLATIONS = {
  tr: {
    "Dashboard": "Ana Sayfa",
    "Stats": "İstatistikler",
    "Reviews": "Tekrarlar",
    "Upload": "Yükle",
    "Flashcards": "Kartlar",
    "Listening": "Dinleme",
    "Weak Drill": "Zayıf Kelimeler",
    "Quiz": "Quiz",
    "Writing": "Yazma",
    "My Words": "Kelimelerim",
    "Words": "Kelimeler",
    "Profile": "Profil",
    "Settings": "Ayarlar",
    "Learn & Grow": "Öğren ve geliş",
    "Close sidebar": "Yan menüyü kapat",
    "Open sidebar": "Yan menüyü aç",
    "Today's Pool": "Bugünkü Havuz",
    "Today {studied}/{goal}, {streak} day streak": "Bugün {studied}/{goal}, {streak} günlük seri",
    "Add words to begin": "Başlamak için kelime ekle",
    "Fresh workspace": "Yeni çalışma alanı",
    "Start your WordFlow library": "WordFlow kütüphaneni başlat",
    "Add a few words first; the dashboard will turn into progress, reviews, and streaks once there is something to study.": "Önce birkaç kelime ekle; çalışılacak kelimeler oluşunca panel ilerleme, tekrar ve seri bilgilerine dönüşür.",
    "Upload Word List": "Kelime Listesi Yükle",
    "Bring in an Excel or CSV file.": "Excel veya CSV dosyası içe aktar.",
    "Download Sample": "Örnek İndir",
    "Start from the ready template.": "Hazır şablonla başla.",
    "Add Manually": "Elle Ekle",
    "Create the first word yourself.": "İlk kelimeyi kendin oluştur.",
    "Continue": "Devam et",
    "Loading chart...": "Grafik yükleniyor...",
    "Most Challenging": "En Çok Zorlayanlar",
    "Words that caused misses, repeats, or hints.": "Yanlış, tekrar veya ipucu kullanılan kelimeler.",
    "Repeat Next": "Sıradaki Tekrar",
    "A short list to revisit before moving on.": "Devam etmeden önce kısa tekrar listesi.",
    "Nothing stood out as difficult this round.": "Bu turda özellikle zorlayan kelime olmadı.",
    "You can move on or run another quick session.": "Devam edebilir veya kısa bir tur daha yapabilirsin.",
    "Session takeaway": "Oturum özeti",
    "Start the next round with the repeat list to lock these words in.": "Bu kelimeleri pekiştirmek için sonraki tura tekrar listesiyle başla.",
    "Back to Dashboard": "Ana Sayfaya Dön",
    "No difficult words in this session.": "Bu oturumda zor kelime yok.",
    "{count} words ready for a focused repeat.": "{count} kelime odaklı tekrar için hazır.",
    "Welcome back!": "Tekrar hoş geldin!",
    "Ready to continue your learning journey?": "Öğrenme yolculuğuna devam etmeye hazır mısın?",
    "Start Studying": "Çalışmaya Başla",
    "Today's Goal": "Bugünkü Hedef",
    "Goal reached, nice work!": "Hedef tamamlandı, güzel iş!",
    "{count} words left to keep the day moving.": "Günü ilerletmek için {count} kelime kaldı.",
    "Practiced": "Çalışıldı",
    "Remaining": "Kalan",
    "Streak": "Seri",
    "Accuracy": "Doğruluk",
    "today": "bugün",
    "goal done": "hedef bitti",
    "to goal": "hedefe",
    "study days": "çalışma günü",
    "{correct} correct, {wrong} missed, {repeat} repeated today": "Bugün {correct} doğru, {wrong} yanlış, {repeat} tekrar",
    "This Week's Goal": "Bu Haftanın Hedefi",
    "Weekly target complete.": "Haftalık hedef tamamlandı.",
    "{count} words left this week.": "Bu hafta {count} kelime kaldı.",
    "Daily goal complete": "Günlük hedef tamamlandı",
    "You earned today's study badge with {count} practiced words.": "Bugünkü çalışma rozetini {count} kelimeyle kazandın.",
    "Review Today's Words": "Bugünkü Kelimeleri Tekrarla",
    "Total": "Toplam",
    "Learned": "Öğrenildi",
    "Words in library": "Kütüphanedeki kelimeler",
    "{percent}% complete": "%{percent} tamamlandı",
    "All practice": "Tüm çalışmalar",
    "Learning Progress": "Öğrenme İlerlemesi",
    "Last 7 days": "Son 7 gün",
    "Quick Actions": "Hızlı İşlemler",
    "Study Flashcards": "Kartlarla Çalış",
    "Review your words": "Kelimelerini tekrar et",
    "Today's Reviews": "Bugünkü Tekrarlar",
    "{count} words due": "{count} kelime zamanı geldi",
    "Listening Practice": "Dinleme Çalışması",
    "Hear the word, pick the meaning": "Kelimeyi dinle, anlamı seç",
    "Weak Word Drill": "Zayıf Kelime Antrenmanı",
    "Focus on hardest words": "En zor kelimelere odaklan",
    "Take a Quiz": "Quiz Çöz",
    "Test your knowledge": "Bilgini test et",
    "Add New Words": "Yeni Kelime Ekle",
    "Upload a word list": "Kelime listesi yükle",
    "Words to Review": "Tekrar Edilecek Kelimeler",
    "View all": "Tümünü gör",
    "Review": "Tekrar",
    "No difficult words yet.": "Henüz zor kelime yok.",
    "No stats yet": "Henüz istatistik yok",
    "Add a few words and complete a short session to unlock progress charts.": "İlerleme grafiklerini açmak için birkaç kelime ekle ve kısa bir çalışma tamamla.",
    "Upload Words": "Kelime Yükle",
    "Your learning profile": "Öğrenme profilin",
    "Your progress, rhythm, and future badge space in one place.": "İlerlemen, çalışma ritmin ve gelecekteki rozet alanın tek yerde.",
    "Profile Summary": "Profil Özeti",
    "Words Learned": "Öğrenilen Kelime",
    "Total Correct": "Toplam Doğru",
    "correct answers": "doğru cevap",
    "Badge Shelf": "Rozet Rafı",
    "Badges": "Rozetler",
    "Badges will appear here soon.": "Rozetler yakında burada görünecek.",
    "Prepared for future achievements.": "Gelecekteki başarılar için hazırlandı.",
    "Empty badge slot": "Boş rozet alanı",
    "Go to Stats": "İstatistiklere Git",
    "Progress & motivation": "İlerleme ve motivasyon",
    "Detailed Stats": "Detaylı İstatistikler",
    "A deeper view of learning pace, practice rhythm, category accuracy, and word status.": "Öğrenme hızı, çalışma ritmi, kategori doğruluğu ve kelime durumuna detaylı bakış.",
    "Active Days": "Aktif Günler",
    "Daily Average": "Günlük Ortalama",
    "all sessions": "tüm oturumlar",
    "last 8 weeks": "son 8 hafta",
    "words on active days": "aktif günlerde kelime",
    "Learned Over Time": "Zamanla Öğrenilenler",
    "Cumulative learned words across the last 30 days.": "Son 30 gündeki toplam öğrenilen kelimeler.",
    "{count} learned": "{count} öğrenildi",
    "Learning Distribution": "Öğrenme Dağılımı",
    "Learned, learning, and new words.": "Öğrenilen, öğrenilen ve yeni kelimeler.",
    "Weekly Activity Heatmap": "Haftalık Aktivite Isı Haritası",
    "Last 8 weeks of correct, missed, and repeated answers.": "Son 8 haftadaki doğru, yanlış ve tekrar cevaplar.",
    "Best day": "En iyi gün",
    "No activity": "Aktivite yok",
    "Goal": "Hedef",
    "Category Accuracy": "Kategori Doğruluğu",
    "Correct answer rate by vocabulary category.": "Kelime kategorisine göre doğru cevap oranı.",
    "No categories": "Kategori yok",
    "Motivation Snapshot": "Motivasyon Özeti",
    "A compact read on momentum and review pressure.": "Tempo ve tekrar yoğunluğuna kısa bakış.",
    "Review Load": "Tekrar Yükü",
    "words ready for review": "tekrar için hazır kelimeler",
    "Difficult Words": "Zor Kelimeler",
    "need extra attention": "ekstra dikkat ister",
    "Current Streak": "Mevcut Seri",
    "Best Category": "En İyi Kategori",
    "no attempts yet": "henüz deneme yok",
    "No reviews due today": "Bugün tekrar yok",
    "You are caught up. Add new words or start a flashcard session when you want more practice.": "Bugünlük tamamsın. Daha fazla çalışmak istersen yeni kelime ekle veya kart oturumu başlat.",
    "Bugünkü Tekrarlar": "Bugünkü Tekrarlar",
    "Zor ve zamanı gelen kelimeleri hızlıca gözden geçir.": "Zor ve zamanı gelen kelimeleri hızlıca gözden geçir.",
    "Flashcards ile Çalış": "Kartlarla Çalış",
    "Due Today": "Bugün",
    "Difficult": "Zor",
    "Repeat Queue": "Tekrar Kuyruğu",
    "Accepted": "Kabul edilen",
    "Repeat": "Tekrar",
    "Still Difficult": "Hala Zor",
    "I Know It": "Biliyorum",
    "Import your vocabulary from Excel or CSV files": "Kelime listenizi Excel veya CSV dosyalarından içe aktarın",
    "Drop your file here": "Dosyanı buraya bırak",
    "or click to browse": "veya seçmek için tıkla",
    "Supports .xlsx, .xls, .csv files": ".xlsx, .xls, .csv dosyalarını destekler",
    "Not sure about the format?": "Formatı bilmiyor musun?",
    "Download sample template": "Örnek şablonu indir",
    "Processing {name}": "{name} işleniyor",
    "{progress}% complete": "%{progress} tamamlandı",
    "Map Your Columns": "Kolonlarını Eşleştir",
    "Match your file columns to WordFlow fields": "Dosya kolonlarını WordFlow alanlarıyla eşleştir",
    "From your file": "Dosyandan",
    "English Word": "İngilizce Kelime",
    "Translation": "Çeviri",
    "Example": "Örnek",
    "Category": "Kategori",
    "Level": "Seviye",
    "Alternative Answers": "Alternatif Cevaplar",
    "Skip": "Atla",
    "Cancel": "İptal",
    "Preview Data": "Veriyi Önizle",
    "Preview Import": "İçe Aktarmayı Önizle",
    "English": "İngilizce",
    "General": "Genel",
    "Back": "Geri",
    "Import {count} Words": "{count} Kelimeyi İçe Aktar",
    "Import Successful!": "İçe Aktarma Başarılı!",
    "{count} words have been added to your library": "{count} kelime kütüphanene eklendi",
    "Upload Another": "Başka Yükle",
    "View My Words": "Kelimelerimi Gör",
    "No flashcards yet": "Henüz kart yok",
    "Upload or add words to start studying.": "Çalışmaya başlamak için kelime yükle veya ekle.",
    "Mastered": "Hakim",
    "Need Review": "Tekrar Gerekli",
    "Skipped": "Atlandı",
    "Repeat List": "Tekrar Listesi",
    "known cards": "bilinen kartlar",
    "marked hard": "zor işaretlendi",
    "repeat later": "sonra tekrar",
    "next focus": "sonraki odak",
    "Flashcard Session Complete": "Kart Oturumu Tamamlandı",
    "Here are the words that felt easy, the ones that need another pass, and a focused repeat list.": "Kolay gelen kelimeler, tekrar isteyenler ve odaklı tekrar listesi burada.",
    "Study Again": "Tekrar Çalış",
    "Flashcard Study": "Kart Çalışması",
    "Card {current} of {total}": "Kart {current} / {total}",
    "Click to reveal translation": "Çeviriyi görmek için tıkla",
    "Review Later": "Sonra Tekrarla",
    "I Know This": "Bunu Biliyorum",
    "Quiz needs at least 4 words": "Quiz için en az 4 kelime gerekir",
    "Add more vocabulary to generate multiple choice questions.": "Çoktan seçmeli sorular oluşturmak için daha fazla kelime ekle.",
    "Loading quiz...": "Quiz yükleniyor...",
    "Quiz Complete!": "Quiz Tamamlandı!",
    "Excellent work!": "Harika iş!",
    "Good effort!": "Güzel çaba!",
    "Keep practicing!": "Çalışmaya devam!",
    "Your Score": "Skorun",
    "Wrong Answers to Review": "Tekrar Edilecek Yanlışlar",
    "Your answer": "Cevabın",
    "Correct": "Doğru",
    "No answer": "Cevap yok",
    "No wrong answers this round.": "Bu turda yanlış cevap yok.",
    "Try Again": "Tekrar Dene",
    "Vocabulary Quiz": "Kelime Quizi",
    "Question {current} of {total}": "Soru {current} / {total}",
    "Score": "Skor",
    "What is the translation of:": "Bunun çevirisi nedir:",
    "Next Question": "Sonraki Soru",
    "View Results": "Sonuçları Gör",
    "Listening needs at least 4 words": "Dinleme için en az 4 kelime gerekir",
    "Add more vocabulary to generate listening choices.": "Dinleme seçenekleri oluşturmak için daha fazla kelime ekle.",
    "Loading listening practice...": "Dinleme çalışması yükleniyor...",
    "heard right": "doğru duyuldu",
    "Incorrect": "Yanlış",
    "needs repeat": "tekrar gerekli",
    "this session": "bu oturum",
    "Listening Practice Complete": "Dinleme Çalışması Tamamlandı",
    "Your listening choices are summarized with the words that need another pass.": "Dinleme cevapların ve tekrar isteyen kelimeler özetlendi.",
    "Listen Again": "Tekrar Dinle",
    "Listen and choose the Turkish meaning": "Dinle ve Türkçe anlamı seç",
    "Hidden word": "Gizli kelime",
    "Correct meaning: {answer}": "Doğru anlam: {answer}",
    "The English word stays hidden until you answer.": "Cevap verene kadar İngilizce kelime gizli kalır.",
    "Replay": "Tekrar Dinle",
    "Play Word": "Kelimeyi Dinle",
    "Audio is not available in this browser, but you can still answer the choices.": "Bu tarayıcıda ses kullanılamıyor, yine de seçenekleri cevaplayabilirsin.",
    "Writing Practice": "Yazma Çalışması",
    "Writing practice needs words": "Yazma çalışması için kelime gerekir",
    "Upload or add words to practice typed answers.": "Yazılı cevap çalışmak için kelime yükle veya ekle.",
    "Writing Practice Complete": "Yazma Çalışması Tamamlandı",
    "Typed answers are summarized with the words that caused mistakes or needed hints.": "Yazılı cevapların, hata ve ipucu gerektiren kelimelerle özetlendi.",
    "Practice Again": "Tekrar Çalış",
    "typed right": "doğru yazıldı",
    "Hints": "İpuçları",
    "used today": "bugün kullanıldı",
    "Word {current} of {total}": "Kelime {current} / {total}",
    "Write the English word for:": "Bunun İngilizcesini yaz:",
    "Hint": "İpucu",
    "Your Answer": "Cevabın",
    "Type the English word...": "İngilizce kelimeyi yaz...",
    "Correct!": "Doğru!",
    "Accepted answer": "Kabul edilen cevap",
    "Accepted answers": "Kabul edilen cevaplar",
    "Show Hint": "İpucu Göster",
    "Hint Shown": "İpucu Gösterildi",
    "Check Answer": "Cevabı Kontrol Et",
    "Next Word": "Sonraki Kelime",
    "Complete Session": "Oturumu Tamamla",
    "Weak drill needs words": "Zayıf kelime çalışması için kelime gerekir",
    "Add vocabulary first, then WordFlow can find the hardest words for you.": "Önce kelime ekle; sonra WordFlow senin için en zor kelimeleri bulur.",
    "No weak words yet": "Henüz zayıf kelime yok",
    "Miss a few words in quiz, writing, reviews, or flashcards and they will appear here automatically.": "Quiz, yazma, tekrar veya kartlarda birkaç kelime kaçırınca burada otomatik görünürler.",
    "Weak Drill Complete": "Zayıf Kelime Antrenmanı Tamamlandı",
    "This focused drill used your most missed words and updated their next review timing.": "Bu odaklı çalışma en çok yanlış yaptığın kelimeleri kullandı ve tekrar zamanlarını güncelledi.",
    "Drill Again": "Tekrar Antrenman Yap",
    "Manage your vocabulary library": "Kelime kütüphaneni yönet",
    "Search words...": "Kelime ara...",
    "All Categories": "Tüm Kategoriler",
    "All Levels": "Tüm Seviyeler",
    "Difficult Words Only": "Sadece Zor Kelimeler",
    "{count} words found": "{count} kelime bulundu",
    "Showing {start}-{end} of {total} words": "{start}-{end} / {total} kelime gösteriliyor",
    "Page {current} of {total}": "Sayfa {current} / {total}",
    "First": "İlk",
    "Previous": "Önceki",
    "Next": "Sonraki",
    "Last": "Son",
    "Status": "Durum",
    "Actions": "İşlemler",
    "Also": "Ayrıca",
    "Edit word": "Kelimeyi düzenle",
    "Delete word": "Kelimeyi sil",
    "No words found": "Kelime bulunamadı",
    "Try adjusting your filters": "Filtreleri değiştirmeyi dene",
    "Edit Word": "Kelimeyi Düzenle",
    "Add New Word": "Yeni Kelime Ekle",
    "Enter English word": "İngilizce kelime gir",
    "Enter translation": "Çeviri gir",
    "Optional: synonym, alternate spelling": "İsteğe bağlı: eş anlamlı, farklı yazım",
    "Separate multiple accepted answers with commas or semicolons.": "Birden fazla kabul edilen cevabı virgül veya noktalı virgülle ayır.",
    "Example Sentence": "Örnek Cümle",
    "Enter example sentence": "Örnek cümle gir",
    "Save Word": "Kelimeyi Kaydet",
    "Add Word": "Kelime Ekle",
    "Delete word?": "Kelime silinsin mi?",
    "\"{word}\" will be removed from your vocabulary and practice sessions.": "\"{word}\" kelime kütüphanenden ve çalışma oturumlarından kaldırılacak.",
    "Delete Word": "Kelimeyi Sil",
    "Manage your preferences and data": "Tercihlerini ve verilerini yönet",
    "Appearance": "Görünüm",
    "Theme": "Tema",
    "Choose your preferred color theme": "Tercih ettiğin renk temasını seç",
    "Language": "Dil",
    "Choose the app language": "Uygulama dilini seç",
    "Turkce": "Türkçe",
    "Learning Preferences": "Öğrenme Tercihleri",
    "Daily Goal": "Günlük Hedef",
    "Number of words to study each day": "Her gün çalışılacak kelime sayısı",
    "Weekly Goal": "Haftalık Hedef",
    "Number of words to practice each week": "Her hafta çalışılacak kelime sayısı",
    "Notifications": "Bildirimler",
    "Receive study reminders": "Çalışma hatırlatmaları al",
    "Data Management": "Veri Yönetimi",
    "Export Data (Excel)": "Veriyi Dışa Aktar (Excel)",
    "Download your vocabulary as a spreadsheet": "Kelime listenizi tablo olarak indir",
    "Backup (JSON)": "Yedek (JSON)",
    "Full backup including progress, restorable later": "İlerleme dahil tam yedek, sonra geri yüklenebilir",
    "Restore Backup": "Yedeği Geri Yükle",
    "Load words and progress from a backup file": "Yedek dosyadan kelimeleri ve ilerlemeyi yükle",
    "Reset Progress": "İlerlemeyi Sıfırla",
    "Clear learning data but keep words": "Kelimeler kalsın, öğrenme verisini temizle",
    "Clear Word List": "Kelime Listesini Temizle",
    "Remove vocabulary and progress": "Kelimeleri ve ilerlemeyi kaldır",
    "About": "Hakkında",
    "Version": "Sürüm",
    "Total Words": "Toplam Kelime",
    "Invalid backup file": "Geçersiz yedek dosyası",
    "This file could not be read as a WordFlow backup. Please choose a valid .json backup.": "Bu dosya WordFlow yedeği olarak okunamadı. Lütfen geçerli bir .json yedeği seç.",
    "OK": "Tamam",
    "Restore backup?": "Yedek geri yüklensin mi?",
    "This replaces your current word list and all progress with the contents of the backup. This cannot be undone.": "Mevcut kelime listen ve tüm ilerlemen yedekteki içerikle değişir. Bu işlem geri alınamaz.",
    "Reset progress?": "İlerleme sıfırlansın mı?",
    "Your word list will stay in place, but all learning history, mistakes, review timing, and daily progress will be cleared.": "Kelime listen kalır; öğrenme geçmişi, hatalar, tekrar zamanları ve günlük ilerleme temizlenir.",
    "Clear word list?": "Kelime listesi temizlensin mi?",
    "This removes every vocabulary item and all practice progress from this browser.": "Bu tarayıcıdaki tüm kelimeleri ve çalışma ilerlemesini kaldırır.",
    "You've studied {studied}/{goal} words today. Keep your streak going!": "Bugün {studied}/{goal} kelime çalıştın. Serini sürdür!",
  },
};

const I18nContext = createContext({
  language: "tr",
  t: (key, params) => formatMessage(TRANSLATIONS.tr[key] || key, params),
});

function formatMessage(message, params = {}) {
  return String(message).replace(/\{(\w+)\}/g, (_, key) => params[key] ?? "");
}

function translate(language, key, params = {}) {
  const lang = normalizeLanguage(language);
  const message = lang === "en" ? key : TRANSLATIONS.tr[key] || key;
  return formatMessage(message, params);
}

function useI18n() {
  return useContext(I18nContext);
}

function wordCountLabel(count, language) {
  return normalizeLanguage(language) === "tr" ? `${count} kelime` : `${count} word${count === 1 ? "" : "s"}`;
}

function routeLabel(route, t, mobile = false) {
  return t(mobile ? route.mobileLabel || route.label : route.label);
}

const SAMPLE_WORD_ROWS = [
  { English: "improve", Translation: "geli\u015ftirmek", Example: "I want to improve my English.", Category: "Verbs", Level: "B1", Alternatives: "get better" },
  { English: "challenge", Translation: "zorluk", Example: "Learning a language is a challenge.", Category: "Nouns", Level: "B1", Alternatives: "difficulty" },
  { English: "fluent", Translation: "ak\u0131c\u0131", Example: "She is fluent in three languages.", Category: "Adjectives", Level: "B2", Alternatives: "smooth" },
];

async function downloadSampleTemplate() {
  const XLSX = await loadXlsx();
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(SAMPLE_WORD_ROWS), "Words");
  XLSX.writeFile(wb, "wordflow-template.xlsx");
}

function currentPath() {
  const path = window.location.pathname;
  return ROUTES.some((route) => route.path === path) ? path : "/";
}

function loadState() {
  for (const key of [STORAGE_KEY, ...LEGACY_KEYS]) {
    try {
      const item = localStorage.getItem(key);
      if (item) return normalizeState(JSON.parse(item));
    } catch {
      localStorage.removeItem(key);
    }
  }
  return defaultState();
}

function speakWord(word) {
  if (typeof window === "undefined" || !window.speechSynthesis || !word) return false;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean(word));
    const voice = pickEnglishSpeechVoice(window.speechSynthesis.getVoices?.() || []);
    utterance.lang = voice?.lang || "en-US";
    if (voice) utterance.voice = voice;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

function Card({ hover = false, className = "", children, ...props }) {
  const Component = hover ? motion.div : "div";
  const hoverProps = hover
    ? {
        whileHover: { y: -4, boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.2)" },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Component className={`min-w-0 bg-card border border-border rounded-lg p-6 shadow-sm ${className}`} {...hoverProps} {...props}>
      {children}
    </Component>
  );
}

function Button({ variant = "primary", size = "md", className = "", children, ...props }) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90 shadow-sm hover:shadow-md",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

function PaginationControls({ pagination, onPageChange }) {
  const { t } = useI18n();
  if (!pagination.totalItems) return null;

  const isFirst = pagination.currentPage <= 1;
  const isLast = pagination.currentPage >= pagination.totalPages;

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        {t("Page {current} of {total}", { current: pagination.currentPage, total: pagination.totalPages })}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" disabled={isFirst} onClick={() => onPageChange(1)}>
          {t("First")}
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={isFirst} onClick={() => onPageChange(pagination.currentPage - 1)}>
          {t("Previous")}
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={isLast} onClick={() => onPageChange(pagination.currentPage + 1)}>
          {t("Next")}
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={isLast} onClick={() => onPageChange(pagination.totalPages)}>
          {t("Last")}
        </Button>
      </div>
    </div>
  );
}

function PronounceButton({ word, label = "Listen", className = "" }) {
  const { t } = useI18n();
  const buttonLabel = label === "Listen" ? t("Play Word") : label;
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={(event) => {
        event.stopPropagation();
        speakWord(word);
      }}
      className={`inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${className}`}
      aria-label={t("Play Word")}
      title={t("Play Word")}
    >
      <Volume2 className="h-4 w-4" />
      {label && <span>{buttonLabel}</span>}
    </motion.button>
  );
}

function EmptyState({ title, text, action }) {
  return (
    <Card className="text-center">
      <Sparkles className="mx-auto mb-4 h-10 w-10 text-blue-500" />
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="mx-auto mb-6 max-w-md text-muted-foreground">{text}</p>
      {action}
    </Card>
  );
}

function ConfirmDialog({ open, title, text, confirmLabel = "Confirm", onCancel, onConfirm }) {
  const { t } = useI18n();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">{title}</h3>
            <p className="mb-6 text-sm leading-6 text-muted-foreground">{text}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                {t("Cancel")}
              </Button>
              <Button type="button" variant="destructive" className="flex-1" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function formatDateLabel(value, fallback = "Not set") {
  const raw = clean(value);
  if (!raw) return fallback;
  const date = new Date(raw.length === 10 ? `${raw}T00:00:00` : raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function WordDetailModal({ word, onClose }) {
  const { t, language } = useI18n();
  if (!word) return null;
  const detail = wordDetailSummary(word, language);
  const statCards = [
    { label: t("Correct"), value: detail.correct, icon: Check, className: "text-green-500", bg: "bg-green-500/10" },
    { label: t("Incorrect"), value: detail.wrong, icon: X, className: "text-red-500", bg: "bg-red-500/10" },
    { label: t("Repeat"), value: detail.repeated, icon: RotateCcw, className: "text-blue-500", bg: "bg-blue-500/10" },
    { label: t("Accuracy"), value: `${detail.accuracy}%`, icon: TrendingUp, className: "text-violet-500", bg: "bg-violet-500/10" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg border border-border bg-card p-6 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="text-2xl font-semibold">{word.english}</h3>
                <PronounceButton word={word.english} label="" className="px-2 py-2" />
                <span className="rounded bg-accent px-2 py-1 text-xs text-muted-foreground">{statusLabel(detail.status, language)}</span>
              </div>
              <p className="text-muted-foreground">{word.turkish}</p>
              {word.example && <p className="mt-2 text-sm italic text-muted-foreground">&quot;{word.example}&quot;</p>}
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label={t("Cancel")}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {statCards.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-lg border border-border bg-background p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
                      <Icon className={`h-4 w-4 ${item.className}`} />
                    </div>
                  </div>
                  <div className="text-2xl font-semibold">{item.value}</div>
                </div>
              );
            })}
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <div className="text-xs text-muted-foreground">{language === "tr" ? "Son Çalışma" : "Last Studied"}</div>
              <div className="mt-1 font-medium">{formatDateLabel(detail.lastAnswered, language === "tr" ? "Henüz çalışılmadı" : "Not studied yet")}</div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="text-xs text-muted-foreground">{language === "tr" ? "Sıradaki Tekrar" : "Next Review"}</div>
              <div className="mt-1 font-medium">{formatDateLabel(detail.nextReview, language === "tr" ? "Planlanmadı" : "Not scheduled")}</div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="text-xs text-muted-foreground">{language === "tr" ? "Tekrar Aralığı" : "Review Interval"}</div>
              <div className="mt-1 font-medium">{detail.reviewInterval ? (language === "tr" ? `${detail.reviewInterval} gün` : `${detail.reviewInterval} day${detail.reviewInterval === 1 ? "" : "s"}`) : language === "tr" ? "Bugün" : "Today"}</div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-semibold">{language === "tr" ? "Moda Göre Hatalar" : "Mistakes by Mode"}</h4>
                <p className="text-sm text-muted-foreground">{language === "tr" ? "Yanlış cevaplar artık çalışma türüne göre takip edilir." : "Wrong answers are tracked per practice type from now on."}</p>
              </div>
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
            {detail.modeMistakes.length ? (
              <div className="flex flex-wrap gap-2">
                {detail.modeMistakes.map((item) => (
                  <span key={item.mode} className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-sm text-orange-700 dark:text-orange-300">
                    {item.label}: <span className="font-semibold">{item.count}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-accent/50 p-3 text-sm text-muted-foreground">{language === "tr" ? "Henüz moda özel hata kaydedilmedi." : "No mode-specific mistakes recorded yet."}</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Layout({ children, currentPath, onNavigate, stats, dailyGoal }) {
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) !== "false";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, sidebarOpen ? "true" : "false");
    } catch {
      // Preference storage can be unavailable in private contexts.
    }
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-background flex">
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            key="desktop-sidebar"
            initial={{ x: -24, opacity: 0, width: 0 }}
            animate={{ x: 0, opacity: 1, width: 256 }}
            exit={{ x: -24, opacity: 0, width: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:self-start shrink-0 flex-col overflow-hidden border-r border-border bg-card"
          >
            <div className="p-6 border-b border-border">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <img src={wordflowLogoIcon} alt="WordFlow logo" className="h-10 w-10 object-contain" />
                <div className="min-w-0 flex-1">
                  <h1 className="font-semibold text-foreground">WordFlow</h1>
                  <p className="text-xs text-muted-foreground">{t("Learn & Grow")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label={t("Close sidebar")}
                  title={t("Close sidebar")}
                >
                  <PanelLeftClose className="h-5 w-5" />
                </button>
              </motion.div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {ROUTES.map((item, index) => {
                const isActive = currentPath === item.path;
                const Icon = item.icon;
                return (
                  <motion.div key={item.path} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.05 * index, duration: 0.3 }}>
                    <button
                      onClick={() => onNavigate(item.path)}
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all duration-200 group ${
                        isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {isActive && (
                        <motion.div layoutId="activeNav" className="absolute inset-0 bg-primary rounded-lg" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                      )}
                      <Icon className="w-5 h-5 relative z-10 transition-transform group-hover:scale-110" />
                      <span className="relative z-10">{routeLabel(item, t)}</span>
                    </button>
                  </motion.div>
                );
              })}
            </nav>

            <div className="p-4 border-t border-border">
              <motion.div whileHover={{ scale: 1.02 }} className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                <p className="text-sm font-medium text-foreground mb-1">{t("Today's Pool")}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalWords ? t("Today {studied}/{goal}, {streak} day streak", { studied: stats.todayStudied, goal: dailyGoal, streak: stats.streak }) : t("Add words to begin")}
                </p>
              </motion.div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-4 z-40 hidden rounded-lg border border-border bg-card p-3 text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground lg:inline-flex"
          aria-label={t("Open sidebar")}
          title={t("Open sidebar")}
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
      )}

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img src={wordflowLogoIcon} alt="WordFlow logo" className="h-8 w-8 object-contain" />
            <h1 className="font-semibold">WordFlow</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-accent rounded-lg transition-colors">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-border overflow-hidden bg-card"
            >
              <div className="p-4 space-y-1">
                {ROUTES.map((item) => {
                  const isActive = currentPath === item.path;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        onNavigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full ${
                        isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{routeLabel(item, t)}</span>
                    </button>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      <main className={`min-w-0 flex-1 pt-16 pb-20 transition-[padding] duration-200 lg:pt-0 lg:pb-0 ${sidebarOpen ? "" : "lg:pl-16"}`}>
        <motion.div
          key={currentPath}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>

      <nav className="wf-mobile-bottom lg:hidden fixed bottom-0 left-0 right-0 z-50 flex gap-1 overflow-x-auto border-t border-border bg-card px-2 py-2">
        {ROUTES.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`min-w-20 flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs transition-colors ${
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{routeLabel(item, t, true)}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function EmptyDashboard({ navigate, onAddWord }) {
  const { t } = useI18n();
  const actions = [
    {
      title: t("Upload Word List"),
      text: t("Bring in an Excel or CSV file."),
      icon: UploadIcon,
      onClick: () => navigate("/upload"),
      className: "border-blue-500/30 bg-blue-500/5 hover:border-blue-500/60 hover:bg-blue-500/10",
      iconClass: "bg-blue-500 text-white",
    },
    {
      title: t("Download Sample"),
      text: t("Start from the ready template."),
      icon: Download,
      onClick: downloadSampleTemplate,
      className: "border-green-500/30 bg-green-500/5 hover:border-green-500/60 hover:bg-green-500/10",
      iconClass: "bg-green-500 text-white",
    },
    {
      title: t("Add Manually"),
      text: t("Create the first word yourself."),
      icon: Plus,
      onClick: onAddWord,
      className: "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/60 hover:bg-purple-500/10",
      iconClass: "bg-purple-500 text-white",
    },
  ];

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto flex min-h-full max-w-6xl flex-col justify-center p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-6 max-w-3xl md:mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-blue-500" />
            {t("Fresh workspace")}
          </div>
          <h1 className="mb-4 text-3xl font-semibold tracking-normal text-foreground md:text-4xl lg:text-5xl">{t("Start your WordFlow library")}</h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">{t("Add a few words first; the dashboard will turn into progress, reviews, and streaks once there is something to study.")}</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.title}
                type="button"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index, duration: 0.45 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.onClick}
                className={`flex min-h-[112px] flex-col items-start justify-between rounded-lg border p-4 text-left transition-colors md:min-h-[190px] md:p-5 ${action.className}`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg md:h-12 md:w-12 ${action.iconClass}`}>
                  <Icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <h2 className="mb-1 text-lg font-semibold md:mb-2 md:text-xl">{action.title}</h2>
                  <p className="text-sm leading-6 text-muted-foreground">{action.text}</p>
                </div>
                <div className="hidden items-center gap-2 text-sm font-medium text-foreground md:flex">
                  {t("Continue")}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ChartFallback({ height = 250 }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-center rounded-lg bg-accent/30 text-sm text-muted-foreground" style={{ height }}>
      {t("Loading chart...")}
    </div>
  );
}

const SUMMARY_ACCENTS = {
  green: {
    icon: "from-green-500 to-emerald-500",
    progress: "from-green-500 to-emerald-500",
    soft: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  purple: {
    icon: "from-violet-500 to-fuchsia-500",
    progress: "from-violet-500 to-fuchsia-500",
    soft: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  blue: {
    icon: "from-cyan-500 to-teal-500",
    progress: "from-cyan-500 to-teal-500",
    soft: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
};

function SummaryWordRow({ word, index }) {
  const { language } = useI18n();
  const badges = [
    word.difficult ? (language === "tr" ? `${word.difficult} hata` : `${word.difficult} miss`) : "",
    word.repeat ? (language === "tr" ? `${word.repeat} tekrar` : `${word.repeat} repeat`) : "",
    word.hints ? (language === "tr" ? `${word.hints} ipucu` : `${word.hints} hint`) : "",
  ].filter(Boolean);

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/70 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-semibold">{index + 1}</div>
        <div className="min-w-0">
          <div className="truncate font-medium">{word.english}</div>
          <div className="truncate text-sm text-muted-foreground">{word.turkish}</div>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap justify-end gap-1">
        {badges.length ? badges.map((badge) => (
          <span key={badge} className="rounded-md bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">{badge}</span>
        )) : (
          <span className="rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400">{language === "tr" ? "temiz" : "clear"}</span>
        )}
      </div>
    </div>
  );
}

function SessionSummaryPanel({ title, subtitle, icon: Icon, accent = "green", metrics, summary, retryLabel, onRetry, onDashboard }) {
  const { t, language } = useI18n();
  const styles = SUMMARY_ACCENTS[accent] || SUMMARY_ACCENTS.green;
  const reviewCount = summary.reviewWords.length;
  const masteredCount = summary.masteredWords.length;
  const reviewText = reviewCount
    ? t("{count} words ready for a focused repeat.", { count: reviewCount })
    : t("No difficult words in this session.");

  return (
    <div className="h-full overflow-auto flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-5xl">
        <Card>
          <div className="mb-8 flex flex-col gap-4 text-left sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.15 }} className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${styles.icon} text-white shadow-sm`}>
                <Icon className="h-8 w-8" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground md:text-base">{subtitle}</p>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 self-start rounded-lg px-3 py-2 text-sm font-medium sm:self-center ${styles.soft}`}>
              <CalendarCheck className="h-4 w-4" />
              {reviewText}
            </div>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {metrics.map((metric) => {
              const MetricIcon = metric.icon;
              return (
                <div key={metric.label} className="rounded-lg border border-border bg-accent/30 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <MetricIcon className={`h-5 w-5 ${metric.className}`} />
                    <span className="text-xs text-muted-foreground">{metric.label}</span>
                  </div>
                  <div className="text-2xl font-semibold">{metric.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{metric.text}</div>
                </div>
              );
            })}
          </div>

          <div className="mb-8 grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg border border-border p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{t("Most Challenging")}</h3>
                  <p className="text-sm text-muted-foreground">{t("Words that caused misses, repeats, or hints.")}</p>
                </div>
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div className="space-y-2">
                {summary.toughWords.length ? summary.toughWords.map((word, index) => (
                  <SummaryWordRow key={word.id} word={word} index={index} />
                )) : (
                  <div className="rounded-lg bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-400">{t("Nothing stood out as difficult this round.")}</div>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-border p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{t("Repeat Next")}</h3>
                  <p className="text-sm text-muted-foreground">{t("A short list to revisit before moving on.")}</p>
                </div>
                <RotateCcw className="h-5 w-5 text-blue-500" />
              </div>
              <div className="space-y-2">
                {summary.reviewWords.length ? summary.reviewWords.map((word, index) => (
                  <SummaryWordRow key={word.id} word={word} index={index} />
                )) : (
                  <div className="rounded-lg bg-blue-500/10 p-4 text-sm text-blue-700 dark:text-blue-400">{t("You can move on or run another quick session.")}</div>
                )}
              </div>
            </section>
          </div>

          <div className="mb-8 rounded-lg border border-border bg-accent/30 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium">{t("Session takeaway")}</div>
                <p className="text-sm text-muted-foreground">
                  {reviewCount ? t("Start the next round with the repeat list to lock these words in.") : `${wordCountLabel(masteredCount || summary.correct, language)} ${language === "tr" ? "sorunsuz geçti." : "went smoothly."}`}
                </p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-background sm:w-48">
                <motion.div initial={{ width: 0 }} animate={{ width: `${summary.total ? Math.round((summary.correct / summary.total) * 100) : 0}%` }} transition={{ duration: 0.7 }} className={`h-full bg-gradient-to-r ${styles.progress}`} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={onRetry} className="flex-1">
              <RotateCcw className="w-4 h-4" />
              {retryLabel}
            </Button>
            <Button onClick={onDashboard} className="flex-1">
              {t("Back to Dashboard")}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function Dashboard({ words, daily, navigate, dailyGoal = 15, weeklyGoal = 100, onAddWord }) {
  const { t, language } = useI18n();
  if (!words.length) return <EmptyDashboard navigate={navigate} onAddWord={onAddWord} />;

  const stats = statsFor(words, daily);
  const reviewWords = todayReviewWords(words);
  const difficultWords = reviewWords.slice(0, 3);
  const learnedPercent = stats.totalWords ? Math.round((stats.learnedWords / stats.totalWords) * 100) : 0;
  const dailySummary = dailyGoalSummary(daily, dailyGoal, new Date(), language);
  const weeklySummary = weeklyGoalSummary(daily, weeklyGoal, new Date(), language);
  const goalPercent = dailySummary.percent;
  const goalMet = dailySummary.goalMet;
  const weeklyGoalMet = weeklySummary.goalMet;
  const todayAccuracy = dailySummary.studied ? Math.round((dailySummary.correct / dailySummary.studied) * 100) : 0;
  const data = chartData(daily, language);
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold mb-2">{t("Welcome back!")}</h1>
              <p className="text-muted-foreground">{t("Ready to continue your learning journey?")}</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => navigate("/flashcards")} size="lg">
                <Zap className="w-5 h-5" />
                {t("Start Studying")}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
          <Card>
            <div className="mb-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-lg ${goalMet ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"}`}>
                  {goalMet ? <Check className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                </div>
                <div>
                  <div className="text-lg font-semibold">{t("Today's Goal")}</div>
                  <div className="text-sm text-muted-foreground">
                    {goalMet ? t("Goal reached, nice work!") : t("{count} words left to keep the day moving.", { count: dailySummary.remaining })}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[520px]">
                {[
                  { label: t("Practiced"), value: `${dailySummary.studied}/${dailySummary.goal}`, text: t("today"), icon: BookOpen, className: "text-blue-500" },
                  { label: t("Remaining"), value: dailySummary.remaining, text: goalMet ? t("goal done") : t("to goal"), icon: Target, className: "text-green-500" },
                  { label: t("Streak"), value: dailySummary.streak, text: t("study days"), icon: Flame, className: "text-orange-500" },
                  { label: t("Accuracy"), value: `${todayAccuracy}%`, text: t("today"), icon: TrendingUp, className: "text-violet-500" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-lg border border-border bg-accent/30 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <Icon className={`h-4 w-4 ${item.className}`} />
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                      </div>
                      <div className="text-xl font-semibold">{item.value}</div>
                      <div className="text-xs text-muted-foreground">{item.text}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mb-4 h-2.5 bg-accent rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${goalPercent}%` }} transition={{ duration: 0.6 }} className={`h-full ${goalMet ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-blue-500 to-cyan-500"}`} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                {t("{correct} correct, {wrong} missed, {repeat} repeated today", { correct: dailySummary.correct, wrong: dailySummary.wrong, repeat: dailySummary.repeat })}
              </div>
              <div className="flex items-center gap-2">
                {dailySummary.days.map((day) => (
                  <div key={day.key} className="flex flex-col items-center gap-1">
                    <div title={`${day.key}: ${wordCountLabel(day.total, language)}`} className={`h-8 w-8 rounded-lg border text-xs font-medium flex items-center justify-center ${day.goalMet ? "border-green-500 bg-green-500 text-white" : day.active ? "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400" : "border-border bg-background text-muted-foreground"}`}>
                      {day.total || ""}
                    </div>
                    <span className="text-[11px] text-muted-foreground">{day.label.slice(0, 1)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 rounded-lg border border-border bg-background p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${weeklyGoalMet ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"}`}>
                    {weeklyGoalMet ? <Trophy className="h-5 w-5" /> : <Award className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-semibold">{t("This Week's Goal")}</div>
                    <div className="text-sm text-muted-foreground">
                      {weeklyGoalMet ? t("Weekly target complete.") : t("{count} words left this week.", { count: weeklySummary.remaining })}
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xl font-semibold">{weeklySummary.studied}/{weeklySummary.goal}</div>
                  <div className="text-xs text-muted-foreground">{weeklySummary.startKey} - {weeklySummary.endKey}</div>
                </div>
              </div>
              <div className="mb-3 h-2 bg-accent rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${weeklySummary.percent}%` }} transition={{ duration: 0.6 }} className={`h-full ${weeklyGoalMet ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-orange-500 to-yellow-500"}`} />
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weeklySummary.days.map((day) => (
                  <div key={day.key} title={`${day.key}: ${wordCountLabel(day.total, language)}`} className={`rounded-lg border p-2 text-center text-xs ${day.active ? "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300" : "border-border bg-card text-muted-foreground"}`}>
                    <div className="font-medium">{day.label.slice(0, 1)}</div>
                    <div className="mt-1 text-sm font-semibold">{day.total || "-"}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <AnimatePresence>
          {goalMet && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Card className="border-green-500/30 bg-green-500/5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-sm">
                      <BadgeCheck className="h-8 w-8" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-700 dark:text-green-400">{t("Daily goal complete")}</div>
                      <p className="text-sm text-muted-foreground">{t("You earned today's study badge with {count} practiced words.", { count: dailySummary.studied })}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/reviews")}>
                    {t("Review Today's Words")}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: t("Total"), value: stats.totalWords, text: t("Words in library"), icon: BookOpen, colors: "from-blue-500/10 to-purple-500/10", iconClass: "bg-blue-500/10 text-blue-500" },
            { label: t("Learned"), value: stats.learnedWords, text: t("{percent}% complete", { percent: learnedPercent }), icon: Target, colors: "from-green-500/10 to-emerald-500/10", iconClass: "bg-green-500/10 text-green-500" },
            { label: t("Accuracy"), value: `${stats.accuracy}%`, text: t("All practice"), icon: TrendingUp, colors: "from-purple-500/10 to-pink-500/10", iconClass: "bg-purple-500/10 text-purple-500" },
            { label: t("Streak"), value: dailySummary.streak, text: t("study days"), icon: Award, colors: "from-orange-500/10 to-red-500/10", iconClass: "bg-orange-500/10 text-orange-500" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label} variants={itemVariants}>
                <Card hover className="relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.colors} rounded-full -mr-16 -mt-16`} />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-3 rounded-lg ${card.iconClass}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-sm text-muted-foreground">{card.label}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-semibold">{card.value}</div>
                      <div className="text-sm text-muted-foreground">{card.text}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">{t("Learning Progress")}</h3>
                <div className="text-sm text-muted-foreground">{t("Last 7 days")}</div>
              </div>
              <Suspense fallback={<ChartFallback height={250} />}>
                <LearningProgressChart data={data} accuracyLabel={t("Accuracy")} wordsLabel={t("Words")} />
              </Suspense>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
            <Card>
              <h3 className="font-semibold mb-6">{t("Quick Actions")}</h3>
              <div className="space-y-3">
                {[
                  { path: "/flashcards", title: t("Study Flashcards"), text: t("Review your words"), icon: BookOpen, row: "from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30", iconClass: "bg-blue-500" },
                  { path: "/reviews", title: t("Today's Reviews"), text: t("{count} words due", { count: reviewWords.length }), icon: CalendarCheck, row: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30", iconClass: "bg-orange-500" },
                  { path: "/listening", title: t("Listening Practice"), text: t("Hear the word, pick the meaning"), icon: Headphones, row: "from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30", iconClass: "bg-cyan-500" },
                  { path: "/weak-drill", title: t("Weak Word Drill"), text: t("Focus on hardest words"), icon: BookmarkMinus, row: "from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30", iconClass: "bg-red-500" },
                  { path: "/quiz", title: t("Take a Quiz"), text: t("Test your knowledge"), icon: Brain, row: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30", iconClass: "bg-purple-500" },
                  { path: "/upload", title: t("Add New Words"), text: t("Upload a word list"), icon: FileSpreadsheet, row: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30", iconClass: "bg-green-500" },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <motion.button key={action.path} whileHover={{ x: 4 }} onClick={() => navigate(action.path)} className={`w-full flex items-center justify-between p-4 rounded-lg bg-gradient-to-r ${action.row} hover:shadow-md transition-shadow`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${action.iconClass} rounded-lg`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-sm text-muted-foreground">{action.text}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}>
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">{t("Words to Review")}</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/reviews")}>{t("View all")}</Button>
            </div>
            <div className="space-y-3">
              {difficultWords.length ? difficultWords.map((word, index) => (
                <motion.div key={word.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + index * 0.1 }} className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                  <div>
                    <div className="font-medium">{word.english}</div>
                    <div className="text-sm text-muted-foreground">{word.turkish}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">{word.correct}/{word.correct + word.wrong}</div>
                    <div className="px-2 py-1 rounded text-xs bg-orange-500/10 text-orange-500">{t("Review")}</div>
                  </div>
                </motion.div>
              )) : <div className="text-sm text-muted-foreground">{t("No difficult words yet.")}</div>}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function ProfilePage({ words, daily, navigate }) {
  const { t } = useI18n();
  const stats = statsFor(words, daily);
  const totalCorrect = words.reduce((sum, word) => sum + Number(word.correct || 0), 0);
  const learnedPercent = stats.totalWords ? Math.round((stats.learnedWords / stats.totalWords) * 100) : 0;
  const badgeSlots = Array.from({ length: 8 }, (_, index) => index);
  const summaryCards = [
    { label: t("Total"), value: stats.totalWords, text: t("Words in library"), icon: BookOpen, className: "text-blue-500", bg: "bg-blue-500/10" },
    { label: t("Words Learned"), value: stats.learnedWords, text: t("{percent}% complete", { percent: learnedPercent }), icon: BadgeCheck, className: "text-green-500", bg: "bg-green-500/10" },
    { label: t("Accuracy"), value: `${stats.accuracy}%`, text: t("All practice"), icon: TrendingUp, className: "text-violet-500", bg: "bg-violet-500/10" },
    { label: t("Streak"), value: stats.streak, text: t("study days"), icon: Flame, className: "text-orange-500", bg: "bg-orange-500/10" },
    { label: t("Total Correct"), value: totalCorrect, text: t("correct answers"), icon: Check, className: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: t("Difficult Words"), value: stats.difficultWords, text: t("need extra attention"), icon: AlertCircle, className: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
              <UserRound className="h-4 w-4 text-blue-500" />
              {t("Profile")}
            </div>
            <h1 className="text-3xl font-semibold md:text-4xl">{t("Your learning profile")}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{t("Your progress, rhythm, and future badge space in one place.")}</p>
          </div>
          <Button onClick={() => navigate("/flashcards")} size="lg">
            <Zap className="h-5 w-5" />
            {t("Start Studying")}
          </Button>
        </motion.div>

        <Card>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold">{t("Profile Summary")}</h2>
              <p className="text-sm text-muted-foreground">{t("Prepared for future achievements.")}</p>
            </div>
            <Trophy className="h-5 w-5 text-violet-500" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-lg border border-border bg-background p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bg}`}>
                      <Icon className={`h-5 w-5 ${item.className}`} />
                    </div>
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </div>
                  <div className="text-3xl font-semibold">{item.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{item.text}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">{t("Badge Shelf")}</h2>
              <p className="text-sm text-muted-foreground">{t("Badges will appear here soon.")}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              {t("Badges")}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
            {badgeSlots.map((slot) => (
              <div
                key={slot}
                aria-label={t("Empty badge slot")}
                className="flex aspect-square min-h-28 items-center justify-center rounded-lg border border-dashed border-border bg-accent/30 text-muted-foreground"
              >
                <Award className="h-8 w-8 opacity-35" />
                <span className="sr-only">{t("Empty badge slot")}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { label: t("Start Studying"), icon: Zap, onClick: () => navigate("/flashcards") },
            { label: t("Go to Stats"), icon: BarChart3, onClick: () => navigate("/stats") },
            { label: t("My Words"), icon: Library, onClick: () => navigate("/words") },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Button key={action.label} variant="outline" onClick={action.onClick} className="justify-between">
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {action.label}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const HEATMAP_CLASSES = [
  "border-border bg-background text-muted-foreground",
  "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300",
  "border-cyan-200 bg-cyan-100 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/50 dark:text-cyan-300",
  "border-blue-300 bg-blue-200 text-blue-800 dark:border-blue-800 dark:bg-blue-900/60 dark:text-blue-200",
  "border-green-500 bg-green-500 text-white",
];
const DISTRIBUTION_COLORS = {
  learned: "#22c55e",
  learning: "#3b82f6",
  new: "#a855f7",
};

function StatsPage({ words, daily, dailyGoal = 15, navigate }) {
  const { t, language } = useI18n();
  const stats = statsFor(words, daily);
  const timeline = useMemo(() => learnedTimeline(words, 30, new Date(), language), [words, language]);
  const heatmap = useMemo(() => weeklyHeatmap(daily, 8, dailyGoal, new Date(), language), [daily, dailyGoal, language]);
  const heatmapCells = heatmap.flat();
  const categories = useMemo(() => categoryAccuracy(words, language).slice(0, 6), [words, language]);
  const distribution = useMemo(() => learningDistribution(words, language), [words, language]);
  const distributionTotal = distribution.reduce((sum, item) => sum + item.value, 0);
  const activeDays = heatmapCells.filter((day) => day.total > 0).length;
  const totalActivity = heatmapCells.reduce((sum, day) => sum + day.total, 0);
  const dailyAverage = activeDays ? Math.round(totalActivity / activeDays) : 0;
  const bestDay = heatmapCells.reduce((best, day) => (day.total > best.total ? day : best), { total: 0, label: t("No activity") });
  const topCategory = categories.find((category) => category.attempts > 0) || categories[0];
  const learnedPercent = stats.totalWords ? Math.round((stats.learnedWords / stats.totalWords) * 100) : 0;

  if (!words.length) {
    return (
      <div className="h-full overflow-auto flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <EmptyState
            title={t("No stats yet")}
            text={t("Add a few words and complete a short session to unlock progress charts.")}
            action={<Button onClick={() => navigate("/upload")}>{t("Upload Words")}</Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              {t("Progress & motivation")}
            </div>
            <h1 className="text-3xl font-semibold md:text-4xl">{t("Detailed Stats")}</h1>
            <p className="mt-2 text-muted-foreground">{t("A deeper view of learning pace, practice rhythm, category accuracy, and word status.")}</p>
          </div>
          <Button onClick={() => navigate("/flashcards")} size="lg">
            <Zap className="h-5 w-5" />
            {t("Start Studying")}
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: t("Learned"), value: `${stats.learnedWords}/${stats.totalWords}`, text: t("{percent}% complete", { percent: learnedPercent }), icon: BadgeCheck, className: "text-green-500", bg: "bg-green-500/10" },
            { label: t("Accuracy"), value: `${stats.accuracy}%`, text: t("all sessions"), icon: TrendingUp, className: "text-blue-500", bg: "bg-blue-500/10" },
            { label: t("Active Days"), value: activeDays, text: t("last 8 weeks"), icon: CalendarCheck, className: "text-cyan-500", bg: "bg-cyan-500/10" },
            { label: t("Daily Average"), value: dailyAverage, text: t("words on active days"), icon: Flame, className: "text-orange-500", bg: "bg-orange-500/10" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="relative overflow-hidden">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${item.bg}`}>
                  <Icon className={`h-5 w-5 ${item.className}`} />
                </div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
                <div className="mt-1 text-3xl font-semibold">{item.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{item.text}</div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <Card className="xl:col-span-3">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold">{t("Learned Over Time")}</h2>
                <p className="text-sm text-muted-foreground">{t("Cumulative learned words across the last 30 days.")}</p>
              </div>
              <div className="rounded-lg bg-green-500/10 px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400">{t("{count} learned", { count: stats.learnedWords })}</div>
            </div>
            <Suspense fallback={<ChartFallback height={300} />}>
              <LearnedTimelineChart data={timeline} learnedLabel={t("Learned")} />
            </Suspense>
          </Card>

          <Card className="xl:col-span-2">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold">{t("Learning Distribution")}</h2>
                <p className="text-sm text-muted-foreground">{t("Learned, learning, and new words.")}</p>
              </div>
              <Trophy className="h-5 w-5 text-violet-500" />
            </div>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px] xl:grid-cols-1">
              <Suspense fallback={<ChartFallback height={230} />}>
                <LearningDistributionChart data={distribution} colors={DISTRIBUTION_COLORS} />
              </Suspense>
              <div className="space-y-3">
                {distribution.map((item) => {
                  const percent = distributionTotal ? Math.round((item.value / distributionTotal) * 100) : 0;
                  return (
                    <div key={item.key} className="rounded-lg border border-border p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: DISTRIBUTION_COLORS[item.key] }} />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{percent}%</span>
                      </div>
                      <div className="text-2xl font-semibold">{item.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold">{t("Weekly Activity Heatmap")}</h2>
              <p className="text-sm text-muted-foreground">{t("Last 8 weeks of correct, missed, and repeated answers.")}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span>{t("Best day")}: <span className="font-medium text-foreground">{bestDay.total ? wordCountLabel(bestDay.total, language) : t("No activity")}</span></span>
              <span>{t("Goal")}: <span className="font-medium text-foreground">{wordCountLabel(dailyGoal, language)}</span></span>
            </div>
          </div>
          <div className="w-full max-w-full overflow-x-auto pb-2">
            <div className="grid w-max grid-cols-7 gap-1.5 sm:gap-2">
              {heatmapCells.map((day) => (
                <div key={day.key} className="flex flex-col items-center gap-1">
                  <div title={`${day.label}: ${wordCountLabel(day.total, language)}`} className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[11px] font-semibold sm:h-10 sm:w-10 sm:text-xs ${HEATMAP_CLASSES[day.intensity]}`}>
                    {day.total || ""}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{day.weekday.slice(0, 1)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold">{t("Category Accuracy")}</h2>
                <p className="text-sm text-muted-foreground">{t("Correct answer rate by vocabulary category.")}</p>
              </div>
              <div className="rounded-lg bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                {topCategory ? topCategory.category : t("No categories")}
              </div>
            </div>
            <Suspense fallback={<ChartFallback height={300} />}>
              <CategoryAccuracyChart data={categories} accuracyLabel={t("Accuracy")} />
            </Suspense>
          </Card>

          <Card>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold">{t("Motivation Snapshot")}</h2>
                <p className="text-sm text-muted-foreground">{t("A compact read on momentum and review pressure.")}</p>
              </div>
              <Sparkles className="h-5 w-5 text-cyan-500" />
            </div>
            <div className="space-y-3">
              {[
                { label: t("Review Load"), value: stats.due, text: t("words ready for review"), icon: CalendarCheck, className: "text-orange-500", bg: "bg-orange-500/10" },
                { label: t("Difficult Words"), value: stats.difficultWords, text: t("need extra attention"), icon: AlertCircle, className: "text-red-500", bg: "bg-red-500/10" },
                { label: t("Current Streak"), value: stats.streak, text: t("study days"), icon: Flame, className: "text-green-500", bg: "bg-green-500/10" },
                { label: t("Best Category"), value: topCategory ? `${topCategory.accuracy}%` : "0%", text: topCategory ? topCategory.category : t("no attempts yet"), icon: Trophy, className: "text-violet-500", bg: "bg-violet-500/10" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                        <Icon className={`h-5 w-5 ${item.className}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium">{item.label}</div>
                        <div className="truncate text-sm text-muted-foreground">{item.text}</div>
                      </div>
                    </div>
                    <div className="shrink-0 text-2xl font-semibold">{item.value}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ReviewsPage({ words, recordAnswer, navigate }) {
  const { t, language } = useI18n();
  const reviewWords = useMemo(() => todayReviewWords(words), [words]);
  const difficultCount = reviewWords.filter(isDifficult).length;
  const repeatCount = reviewWords.filter((word) => word.status === "repeat").length;

  if (!reviewWords.length) {
    return (
      <div className="h-full overflow-auto flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <EmptyState
            title={t("No reviews due today")}
            text={t("You are caught up. Add new words or start a flashcard session when you want more practice.")}
            action={<Button onClick={() => navigate("/flashcards")}>{t("Study Flashcards")}</Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold mb-2">{language === "tr" ? "Bugünkü Tekrarlar" : "Today's Reviews"}</h1>
            <p className="text-muted-foreground">{language === "tr" ? "Zor ve zamanı gelen kelimeleri hızlıca gözden geçir." : "Review difficult and due words quickly."}</p>
          </div>
          <Button onClick={() => navigate("/flashcards")} variant="outline">
            <BookOpen className="w-4 h-4" />
            {language === "tr" ? "Kartlarla Çalış" : "Study Flashcards"}
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="bg-orange-500/5">
            <div className="text-sm text-muted-foreground">{t("Due Today")}</div>
            <div className="mt-2 text-3xl font-semibold">{reviewWords.length}</div>
          </Card>
          <Card className="bg-red-500/5">
            <div className="text-sm text-muted-foreground">{t("Difficult")}</div>
            <div className="mt-2 text-3xl font-semibold">{difficultCount}</div>
          </Card>
          <Card className="bg-blue-500/5">
            <div className="text-sm text-muted-foreground">{t("Repeat Queue")}</div>
            <div className="mt-2 text-3xl font-semibold">{repeatCount}</div>
          </Card>
        </div>

        <div className="space-y-3">
          {reviewWords.map((word, index) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold">{word.english}</h2>
                    <PronounceButton word={word.english} label="" className="px-2 py-2" />
                    <span className={`rounded px-2 py-1 text-xs ${isDifficult(word) ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"}`}>
                      {isDifficult(word) ? t("Difficult") : statusLabel(word.status, language)}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{word.turkish}</p>
                  {word.example && <p className="mt-2 text-sm italic text-muted-foreground">&quot;{word.example}&quot;</p>}
                  {word.alternatives?.length ? <p className="mt-2 text-xs text-muted-foreground">{t("Accepted")}: {acceptedAnswers(word).join(", ")}</p> : null}
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:min-w-[360px]">
                  <Button variant="outline" onClick={() => recordAnswer(word.id, "repeat", "reviews")}>{t("Repeat")}</Button>
                  <Button variant="outline" onClick={() => recordAnswer(word.id, "difficult", "reviews")}>{t("Still Difficult")}</Button>
                  <Button onClick={() => recordAnswer(word.id, "correct", "reviews")}>
                    <Check className="w-4 h-4" />
                    {t("I Know It")}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UploadPage({ onImport, navigate, existingWords = [] }) {
  const { t, language } = useI18n();
  const [state, setState] = useState("idle");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [columns, setColumns] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const fileInputRef = useRef(null);

  async function processFile(file) {
    if (!file) return;
    setFileName(file.name);
    setProgress(0);
    setState("uploading");
    setWarnings([]);

    try {
      setProgress(35);
      const XLSX = await loadXlsx();
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const headers = Object.keys(rows[0] || {});
      if (!rows.length || !headers.length) throw new Error(language === "tr" ? "Bu dosyada satır bulunamadı." : "No rows found in this file.");
      setProgress(100);
      setRawRows(rows);
      setColumns(headers);
      setMappings(guessMappings(headers));
      setState("mapping");
    } catch (error) {
      setWarnings([error.message || (language === "tr" ? "Dosya okunamadı." : "File could not be read.")]);
      setState("idle");
    }
  }

  function buildPreview() {
    const { valid, issues } = buildImportPreview(rawRows, mappings, existingWords, language);
    setWarnings(issues);
    setPreviewData(valid);
    setState("preview");
  }

  function importPreview() {
    setState("uploading");
    setProgress(0);
    window.setTimeout(() => {
      setProgress(100);
      onImport(previewData.map(createWord));
      setState("success");
    }, 240);
  }

  function reset() {
    setState("idle");
    setFileName("");
    setProgress(0);
    setColumns([]);
    setMappings([]);
    setRawRows([]);
    setPreviewData([]);
    setWarnings([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl font-semibold mb-2">{t("Upload Word List")}</h1>
          <p className="text-muted-foreground">{t("Import your vocabulary from Excel or CSV files")}</p>
        </motion.div>

        {warnings.length > 0 && (
          <Card className="border-orange-500/20 bg-orange-500/5">
            <div className="flex items-start gap-3 text-orange-600">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div className="space-y-1 text-sm">{warnings.slice(0, 6).map((warning) => <p key={warning}>{warning}</p>)}</div>
            </div>
          </Card>
        )}

        <AnimatePresence mode="wait">
          {state === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
              <Card>
                <div
                  onDrop={(event) => {
                    event.preventDefault();
                    processFile(event.dataTransfer.files[0]);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 hover:bg-accent/20 transition-all cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <motion.div whileHover={{ scale: 1.1 }} className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                    <UploadIcon className="w-10 h-10 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">{t("Drop your file here")}</h3>
                  <p className="text-muted-foreground mb-4">{t("or click to browse")}</p>
                  <p className="text-sm text-muted-foreground">{t("Supports .xlsx, .xls, .csv files")}</p>
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={(event) => processFile(event.target.files?.[0])} className="hidden" />
                </div>
                <div className="mt-4 flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center">
                  <p className="text-sm text-muted-foreground">{t("Not sure about the format?")}</p>
                  <Button type="button" variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); downloadSampleTemplate(); }}>
                    <Download className="w-4 h-4" />{t("Download sample template")}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {state === "uploading" && (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card>
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-6">
                    <FileSpreadsheet className="w-8 h-8 text-blue-500 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t("Processing {name}", { name: fileName || t("Words").toLowerCase() })}</h3>
                  <div className="max-w-md mx-auto mt-6">
                    <div className="h-2 bg-accent rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-blue-500 to-purple-500" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{t("{progress}% complete", { progress })}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {state === "mapping" && (
            <motion.div key="mapping" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card>
                <h3 className="text-xl font-semibold mb-6">{t("Map Your Columns")}</h3>
                <p className="text-muted-foreground mb-6">{t("Match your file columns to WordFlow fields")}</p>
                <div className="space-y-4">
                  {columns.map((col, index) => (
                    <motion.div key={col} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 p-4 bg-accent/30 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{col}</div>
                        <div className="text-sm text-muted-foreground">{t("From your file")}</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground hidden md:block" />
                      <select
                        value={mappings[index]?.system || "skip"}
                        onChange={(event) => setMappings((value) => value.map((item, itemIndex) => itemIndex === index ? { ...item, system: event.target.value } : item))}
                        className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="english">{t("English Word")}</option>
                        <option value="translation">{t("Translation")}</option>
                        <option value="example">{t("Example")}</option>
                        <option value="category">{t("Category")}</option>
                        <option value="level">{t("Level")}</option>
                        <option value="alternatives">{t("Alternative Answers")}</option>
                        <option value="skip">{t("Skip")}</option>
                      </select>
                    </motion.div>
                  ))}
                </div>
                <div className="flex gap-3 mt-8">
                  <Button variant="outline" onClick={reset} className="flex-1">{t("Cancel")}</Button>
                  <Button onClick={buildPreview} className="flex-1">{t("Preview Data")}</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {state === "preview" && (
            <motion.div key="preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card>
                <h3 className="text-xl font-semibold mb-6">{t("Preview Import")}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">{t("English")}</th>
                        <th className="text-left py-3 px-4 font-medium">{t("Translation")}</th>
                        <th className="text-left py-3 px-4 font-medium">{t("Example")}</th>
                        <th className="text-left py-3 px-4 font-medium">{t("Category")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 8).map((row, index) => (
                        <motion.tr key={`${row.english}-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} className="border-b border-border hover:bg-accent/30">
                          <td className="py-3 px-4">{clean(row.english)}</td>
                          <td className="py-3 px-4">{clean(row.turkish)}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{clean(row.example)}</td>
                          <td className="py-3 px-4"><span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-sm">{clean(row.category) || t("General")}</span></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-3 mt-8">
                  <Button variant="outline" onClick={() => setState("mapping")} className="flex-1">{t("Back")}</Button>
                  <Button onClick={importPreview} className="flex-1">{t("Import {count} Words", { count: previewData.length })}</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {state === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Card className="text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
                  <Check className="w-10 h-10 text-green-500" />
                </motion.div>
                <h3 className="text-2xl font-semibold mb-2">{t("Import Successful!")}</h3>
                <p className="text-muted-foreground mb-8">{t("{count} words have been added to your library", { count: previewData.length })}</p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={reset}>{t("Upload Another")}</Button>
                  <Button onClick={() => navigate("/words")}>{t("View My Words")}</Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FlashcardsPage({ words, recordAnswer, navigate }) {
  const { t, language } = useI18n();
  const [deck, setDeck] = useState(() => studyPool(words).slice(0, Math.min(12, words.length)));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [stats, setStats] = useState({ correct: 0, difficult: 0, skipped: 0 });
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    setDeck(studyPool(words).slice(0, Math.min(12, words.length)));
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
    setStats({ correct: 0, difficult: 0, skipped: 0 });
    setAttempts([]);
  }, [words.length]);

  if (!deck.length) {
    return <div className="h-full overflow-auto flex items-center justify-center p-6"><div className="max-w-2xl w-full"><EmptyState title={t("No flashcards yet")} text={t("Upload or add words to start studying.")} action={<Button onClick={() => navigate("/upload")}>{t("Upload Words")}</Button>} /></div></div>;
  }

  const currentWord = deck[currentIndex];
  const progress = ((currentIndex + 1) / deck.length) * 100;

  function handleAction(action) {
    const mapped = action === "correct" ? "know" : action === "difficult" ? "difficult" : "repeat";
    recordAnswer(currentWord.id, mapped, "flashcards");
    setAttempts((value) => [...value, { wordId: currentWord.id, action: mapped }]);
    setStats((value) => ({
      ...value,
      correct: value.correct + (action === "correct" ? 1 : 0),
      difficult: value.difficult + (action === "difficult" ? 1 : 0),
      skipped: value.skipped + (action === "skip" ? 1 : 0),
    }));
    if (currentIndex < deck.length - 1) {
      setIsFlipped(false);
      window.setTimeout(() => setCurrentIndex((value) => value + 1), 260);
    } else {
      setSessionComplete(true);
    }
  }

  if (sessionComplete) {
    const summary = sessionSummaryFor(deck, attempts);
    const metrics = [
      { label: t("Mastered"), value: stats.correct, text: t("known cards"), icon: Check, className: "text-green-500" },
      { label: t("Need Review"), value: stats.difficult, text: t("marked hard"), icon: AlertCircle, className: "text-orange-500" },
      { label: t("Skipped"), value: stats.skipped, text: t("repeat later"), icon: ArrowRight, className: "text-blue-500" },
      { label: t("Repeat List"), value: summary.reviewWords.length, text: t("next focus"), icon: RotateCcw, className: "text-violet-500" },
    ];

    function restartSession() {
      setDeck(studyPool(words).slice(0, Math.min(12, words.length)));
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionComplete(false);
      setStats({ correct: 0, difficult: 0, skipped: 0 });
      setAttempts([]);
    }

    return (
      <SessionSummaryPanel
        title={t("Flashcard Session Complete")}
        subtitle={t("Here are the words that felt easy, the ones that need another pass, and a focused repeat list.")}
        icon={Check}
        accent="green"
        metrics={metrics}
        summary={summary}
        retryLabel={t("Study Again")}
        onRetry={restartSession}
        onDashboard={() => navigate("/")}
      />
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{t("Flashcard Study")}</h1>
            <p className="text-muted-foreground">{t("Card {current} of {total}", { current: currentIndex + 1, total: deck.length })}</p>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")}><X className="w-5 h-5" /></Button>
        </motion.div>
        <div className="h-2 bg-accent rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} className="h-full bg-gradient-to-r from-blue-500 to-purple-500" /></div>

        <div className="relative wf-flip-scene">
          <AnimatePresence mode="wait">
            <motion.div key={currentWord.id} initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: -90, opacity: 0 }} transition={{ duration: 0.4 }} className="wf-flip-card">
              <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6, type: "spring" }} className="relative cursor-pointer wf-flip-card" onClick={() => setIsFlipped(!isFlipped)}>
                <div className="relative wf-flip-face">
                  <Card className="min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                    <div className="text-sm text-muted-foreground mb-4 uppercase tracking-wider">{t("English Word")}</div>
                    <h2 className="text-5xl font-semibold mb-6">{currentWord.english}</h2>
                    <PronounceButton word={currentWord.english} className="mb-6" />
                    <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">{currentWord.category || levelLabel(currentWord.level, language)}</div>
                    <p className="text-muted-foreground mt-8 text-sm">{t("Click to reveal translation")}</p>
                  </Card>
                </div>
                <div className="absolute inset-0 wf-flip-face wf-flip-back">
                  <Card className="min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                    <div className="text-sm text-muted-foreground mb-4 uppercase tracking-wider">{t("Translation")}</div>
                    <h2 className="text-4xl font-semibold mb-8">{currentWord.turkish}</h2>
                    <div className="space-y-4 text-left max-w-md">
                      {currentWord.example && <div><div className="text-sm text-muted-foreground mb-1">{t("Example")}:</div><p className="italic">{currentWord.example}</p></div>}
                      {currentWord.alternatives?.length ? <div><div className="text-sm text-muted-foreground mb-1">{t("Alternative Answers")}:</div><p>{acceptedAnswers(currentWord).join(", ")}</p></div> : null}
                      <div><div className="text-sm text-muted-foreground mb-1">{t("Level")}:</div><span className="inline-block px-3 py-1 rounded-full text-sm bg-blue-500/10 text-blue-500">{levelLabel(currentWord.level, language)}</span></div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-3 gap-4">
          <Button variant="outline" size="lg" onClick={() => handleAction("skip")} className="flex-col h-auto py-6 hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-500"><ArrowRight className="w-6 h-6 mb-2" /><span>{t("Skip")}</span></Button>
          <Button variant="outline" size="lg" onClick={() => handleAction("difficult")} className="flex-col h-auto py-6 hover:bg-orange-500/10 hover:border-orange-500 hover:text-orange-500"><BookmarkMinus className="w-6 h-6 mb-2" /><span>{t("Review Later")}</span></Button>
          <Button size="lg" onClick={() => handleAction("correct")} className="flex-col h-auto py-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white"><Check className="w-6 h-6 mb-2" /><span>{t("I Know This")}</span></Button>
        </motion.div>
      </div>
    </div>
  );
}

function QuizPage({ words, recordAnswer, navigate }) {
  const { t } = useI18n();
  const [questions, setQuestions] = useState(() => buildQuiz(words));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [missedAnswers, setMissedAnswers] = useState([]);

  useEffect(() => {
    setQuestions(buildQuiz(words));
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizComplete(false);
    setMissedAnswers([]);
  }, [words.length]);

  if (words.length < 4) {
    return <div className="h-full overflow-auto flex items-center justify-center p-6"><div className="max-w-2xl w-full"><EmptyState title={t("Quiz needs at least 4 words")} text={t("Add more vocabulary to generate multiple choice questions.")} action={<Button onClick={() => navigate("/upload")}>{t("Upload Words")}</Button>} /></div></div>;
  }

  if (!questions.length) return <div className="h-full flex items-center justify-center"><div className="animate-pulse">{t("Loading quiz...")}</div></div>;

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="h-full overflow-auto flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full">
          <Card className="text-center">
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", delay: 0.2 }} className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${percentage >= 80 ? "bg-gradient-to-br from-green-500 to-emerald-500" : percentage >= 60 ? "bg-gradient-to-br from-yellow-500 to-orange-500" : "bg-gradient-to-br from-red-500 to-pink-500"}`}>
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-3xl font-semibold mb-2">{t("Quiz Complete!")}</h2>
            <p className="text-muted-foreground mb-8">{percentage >= 80 ? t("Excellent work!") : percentage >= 60 ? t("Good effort!") : t("Keep practicing!")}</p>
            <div className="max-w-md mx-auto mb-8">
              <div className="flex items-center justify-between mb-4"><span className="text-muted-foreground">{t("Your Score")}</span><span className="text-2xl font-semibold">{score}/{questions.length}</span></div>
              <div className="h-4 bg-accent rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ delay: 0.5, duration: 1 }} className={`h-full ${percentage >= 80 ? "bg-gradient-to-r from-green-500 to-emerald-500" : percentage >= 60 ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-gradient-to-r from-red-500 to-pink-500"}`} /></div>
              <div className="text-right mt-2"><span className="text-3xl font-semibold">{percentage}%</span></div>
            </div>
            {missedAnswers.length ? (
              <div className="mb-8 text-left">
                <h3 className="mb-3 font-semibold">{t("Wrong Answers to Review")}</h3>
                <div className="space-y-2">
                  {missedAnswers.map((missed) => {
                    const missedWord = words.find((item) => item.id === missed.wordId);
                    if (!missedWord) return null;
                    return (
                      <div key={`${missed.wordId}-${missed.selectedAnswer}`} className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-medium">{missedWord.english}</div>
                            <div className="text-sm text-muted-foreground">{t("Your answer")}: {missed.selectedAnswer || t("No answer")} · {t("Correct")}: {missed.correctAnswer}</div>
                          </div>
                          <PronounceButton word={missedWord.english} label="" className="shrink-0 px-2 py-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mb-8 rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-green-700 dark:text-green-400">{t("No wrong answers this round.")}</div>
            )}
            <div className="flex gap-3"><Button variant="outline" onClick={() => { setQuestions(buildQuiz(words)); setCurrentQuestion(0); setSelectedAnswer(null); setIsAnswered(false); setScore(0); setQuizComplete(false); setMissedAnswers([]); }} className="flex-1"><RotateCcw className="w-4 h-4" />{t("Try Again")}</Button><Button onClick={() => navigate("/")} className="flex-1">{t("Back to Dashboard")}</Button></div>
          </Card>
        </motion.div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const word = words.find((item) => item.id === question.wordId) || words[0];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  function handleAnswer(answer) {
    if (isAnswered) return;
    const ok = answer === question.correctAnswer;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    setScore((value) => value + (ok ? 1 : 0));
    if (!ok) {
      setMissedAnswers((value) => [...value, { wordId: word.id, selectedAnswer: answer, correctAnswer: question.correctAnswer }]);
    }
    recordAnswer(word.id, ok ? "correct" : "incorrect", "quiz");
  }

  function handleNext() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((value) => value + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizComplete(true);
    }
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div><h1 className="text-2xl font-semibold">{t("Vocabulary Quiz")}</h1><p className="text-muted-foreground">{t("Question {current} of {total}", { current: currentQuestion + 1, total: questions.length })}</p></div>
          <div className="flex items-center gap-4"><div className="text-right"><div className="text-sm text-muted-foreground">{t("Score")}</div><div className="text-xl font-semibold">{score}/{currentQuestion + (isAnswered ? 1 : 0)}</div></div><Button variant="ghost" onClick={() => navigate("/")}><X className="w-5 h-5" /></Button></div>
        </motion.div>
        <div className="h-2 bg-accent rounded-full overflow-hidden"><motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} className="h-full bg-gradient-to-r from-purple-500 to-pink-500" /></div>

        <AnimatePresence mode="wait">
          <motion.div key={currentQuestion} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
            <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
              <div className="flex items-start gap-4 mb-8"><div className="p-3 bg-purple-500 rounded-lg"><Brain className="w-6 h-6 text-white" /></div><div className="flex-1"><h3 className="text-sm text-muted-foreground mb-2">{t("What is the translation of:")}</h3><div className="flex flex-wrap items-center gap-3"><h2 className="text-4xl font-semibold">{word.english}</h2><PronounceButton word={word.english} /></div>{word.example && <p className="text-muted-foreground mt-4 italic">&quot;{word.example}&quot;</p>}</div></div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option, index) => {
            const isCorrect = option === question.correctAnswer;
            const isSelected = option === selectedAnswer;
            let bgClass = "bg-card hover:bg-accent";
            let borderClass = "border-border";
            if (isAnswered) {
              if (isCorrect) { bgClass = "bg-green-500/10"; borderClass = "border-green-500"; }
              else if (isSelected) { bgClass = "bg-red-500/10"; borderClass = "border-red-500"; }
            }
            return (
              <motion.button key={`${option}-${index}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={!isAnswered ? { scale: 1.02 } : {}} whileTap={!isAnswered ? { scale: 0.98 } : {}} onClick={() => handleAnswer(option)} disabled={isAnswered} className={`p-6 rounded-lg border-2 text-left transition-all ${bgClass} ${borderClass} ${isAnswered ? "cursor-default" : "cursor-pointer"}`}>
                <div className="flex items-center justify-between"><span className="text-lg">{option}</span>{isAnswered && isCorrect && <Check className="w-6 h-6 text-green-500" />}{isAnswered && isSelected && !isCorrect && <X className="w-6 h-6 text-red-500" />}</div>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>{isAnswered && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><Button onClick={handleNext} size="lg" className="w-full">{currentQuestion < questions.length - 1 ? t("Next Question") : t("View Results")}</Button></motion.div>}</AnimatePresence>
      </div>
    </div>
  );
}

function ListeningPage({ words, recordAnswer, navigate }) {
  const { t } = useI18n();
  const [questions, setQuestions] = useState(() => buildQuiz(words));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [audioUnavailable, setAudioUnavailable] = useState(false);

  useEffect(() => {
    setQuestions(buildQuiz(words));
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setSessionComplete(false);
    setAttempts([]);
    setHasPlayed(false);
    setAudioUnavailable(false);
  }, [words.length]);

  if (words.length < 4) {
    return <div className="h-full overflow-auto flex items-center justify-center p-6"><div className="max-w-2xl w-full"><EmptyState title={t("Listening needs at least 4 words")} text={t("Add more vocabulary to generate listening choices.")} action={<Button onClick={() => navigate("/upload")}>{t("Upload Words")}</Button>} /></div></div>;
  }

  if (!questions.length) return <div className="h-full flex items-center justify-center"><div className="animate-pulse">{t("Loading listening practice...")}</div></div>;

  const question = questions[currentQuestion];
  const word = words.find((item) => item.id === question.wordId) || words[0];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = currentQuestion + (isAnswered ? 1 : 0);

  function playWord() {
    setHasPlayed(true);
    const ok = speakWord(word.english);
    setAudioUnavailable(!ok);
  }

  function handleAnswer(answer) {
    if (isAnswered) return;
    const ok = answer === question.correctAnswer;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    setScore((value) => value + (ok ? 1 : 0));
    setAttempts((value) => [...value, { wordId: word.id, action: ok ? "correct" : "incorrect", answer }]);
    recordAnswer(word.id, ok ? "correct" : "incorrect", "listening");
  }

  function handleNext() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((value) => value + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setHasPlayed(false);
      setAudioUnavailable(false);
    } else {
      setSessionComplete(true);
    }
  }

  function restartSession() {
    setQuestions(buildQuiz(words));
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setSessionComplete(false);
    setAttempts([]);
    setHasPlayed(false);
    setAudioUnavailable(false);
  }

  if (sessionComplete) {
    const total = questions.length;
    const incorrect = total - score;
    const accuracy = total ? Math.round((score / total) * 100) : 0;
    const summary = sessionSummaryFor(words, attempts);
    const metrics = [
      { label: t("Correct"), value: score, text: t("heard right"), icon: Check, className: "text-green-500" },
      { label: t("Incorrect"), value: incorrect, text: t("needs repeat"), icon: X, className: "text-red-500" },
      { label: t("Accuracy"), value: `${accuracy}%`, text: t("this session"), icon: TrendingUp, className: "text-cyan-500" },
      { label: t("Repeat List"), value: summary.reviewWords.length, text: t("next focus"), icon: RotateCcw, className: "text-violet-500" },
    ];

    return (
      <SessionSummaryPanel
        title={t("Listening Practice Complete")}
        subtitle={t("Your listening choices are summarized with the words that need another pass.")}
        icon={Headphones}
        accent="blue"
        metrics={metrics}
        summary={summary}
        retryLabel={t("Listen Again")}
        onRetry={restartSession}
        onDashboard={() => navigate("/")}
      />
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{t("Listening Practice")}</h1>
            <p className="text-muted-foreground">{t("Question {current} of {total}", { current: currentQuestion + 1, total: questions.length })}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">{t("Score")}</div>
              <div className="text-xl font-semibold">{score}/{answeredCount}</div>
            </div>
            <Button variant="ghost" onClick={() => navigate("/")}><X className="w-5 h-5" /></Button>
          </div>
        </motion.div>
        <div className="h-2 bg-accent rounded-full overflow-hidden"><motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} className="h-full bg-gradient-to-r from-cyan-500 to-teal-500" /></div>

        <AnimatePresence mode="wait">
          <motion.div key={currentQuestion} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.3 }}>
            <Card className="p-8 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-cyan-500 rounded-lg">
                    <Headphones className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-2">{t("Listen and choose the Turkish meaning")}</h3>
                    <div className="text-3xl font-semibold">{isAnswered ? word.english : t("Hidden word")}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{isAnswered ? t("Correct meaning: {answer}", { answer: question.correctAnswer }) : t("The English word stays hidden until you answer.")}</p>
                  </div>
                </div>
                <Button onClick={playWord} size="lg" className="shrink-0 bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:opacity-90">
                  <Volume2 className="w-5 h-5" />
                  {hasPlayed ? t("Replay") : t("Play Word")}
                </Button>
              </div>
              {audioUnavailable && (
                <div className="mt-5 rounded-lg border border-orange-500/20 bg-orange-500/10 p-3 text-sm text-orange-700 dark:text-orange-300">
                  {t("Audio is not available in this browser, but you can still answer the choices.")}
                </div>
              )}
              {isAnswered && word.example && <p className="mt-5 text-sm italic text-muted-foreground">&quot;{word.example}&quot;</p>}
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option, index) => {
            const isCorrect = option === question.correctAnswer;
            const isSelected = option === selectedAnswer;
            let bgClass = "bg-card hover:bg-accent";
            let borderClass = "border-border";
            if (isAnswered) {
              if (isCorrect) { bgClass = "bg-green-500/10"; borderClass = "border-green-500"; }
              else if (isSelected) { bgClass = "bg-red-500/10"; borderClass = "border-red-500"; }
            }
            return (
              <motion.button key={`${option}-${index}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} whileHover={!isAnswered ? { scale: 1.02 } : {}} whileTap={!isAnswered ? { scale: 0.98 } : {}} onClick={() => handleAnswer(option)} disabled={isAnswered} className={`p-5 rounded-lg border-2 text-left transition-all ${bgClass} ${borderClass} ${isAnswered ? "cursor-default" : "cursor-pointer"}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-lg">{option}</span>
                  {isAnswered && isCorrect && <Check className="w-6 h-6 shrink-0 text-green-500" />}
                  {isAnswered && isSelected && !isCorrect && <X className="w-6 h-6 shrink-0 text-red-500" />}
                </div>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {isAnswered && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Button onClick={handleNext} size="lg" className="w-full">{currentQuestion < questions.length - 1 ? t("Next Question") : t("View Results")}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function WritingPage({
  words,
  recordAnswer,
  navigate,
  mode = "writing",
  title = "Writing Practice",
  emptyTitle = "Writing practice needs words",
  emptyText = "Upload or add words to practice typed answers.",
  summaryTitle = "Writing Practice Complete",
  summarySubtitle = "Typed answers are summarized with the words that caused mistakes or needed hints.",
  retryLabel = "Practice Again",
}) {
  const { t } = useI18n();
  const [session, setSession] = useState(() => studyPool(words).slice(0, Math.min(10, words.length)));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, hints: 0 });
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    setSession(studyPool(words).slice(0, Math.min(10, words.length)));
    setCurrentIndex(0);
    setUserInput("");
    setIsChecked(false);
    setShowHint(false);
    setSessionComplete(false);
    setStats({ correct: 0, incorrect: 0, hints: 0 });
    setAttempts([]);
  }, [words.length, mode]);

  if (!words.length) {
    return <div className="h-full overflow-auto flex items-center justify-center p-6"><div className="max-w-2xl w-full"><EmptyState title={t(emptyTitle)} text={t(emptyText)} action={<Button onClick={() => navigate("/upload")}>{t("Upload Words")}</Button>} /></div></div>;
  }

  const currentWord = session[currentIndex] || words[0];
  const progress = ((currentIndex + 1) / session.length) * 100;
  const isCorrect = answerMatches(userInput, currentWord);
  const answers = acceptedAnswers(currentWord);
  const hint = currentWord.english.substring(0, Math.ceil(currentWord.english.length / 2)) + "...";

  function checkAnswer() {
    if (!userInput.trim() || isChecked) return;
    setIsChecked(true);
    setAttempts((value) => [...value, { wordId: currentWord.id, action: isCorrect ? "correct" : "incorrect", answer: userInput, hinted: showHint }]);
    setStats((value) => ({ ...value, correct: value.correct + (isCorrect ? 1 : 0), incorrect: value.incorrect + (isCorrect ? 0 : 1) }));
    recordAnswer(currentWord.id, isCorrect ? "correct" : "incorrect", mode);
  }

  function handleNext() {
    if (currentIndex < session.length - 1) {
      setCurrentIndex((value) => value + 1);
      setUserInput("");
      setIsChecked(false);
      setShowHint(false);
    } else {
      setSessionComplete(true);
    }
  }

  if (sessionComplete) {
    const total = stats.correct + stats.incorrect;
    const accuracy = total ? Math.round((stats.correct / total) * 100) : 0;
    const summary = sessionSummaryFor(session, attempts);
    const metrics = [
      { label: t("Correct"), value: stats.correct, text: t("typed right"), icon: Check, className: "text-green-500" },
      { label: t("Incorrect"), value: stats.incorrect, text: t("needs repeat"), icon: X, className: "text-red-500" },
      { label: t("Hints"), value: stats.hints, text: t("used today"), icon: Lightbulb, className: "text-yellow-500" },
      { label: t("Accuracy"), value: `${accuracy}%`, text: t("this session"), icon: TrendingUp, className: "text-violet-500" },
    ];

    function restartSession() {
      setSession(studyPool(words).slice(0, Math.min(10, words.length)));
      setCurrentIndex(0);
      setUserInput("");
      setIsChecked(false);
      setShowHint(false);
      setSessionComplete(false);
      setStats({ correct: 0, incorrect: 0, hints: 0 });
      setAttempts([]);
    }

    return (
      <SessionSummaryPanel
        title={t(summaryTitle)}
        subtitle={t(summarySubtitle)}
        icon={Award}
        accent="purple"
        metrics={metrics}
        summary={summary}
        retryLabel={t(retryLabel)}
        onRetry={restartSession}
        onDashboard={() => navigate("/")}
      />
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold">{t(title)}</h1><p className="text-muted-foreground">{t("Word {current} of {total}", { current: currentIndex + 1, total: session.length })}</p></div><Button variant="ghost" onClick={() => navigate("/")}><X className="w-5 h-5" /></Button></motion.div>
        <div className="h-2 bg-accent rounded-full overflow-hidden"><motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} className="h-full bg-gradient-to-r from-purple-500 to-pink-500" /></div>
        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
              <div className="flex items-start gap-4 mb-6"><div className="p-3 bg-purple-500 rounded-lg"><PenTool className="w-6 h-6 text-white" /></div><div className="flex-1"><h3 className="text-sm text-muted-foreground mb-2">{t("Write the English word for:")}</h3><div className="mb-4 flex flex-wrap items-center gap-3"><h2 className="text-4xl font-semibold">{currentWord.turkish}</h2><PronounceButton word={currentWord.english} /></div>{currentWord.example && <p className="text-muted-foreground italic">&quot;{currentWord.example}&quot;</p>}</div></div>
              <AnimatePresence>{showHint && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-3"><Lightbulb className="w-5 h-5 text-yellow-500" /><div><div className="text-sm font-medium text-yellow-700 dark:text-yellow-500">{t("Hint")}</div><div className="text-sm">{hint}</div></div></motion.div>}</AnimatePresence>
            </Card>
          </motion.div>
        </AnimatePresence>
        <Card>
          <div className="space-y-4">
            <label className="block"><span className="text-sm text-muted-foreground mb-2 block">{t("Your Answer")}</span><input type="text" value={userInput} onChange={(event) => setUserInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && userInput.trim() && !isChecked) checkAnswer(); }} disabled={isChecked} placeholder={t("Type the English word...")} className={`w-full px-4 py-3 rounded-lg border-2 bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary ${isChecked ? isCorrect ? "border-green-500 bg-green-500/5" : "border-red-500 bg-red-500/5" : "border-border"}`} /></label>
            <AnimatePresence>{isChecked && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`p-4 rounded-lg flex items-center gap-3 ${isCorrect ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>{isCorrect ? <><div className="p-2 bg-green-500 rounded-lg"><Check className="w-5 h-5 text-white" /></div><div className="flex-1"><div className="font-medium text-green-700 dark:text-green-500">{t("Correct!")}</div><div className="text-sm text-muted-foreground">{t("Accepted answer")}: <span className="font-semibold">{answers.join(", ")}</span></div></div></> : <><div className="p-2 bg-red-500 rounded-lg"><X className="w-5 h-5 text-white" /></div><div className="flex-1"><div className="font-medium text-red-700 dark:text-red-500">{t("Incorrect")}</div><div className="text-sm text-muted-foreground">{t("Accepted answers")}: <span className="font-semibold">{answers.join(", ")}</span></div></div></>}</motion.div>}</AnimatePresence>
            <div className="flex gap-3">{!isChecked ? <><Button variant="outline" onClick={() => { setShowHint(true); setStats((value) => ({ ...value, hints: value.hints + (showHint ? 0 : 1) })); }} disabled={showHint} className="flex-1"><Lightbulb className="w-4 h-4" />{showHint ? t("Hint Shown") : t("Show Hint")}</Button><Button onClick={checkAnswer} disabled={!userInput.trim()} className="flex-1">{t("Check Answer")}</Button></> : <Button onClick={handleNext} className="w-full">{currentIndex < session.length - 1 ? t("Next Word") : t("Complete Session")}</Button>}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function WeakDrillPage({ words, recordAnswer, navigate }) {
  const { t } = useI18n();
  const weakWords = useMemo(() => weakWordPool(words, 10), [words]);

  if (!words.length) {
    return <div className="h-full overflow-auto flex items-center justify-center p-6"><div className="max-w-2xl w-full"><EmptyState title={t("Weak drill needs words")} text={t("Add vocabulary first, then WordFlow can find the hardest words for you.")} action={<Button onClick={() => navigate("/upload")}>{t("Upload Words")}</Button>} /></div></div>;
  }

  if (!weakWords.length) {
    return (
      <div className="h-full overflow-auto flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <EmptyState
            title={t("No weak words yet")}
            text={t("Miss a few words in quiz, writing, reviews, or flashcards and they will appear here automatically.")}
            action={<Button onClick={() => navigate("/quiz")}>{t("Take a Quiz")}</Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <WritingPage
      words={weakWords}
      recordAnswer={recordAnswer}
      navigate={navigate}
      mode="weak-drill"
      title="Weak Word Drill"
      summaryTitle="Weak Drill Complete"
      summarySubtitle="This focused drill used your most missed words and updated their next review timing."
      retryLabel="Drill Again"
    />
  );
}

function WordsPage({ words, setWords, autoOpenAdd = false, onAutoOpenAddHandled }) {
  const { t, language } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [showDifficult, setShowDifficult] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalMode, setModalMode] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [selectedWordId, setSelectedWordId] = useState(null);
  const [form, setForm] = useState({ english: "", turkish: "", alternatives: "", example: "", category: "", level: "A1" });
  const categories = useMemo(() => [...new Set(words.map((word) => word.category).filter(Boolean))].sort(), [words]);
  const selectedWord = useMemo(() => words.find((word) => word.id === selectedWordId) || null, [words, selectedWordId]);

  const filteredWords = useMemo(() => words.filter((word) => {
    const query = textKey(searchQuery);
    const matchesSearch = !query || textKey(`${word.english} ${word.turkish} ${word.example}`).includes(query);
    const matchesCategory = filterCategory === "all" || word.category === filterCategory;
    const matchesLevel = filterLevel === "all" || word.level === filterLevel;
    const matchesDifficult = !showDifficult || isDifficult(word);
    return matchesSearch && matchesCategory && matchesLevel && matchesDifficult;
  }), [words, searchQuery, filterCategory, filterLevel, showDifficult]);
  const pagination = useMemo(() => paginateItems(filteredWords, currentPage, WORDS_PAGE_SIZE), [filteredWords, currentPage]);
  const paginatedWords = pagination.items;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterLevel, showDifficult]);

  useEffect(() => {
    if (currentPage !== pagination.currentPage) setCurrentPage(pagination.currentPage);
  }, [currentPage, pagination.currentPage]);

  function openAdd() {
    setForm({ english: "", turkish: "", alternatives: "", example: "", category: categories[0] || "", level: "A1" });
    setModalMode("add");
  }

  useEffect(() => {
    if (!autoOpenAdd) return;
    openAdd();
    onAutoOpenAddHandled?.();
  }, [autoOpenAdd]);

  function openEdit(word) {
    setForm({ id: word.id, english: word.english, turkish: word.turkish, alternatives: (word.alternatives || []).join(", "), example: word.example, category: word.category, level: word.level });
    setModalMode("edit");
  }

  function saveWord(event) {
    event.preventDefault();
    if (!clean(form.english) || !clean(form.turkish)) return;
    if (modalMode === "edit") {
      setWords((current) => current.map((word) => word.id === form.id ? normalizeWord({ ...word, ...form }) : word));
    } else {
      setWords((current) => [createWord(form), ...current]);
    }
    setModalMode(null);
  }

  function deleteWord(word) {
    setPendingDelete(word);
  }

  function confirmDeleteWord() {
    if (!pendingDelete) return;
    setWords((current) => current.filter((item) => item.id !== pendingDelete.id));
    if (selectedWordId === pendingDelete.id) setSelectedWordId(null);
    setPendingDelete(null);
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"><div><h1 className="text-3xl font-semibold mb-2">{t("My Words")}</h1><p className="text-muted-foreground">{t("Manage your vocabulary library")}</p></div><Button onClick={openAdd}><Plus className="w-4 h-4" />{t("Add Word")}</Button></motion.div>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><input type="text" placeholder={t("Search words...")} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" /></div></div>
            <select value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)} className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"><option value="all">{t("All Categories")}</option>{categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select>
            <select value={filterLevel} onChange={(event) => setFilterLevel(event.target.value)} className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"><option value="all">{t("All Levels")}</option>{LEVELS.map((level) => <option key={level} value={level}>{levelLabel(level, language)}</option>)}</select>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button onClick={() => setShowDifficult(!showDifficult)} className={`px-4 py-2 rounded-lg transition-colors ${showDifficult ? "bg-orange-500 text-white" : "bg-accent text-foreground hover:bg-accent/80"}`}><BookmarkMinus className="w-4 h-4 inline mr-2" />{t("Difficult Words Only")}</button>
            <div className="text-sm text-muted-foreground">
              {filteredWords.length
                ? t("Showing {start}-{end} of {total} words", { start: pagination.displayStart, end: pagination.displayEnd, total: pagination.totalItems })
                : t("{count} words found", { count: 0 })}
            </div>
          </div>
        </Card>

        <Card className="w-full max-w-full overflow-hidden">
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-max min-w-[920px]">
              <thead><tr className="border-b border-border"><th className="text-left py-4 px-4 font-medium">{t("English")}</th><th className="text-left py-4 px-4 font-medium">{t("Translation")}</th><th className="text-left py-4 px-4 font-medium hidden lg:table-cell">{t("Example")}</th><th className="text-left py-4 px-4 font-medium">{t("Category")}</th><th className="text-left py-4 px-4 font-medium">{t("Level")}</th><th className="text-left py-4 px-4 font-medium">{t("Status")}</th><th className="text-left py-4 px-4 font-medium">{t("Actions")}</th></tr></thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {paginatedWords.map((word, index) => (
                    <motion.tr
                      key={word.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => setSelectedWordId(word.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedWordId(word.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={language === "tr" ? `${word.english} detayını aç` : `Open details for ${word.english}`}
                      className="cursor-pointer border-b border-border hover:bg-accent/30 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium">
                        <div className="flex items-center gap-2">
                          <span>{word.english}</span>
                          <PronounceButton word={word.english} label="" className="px-2 py-1" />
                        </div>
                        {word.alternatives?.length ? <div className="mt-1 text-xs text-muted-foreground">{t("Also")}: {word.alternatives.join(", ")}</div> : null}
                      </td>
                      <td className="py-4 px-4">{word.turkish}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground hidden lg:table-cell max-w-xs truncate">{word.example}</td>
                      <td className="py-4 px-4"><span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs whitespace-nowrap">{word.category || t("General")}</span></td>
                      <td className="py-4 px-4"><span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${word.level === "C1" ? "bg-red-500/10 text-red-500" : ["B1", "B2"].includes(word.level) ? "bg-yellow-500/10 text-yellow-500" : "bg-green-500/10 text-green-500"}`}>{levelLabel(word.level, language)}</span></td>
                      <td className="py-4 px-4"><div className="flex flex-col gap-1">{isKnown(word) && <span className="flex items-center gap-1 text-xs text-green-500"><Check className="w-3 h-3" />{t("Learned")}</span>}{isDifficult(word) && <span className="flex items-center gap-1 text-xs text-orange-500"><BookmarkMinus className="w-3 h-3" />{t("Review")}</span>}{!isKnown(word) && !isDifficult(word) && <span className="text-xs text-muted-foreground">{statusLabel(word.status, language)}</span>}</div></td>
                      <td className="py-4 px-4"><div className="flex gap-2"><motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(event) => { event.stopPropagation(); openEdit(word); }} className="p-2 hover:bg-accent rounded-lg transition-colors" aria-label={t("Edit word")}><Edit2 className="w-4 h-4 text-muted-foreground" /></motion.button><motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(event) => { event.stopPropagation(); deleteWord(word); }} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors" aria-label={t("Delete word")}><Trash2 className="w-4 h-4 text-destructive" /></motion.button></div></td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filteredWords.length === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12"><div className="text-muted-foreground mb-2">{t("No words found")}</div><p className="text-sm text-muted-foreground">{t("Try adjusting your filters")}</p></motion.div>}
          <PaginationControls pagination={pagination} onPageChange={setCurrentPage} />
        </Card>

        <AnimatePresence>
          {modalMode && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setModalMode(null)}>
              <motion.form initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(event) => event.stopPropagation()} onSubmit={saveWord} className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full">
                <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-semibold">{modalMode === "edit" ? t("Edit Word") : t("Add New Word")}</h3><button type="button" onClick={() => setModalMode(null)} className="p-2 hover:bg-accent rounded-lg transition-colors"><X className="w-5 h-5" /></button></div>
                <div className="space-y-4">
                  <div><label htmlFor="word-english" className="block text-sm font-medium mb-2">{t("English Word")}</label><input id="word-english" value={form.english} onChange={(event) => setForm({ ...form, english: event.target.value })} type="text" placeholder={t("Enter English word")} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
                  <div><label htmlFor="word-translation" className="block text-sm font-medium mb-2">{t("Translation")}</label><input id="word-translation" value={form.turkish} onChange={(event) => setForm({ ...form, turkish: event.target.value })} type="text" placeholder={t("Enter translation")} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
                  <div><label htmlFor="word-alternatives" className="block text-sm font-medium mb-2">{t("Alternative Answers")}</label><input id="word-alternatives" value={form.alternatives} onChange={(event) => setForm({ ...form, alternatives: event.target.value })} type="text" placeholder={t("Optional: synonym, alternate spelling")} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" /><p className="mt-1 text-xs text-muted-foreground">{t("Separate multiple accepted answers with commas or semicolons.")}</p></div>
                  <div><label htmlFor="word-example" className="block text-sm font-medium mb-2">{t("Example Sentence")}</label><textarea id="word-example" value={form.example} onChange={(event) => setForm({ ...form, example: event.target.value })} placeholder={t("Enter example sentence")} rows={3} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none" /></div>
                  <div className="grid grid-cols-2 gap-4"><div><label htmlFor="word-category" className="block text-sm font-medium mb-2">{t("Category")}</label><input id="word-category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder={t("Category")} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" /></div><div><label htmlFor="word-level" className="block text-sm font-medium mb-2">{t("Level")}</label><select id="word-level" value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">{LEVELS.map((level) => <option key={level} value={level}>{levelLabel(level, language)}</option>)}</select></div></div>
                  <div className="flex gap-3 pt-4"><Button type="button" variant="outline" onClick={() => setModalMode(null)} className="flex-1">{t("Cancel")}</Button><Button type="submit" className="flex-1">{modalMode === "edit" ? t("Save Word") : t("Add Word")}</Button></div>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
        <ConfirmDialog
          open={Boolean(pendingDelete)}
          title={t("Delete word?")}
          text={pendingDelete ? t("\"{word}\" will be removed from your vocabulary and practice sessions.", { word: pendingDelete.english }) : ""}
          confirmLabel={t("Delete Word")}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDeleteWord}
        />
        <WordDetailModal word={selectedWord} onClose={() => setSelectedWordId(null)} />
      </div>
    </div>
  );
}

function LanguageSwitch({ language, onChange }) {
  const { t } = useI18n();
  const isEnglish = language === "en";

  return (
    <button
      type="button"
      onClick={() => onChange(isEnglish ? "tr" : "en")}
      className="flex w-full max-w-xs items-center rounded-lg border border-border bg-background p-1 text-sm font-medium shadow-sm sm:w-72"
      aria-label={t("Language")}
    >
      <span className={`flex-1 rounded-md px-3 py-2 text-center transition-colors ${!isEnglish ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
        Türkçe
      </span>
      <span className={`flex-1 rounded-md px-3 py-2 text-center transition-colors ${isEnglish ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
        English
      </span>
    </button>
  );
}

function SettingsPage({ state, setDarkMode, setLanguage, setDailyGoal, setWeeklyGoal, setNotifications, exportData, exportBackup, importBackup, resetProgress, clearWords }) {
  const { t } = useI18n();
  const stats = statsFor(state.words, state.daily);
  const backupInputRef = useRef(null);

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}><h1 className="text-3xl font-semibold mb-2">{t("Settings")}</h1><p className="text-muted-foreground">{t("Manage your preferences and data")}</p></motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card><h3 className="text-xl font-semibold mb-6">{t("Appearance")}</h3><div className="space-y-5"><div className="flex items-center justify-between gap-4"><div><div className="font-medium mb-1">{t("Theme")}</div><div className="text-sm text-muted-foreground">{t("Choose your preferred color theme")}</div></div><div className="flex gap-2"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setDarkMode(false)} className={`p-3 rounded-lg border-2 transition-colors ${!state.settings.darkMode ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}><Sun className="w-5 h-5" /></motion.button><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setDarkMode(true)} className={`p-3 rounded-lg border-2 transition-colors ${state.settings.darkMode ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}><Moon className="w-5 h-5" /></motion.button></div></div><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-medium mb-1">{t("Language")}</div><div className="text-sm text-muted-foreground">{t("Choose the app language")}</div></div><LanguageSwitch language={state.settings.language} onChange={setLanguage} /></div></div></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <h3 className="text-xl font-semibold mb-6">{t("Learning Preferences")}</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium mb-1">{t("Daily Goal")}</div>
                  <div className="text-sm text-muted-foreground">{t("Number of words to study each day")}</div>
                </div>
                <div className="flex items-center gap-4">
                  <input type="range" min="5" max="50" step="5" value={state.settings.dailyGoal} onChange={(event) => setDailyGoal(Number(event.target.value))} className="w-32" />
                  <div className="w-12 text-center font-semibold">{state.settings.dailyGoal}</div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium mb-1">{t("Weekly Goal")}</div>
                  <div className="text-sm text-muted-foreground">{t("Number of words to practice each week")}</div>
                </div>
                <div className="flex items-center gap-4">
                  <input type="range" min="25" max="300" step="25" value={state.settings.weeklyGoal} onChange={(event) => setWeeklyGoal(Number(event.target.value))} className="w-32" />
                  <div className="w-14 text-center font-semibold">{state.settings.weeklyGoal}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium mb-1">{t("Notifications")}</div>
                  <div className="text-sm text-muted-foreground">{t("Receive study reminders")}</div>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setNotifications(!state.settings.notifications)} className={`relative w-14 h-8 rounded-full transition-colors ${state.settings.notifications ? "bg-primary" : "bg-accent"}`}>
                  <motion.div animate={{ x: state.settings.notifications ? 24 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md" />
                </motion.button>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card><h3 className="text-xl font-semibold mb-6">{t("Data Management")}</h3><div className="space-y-3"><motion.button whileHover={{ x: 4 }} onClick={exportData} className="w-full flex items-center justify-between p-4 rounded-lg bg-accent hover:bg-accent/80 transition-colors"><div className="flex items-center gap-3"><div className="p-2 bg-blue-500/10 rounded-lg"><Download className="w-5 h-5 text-blue-500" /></div><div className="text-left"><div className="font-medium">{t("Export Data (Excel)")}</div><div className="text-sm text-muted-foreground">{t("Download your vocabulary as a spreadsheet")}</div></div></div></motion.button><motion.button whileHover={{ x: 4 }} onClick={exportBackup} className="w-full flex items-center justify-between p-4 rounded-lg bg-accent hover:bg-accent/80 transition-colors"><div className="flex items-center gap-3"><div className="p-2 bg-purple-500/10 rounded-lg"><Download className="w-5 h-5 text-purple-500" /></div><div className="text-left"><div className="font-medium">{t("Backup (JSON)")}</div><div className="text-sm text-muted-foreground">{t("Full backup including progress, restorable later")}</div></div></div></motion.button><input ref={backupInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => { importBackup(event.target.files?.[0]); event.target.value = ""; }} /><motion.button whileHover={{ x: 4 }} onClick={() => backupInputRef.current?.click()} className="w-full flex items-center justify-between p-4 rounded-lg bg-accent hover:bg-accent/80 transition-colors"><div className="flex items-center gap-3"><div className="p-2 bg-green-500/10 rounded-lg"><UploadIcon className="w-5 h-5 text-green-500" /></div><div className="text-left"><div className="font-medium">{t("Restore Backup")}</div><div className="text-sm text-muted-foreground">{t("Load words and progress from a backup file")}</div></div></div></motion.button><motion.button whileHover={{ x: 4 }} onClick={resetProgress} className="w-full flex items-center justify-between p-4 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors border border-destructive/20"><div className="flex items-center gap-3"><div className="p-2 bg-destructive/20 rounded-lg"><RotateCcw className="w-5 h-5 text-destructive" /></div><div className="text-left"><div className="font-medium text-destructive">{t("Reset Progress")}</div><div className="text-sm text-muted-foreground">{t("Clear learning data but keep words")}</div></div></div></motion.button><motion.button whileHover={{ x: 4 }} onClick={clearWords} className="w-full flex items-center justify-between p-4 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors border border-destructive/20"><div className="flex items-center gap-3"><div className="p-2 bg-destructive/20 rounded-lg"><Trash2 className="w-5 h-5 text-destructive" /></div><div className="text-left"><div className="font-medium text-destructive">{t("Clear Word List")}</div><div className="text-sm text-muted-foreground">{t("Remove vocabulary and progress")}</div></div></div></motion.button></div></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card><h3 className="text-xl font-semibold mb-6">{t("About")}</h3><div className="space-y-4 text-sm text-muted-foreground"><div className="flex justify-between"><span>{t("Version")}</span><span className="font-medium text-foreground">{APP_VERSION}</span></div><div className="flex justify-between"><span>{t("Total Words")}</span><span className="font-medium text-foreground">{stats.totalWords}</span></div><div className="flex justify-between"><span>{t("Difficult Words")}</span><span className="font-medium text-foreground">{stats.difficultWords}</span></div></div></Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState(loadState);
  const [path, setPath] = useState(currentPath);
  const [confirmation, setConfirmation] = useState(null);
  const [openAddWord, setOpenAddWord] = useState(false);
  const language = normalizeLanguage(state.settings.language);
  const t = useMemo(() => (key, params) => translate(language, key, params), [language]);
  const i18nValue = useMemo(() => ({ language, t }), [language, t]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.documentElement.classList.toggle("dark", state.settings.darkMode);
    document.documentElement.lang = language;
  }, [state, language]);

  useEffect(() => {
    const onPop = () => setPath(currentPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const remindedRef = useRef(false);
  useEffect(() => {
    if (remindedRef.current) return;
    remindedRef.current = true;
    if (typeof Notification === "undefined") return;
    if (!state.settings.notifications || Notification.permission !== "granted") return;
    const todayStats = statsFor(state.words, state.daily);
    if (state.words.length && todayStats.todayStudied < state.settings.dailyGoal) {
      try {
        new Notification("WordFlow", {
          body: t("You've studied {studied}/{goal} words today. Keep your streak going!", { studied: todayStats.todayStudied, goal: state.settings.dailyGoal }),
        });
      } catch {
        // Notifications may be blocked by the environment; ignore.
      }
    }
  }, []);

  function updateNotifications(enabled) {
    if (enabled && typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    setState((value) => ({ ...value, settings: { ...value.settings, notifications: enabled } }));
  }

  function navigate(nextPath) {
    if (nextPath === path) return;
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  }

  function startManualAdd() {
    setOpenAddWord(true);
    navigate("/words");
  }

  function setWords(updater) {
    setState((value) => {
      const nextWords = typeof updater === "function" ? updater(value.words) : updater;
      return { ...value, words: nextWords, mistakes: value.mistakes.filter((id) => nextWords.some((word) => word.id === id)) };
    });
  }

  function recordAnswer(id, action, mode = "") {
    setState((value) => {
      const day = todayKey();
      const daily = value.daily[day] || { correct: 0, wrong: 0, repeat: 0 };
      const correct = action === "know" || action === "correct";
      const wrong = action === "difficult" || action === "incorrect";
      const repeat = action === "repeat";
      return {
        ...value,
        words: value.words.map((word) => word.id === id ? updateWordProgress(word, action, new Date(), mode) : word),
        mistakes: wrong ? [...new Set([id, ...value.mistakes])] : value.mistakes,
        daily: {
          ...value.daily,
          [day]: {
            correct: (daily.correct || 0) + (correct ? 1 : 0),
            wrong: (daily.wrong || 0) + (wrong ? 1 : 0),
            repeat: (daily.repeat || 0) + (repeat ? 1 : 0),
          },
        },
      };
    });
  }

  function importWords(words) {
    setState((value) => ({ ...value, words: [...words, ...value.words] }));
  }

  async function exportData() {
    const XLSX = await loadXlsx();
    const wb = XLSX.utils.book_new();
    const rows = state.words.map((word) => ({
      English: word.english,
      Translation: word.turkish,
      AlternativeAnswers: (word.alternatives || []).join(", "),
      Example: word.example,
      Category: word.category,
      Level: word.level,
      Status: statusLabel(word.status),
      Correct: word.correct,
      Incorrect: word.wrong,
      Repeated: word.repeated,
      NextReview: word.nextReview,
      LastAnswered: word.lastAnswered,
      WrongModes: Object.entries(word.modeMistakes || {}).map(([mode, count]) => `${mode}: ${count}`).join(", "),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Words");
    XLSX.writeFile(wb, "wordflow-data.xlsx");
  }

  function exportBackup() {
    const blob = new Blob([serializeBackup(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wordflow-backup-${todayKey()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function importBackup(file) {
    if (!file) return;
    let restored;
    try {
      restored = restoreBackup(await file.text());
    } catch {
      setConfirmation({
        title: t("Invalid backup file"),
        text: t("This file could not be read as a WordFlow backup. Please choose a valid .json backup."),
        confirmLabel: t("OK"),
        onConfirm: () => {},
      });
      return;
    }
    setConfirmation({
      title: t("Restore backup?"),
      text: t("This replaces your current word list and all progress with the contents of the backup. This cannot be undone."),
      confirmLabel: t("Restore Backup"),
      onConfirm: () => setState(restored),
    });
  }

  function resetProgress() {
    setConfirmation({
      title: t("Reset progress?"),
      text: t("Your word list will stay in place, but all learning history, mistakes, review timing, and daily progress will be cleared."),
      confirmLabel: t("Reset Progress"),
      onConfirm: () => {
        setState((value) => ({
          ...value,
          daily: {},
          mistakes: [],
          words: value.words.map((word) => ({ ...word, status: "new", correct: 0, wrong: 0, repeated: 0, reviewInterval: 0, nextReview: todayKey(), lastAnswered: "", modeMistakes: {} })),
        }));
      },
    });
  }

  function clearWords() {
    setConfirmation({
      title: t("Clear word list?"),
      text: t("This removes every vocabulary item and all practice progress from this browser."),
      confirmLabel: t("Clear Words"),
      onConfirm: () => {
        setState((value) => ({ ...value, words: [], daily: {}, mistakes: [] }));
      },
    });
  }

  const stats = statsFor(state.words, state.daily);
  const page =
    path === "/reviews" ? <ReviewsPage words={state.words} recordAnswer={recordAnswer} navigate={navigate} /> :
    path === "/stats" ? <StatsPage words={state.words} daily={state.daily} dailyGoal={state.settings.dailyGoal} navigate={navigate} /> :
    path === "/upload" ? <UploadPage onImport={importWords} navigate={navigate} existingWords={state.words} /> :
    path === "/flashcards" ? <FlashcardsPage words={state.words} recordAnswer={recordAnswer} navigate={navigate} /> :
    path === "/listening" ? <ListeningPage words={state.words} recordAnswer={recordAnswer} navigate={navigate} /> :
    path === "/weak-drill" ? <WeakDrillPage words={state.words} recordAnswer={recordAnswer} navigate={navigate} /> :
    path === "/quiz" ? <QuizPage words={state.words} recordAnswer={recordAnswer} navigate={navigate} /> :
    path === "/writing" ? <WritingPage words={state.words} recordAnswer={recordAnswer} navigate={navigate} /> :
    path === "/words" ? <WordsPage words={state.words} setWords={setWords} autoOpenAdd={openAddWord} onAutoOpenAddHandled={() => setOpenAddWord(false)} /> :
    path === "/profile" ? <ProfilePage words={state.words} daily={state.daily} navigate={navigate} /> :
    path === "/settings" ? (
      <SettingsPage
        state={state}
        setDarkMode={(darkMode) => setState((value) => ({ ...value, settings: { ...value.settings, darkMode } }))}
        setLanguage={(nextLanguage) => setState((value) => ({ ...value, settings: { ...value.settings, language: normalizeLanguage(nextLanguage) } }))}
        setDailyGoal={(dailyGoal) => setState((value) => ({ ...value, settings: { ...value.settings, dailyGoal } }))}
        setWeeklyGoal={(weeklyGoal) => setState((value) => ({ ...value, settings: { ...value.settings, weeklyGoal } }))}
        setNotifications={updateNotifications}
        exportData={exportData}
        exportBackup={exportBackup}
        importBackup={importBackup}
        resetProgress={resetProgress}
        clearWords={clearWords}
      />
    ) :
    <Dashboard words={state.words} daily={state.daily} navigate={navigate} dailyGoal={state.settings.dailyGoal} weeklyGoal={state.settings.weeklyGoal} onAddWord={startManualAdd} />;

  return (
    <I18nContext.Provider value={i18nValue}>
      <Layout currentPath={path} onNavigate={navigate} stats={stats} dailyGoal={state.settings.dailyGoal}>
        {page}
      </Layout>
      <ConfirmDialog
        open={Boolean(confirmation)}
        title={confirmation?.title}
        text={confirmation?.text}
        confirmLabel={confirmation?.confirmLabel}
        onCancel={() => setConfirmation(null)}
        onConfirm={() => {
          confirmation?.onConfirm();
          setConfirmation(null);
        }}
      />
    </I18nContext.Provider>
  );
}
