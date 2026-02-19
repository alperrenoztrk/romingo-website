import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StatsBar from "../components/StatsBar";
import { Lock, Star, CheckCircle, Volume2, Sparkles } from "lucide-react";
import { lessonsData } from "../data/lessons";
import { lessonCatalog } from "../data/lessonCatalog";
import { getLessonProgress, isLessonUnlocked } from "../lib/lessonProgress";
import { getEconomySnapshot } from "@/lib/learningEconomy";

interface Lesson {
  id: string;
  title: string;
  emoji: string;
  status: "completed" | "current" | "locked";
  stars: number;
  superStar?: boolean;
  level: number;
}

const levelColors = ["gradient-success", "gradient-sky", "gradient-hero", "gradient-gold"];

interface TutorialWord {
  tr: string;
  ro: string;
}

const numberTutorialWords: TutorialWord[] = [
  { tr: "Bir", ro: "Unu" },
  { tr: "İki", ro: "Doi" },
  { tr: "Üç", ro: "Trei" },
  { tr: "Dört", ro: "Patru" },
  { tr: "Beş", ro: "Cinci" },
  { tr: "Altı", ro: "Șase" },
  { tr: "Yedi", ro: "Șapte" },
  { tr: "Sekiz", ro: "Opt" },
  { tr: "Dokuz", ro: "Nouă" },
  { tr: "On", ro: "Zece" },
  { tr: "On bir", ro: "Unsprezece" },
  { tr: "On iki", ro: "Doisprezece" },
  { tr: "On üç", ro: "Treisprezece" },
  { tr: "On dört", ro: "Paisprezece" },
  { tr: "On beş", ro: "Cincisprezece" },
  { tr: "On altı", ro: "Șaisprezece" },
  { tr: "On yedi", ro: "Șaptesprezece" },
  { tr: "On sekiz", ro: "Optsprezece" },
  { tr: "On dokuz", ro: "Nouăsprezece" },
  { tr: "Yirmi", ro: "Douăzeci" },
];

const dayOrder = [
  "pazartesi",
  "salı",
  "çarşamba",
  "perşembe",
  "cuma",
  "cumartesi",
  "pazar",
];

const dayOrderMap = new Map(dayOrder.map((day, index) => [day, index]));

function getDaySortKey(text: string) {
  const normalized = text.trim().toLocaleLowerCase("tr-TR");
  const exactOrder = dayOrderMap.get(normalized);

  if (exactOrder !== undefined) {
    return { group: 0, order: exactOrder };
  }

  for (const [day, order] of dayOrderMap.entries()) {
    if (normalized.includes(day)) {
      return { group: 1, order };
    }
  }

  return { group: 2, order: Number.MAX_SAFE_INTEGER };
}

function getTutorialWords(lessonId: string): TutorialWord[] {
  if (lessonId === "3") {
    return numberTutorialWords;
  }

  const lesson = lessonsData[lessonId];
  if (!lesson) return [];

  const wordMap = new Map<string, TutorialWord>();

  lesson.exercises.forEach((exercise) => {
    if (exercise.type === "matching") {
      exercise.pairs.forEach((pair) => {
        const tr = pair.left.trim();
        const ro = pair.right.trim();
        if (tr && ro) {
          wordMap.set(`${tr}-${ro}`.toLocaleLowerCase("tr-TR"), { tr, ro });
        }
      });
    }

    if (exercise.type === "translation") {
      const isTrToRo = exercise.direction === "tr-ro";
      const tr = (isTrToRo ? exercise.sentence : exercise.correctAnswer).trim();
      const ro = (isTrToRo ? exercise.correctAnswer : exercise.sentence).trim();

      if (tr && ro) {
        wordMap.set(`${tr}-${ro}`.toLocaleLowerCase("tr-TR"), { tr, ro });
      }
    }
  });

  const tutorialWords = Array.from(wordMap.values());

  if (lessonId === "10") {
    return tutorialWords
      .sort((a, b) => {
        const aKey = getDaySortKey(a.tr);
        const bKey = getDaySortKey(b.tr);

        if (aKey.group !== bKey.group) {
          return aKey.group - bKey.group;
        }

        if (aKey.order !== bKey.order) {
          return aKey.order - bKey.order;
        }

        return a.tr.localeCompare(b.tr, "tr-TR");
      })
      .slice(0, 12);
  }

  return tutorialWords.slice(0, 12);
}

function LessonNode({ lesson, index }: { lesson: Lesson; index: number }) {
  const hasSuperStar = lesson.superStar === true;
  const navigate = useNavigate();
  const isCompleted = lesson.status === "completed";
  const isCurrent = lesson.status === "current";
  const isLocked = lesson.status === "locked";

  const offset = index % 2 === 0 ? -30 : 30;

  const handleClick = () => {
    if (!isLocked) navigate(`/app/lesson/${lesson.id}`);
  };

  return (
    <div className="flex flex-col items-center" style={{ transform: `translateX(${offset}px)` }}>
      <button
        disabled={isLocked}
        onClick={handleClick}
        className={`relative w-[72px] h-[72px] rounded-full flex items-center justify-center text-3xl transition-all
          ${isCompleted ? "bg-success shadow-button-success active:translate-y-1 active:shadow-none" : ""}
          ${isCurrent ? "bg-flamingo shadow-button-primary animate-pulse-glow active:translate-y-1 active:shadow-none" : ""}
          ${isLocked ? "bg-muted cursor-not-allowed opacity-60" : ""}
        `}
      >
        {isLocked ? <Lock className="w-6 h-6 text-muted-foreground" /> : <span>{lesson.emoji}</span>}

        {isCompleted && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-card rounded-full flex items-center justify-center shadow-card">
            <CheckCircle className="w-5 h-5 text-success" fill="hsl(var(--success-light))" />
          </div>
        )}
      </button>

      <span className={`mt-3 text-xs font-bold text-center ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
        {lesson.title}
      </span>

      {isCompleted && hasSuperStar && (
        <div className="mt-1 flex items-center gap-1 rounded-full border border-gold/40 bg-gold/20 px-2 py-0.5">
          <Sparkles className="w-3 h-3 text-gold" />
          <span className="text-[10px] font-black text-gold">Süper</span>
        </div>
      )}

      {isCompleted && (
        <div className="flex gap-0.5 mt-1">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className="w-3.5 h-3.5"
              fill={s <= lesson.stars ? "hsl(var(--gold))" : "hsl(var(--muted))"}
              stroke={s <= lesson.stars ? "hsl(var(--gold))" : "hsl(var(--muted))"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function LearnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tutorialView = searchParams.get("view") === "tutorial";
  const economy = getEconomySnapshot();

  const lessons = useMemo<Lesson[]>(() => {
    const progress = getLessonProgress();
    const orderedLessonIds = lessonCatalog.map((lesson) => lesson.id);

    return lessonCatalog.map((lesson) => {
      const completion = progress[lesson.id];

      if (completion) {
        return { ...lesson, status: "completed" as const, stars: completion.stars, superStar: completion.superStar };
      }

      const unlocked = isLessonUnlocked(lesson.id, orderedLessonIds, progress);
      return {
        ...lesson,
        status: unlocked ? ("current" as const) : ("locked" as const),
        stars: 0,
      };
    });
  }, []);

  const tutorialLessons = useMemo(() => {
    return lessons;
  }, [lessons]);

  const levels = [...new Set(lessons.map((l) => l.level))];

  const speakText = (text: string, lang: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="pb-20">
      <StatsBar />

      <div className="px-4 py-6 max-w-lg mx-auto">
        <h1 className="text-xl font-black text-foreground text-center mb-2">
          {tutorialView ? "🦩 Alıştırma" : "🦩 Romence Öğren"}
        </h1>
        <p className="text-center text-muted-foreground text-sm font-semibold mb-8">
          {tutorialView ? "" : "A1 Seviye • Başlangıç"}
        </p>

        {tutorialView && (
          <div className="space-y-4">
            {tutorialLessons.map((lesson) => {
              const tutorialWords = getTutorialWords(lesson.id);

              return (
                <div key={lesson.id} className="bg-card rounded-2xl p-4 shadow-card">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <h2 className="font-extrabold text-foreground">
                        {lesson.emoji} {lesson.title}
                      </h2>
                      <p className="text-xs text-muted-foreground font-semibold mt-1">
                        {lessonsData[lesson.id]?.description ?? "Bu ders için kelime pratiği"}
                      </p>
                    </div>
                    <button
                      disabled={lesson.status === "locked"}
                      onClick={() => navigate(`/app/lesson/${lesson.id}`)}
                      className="gradient-sky shadow-button-sky rounded-xl px-3 py-2 text-xs font-extrabold text-primary-foreground active:translate-y-1 active:shadow-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {lesson.status === "locked" ? "Kilitli" : "Derse Git"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tutorialWords.length > 0 ? (
                      tutorialWords.map((word) => (
                        <div key={`${lesson.id}-${word.tr}-${word.ro}`} className="rounded-xl bg-muted/60 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-foreground">{word.tr}</p>
                          </div>
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-muted-foreground">{word.ro}</p>
                            <button
                              type="button"
                              aria-label={`${word.ro} cümlesini dinle`}
                              onClick={() => speakText(word.ro, "ro-RO")}
                              className="p-1.5 rounded-lg bg-card text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm font-semibold text-muted-foreground">Kelime listesi yakında eklenecek.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!tutorialView && (
          <>
            {levels.map((level) => {
              const levelLessons = lessons.filter((l) => l.level === level);
              return (
                <div key={level} className="mb-8">
                  <div className={`${levelColors[(level - 1) % levelColors.length]} rounded-2xl px-4 py-2 mb-6 mx-auto w-fit`}>
                    <span className="text-primary-foreground font-extrabold text-sm">Seviye {level}</span>
                  </div>

                  <div className="flex flex-col items-center gap-6">
                    {levelLessons.map((lesson) => (
                      <LessonNode key={lesson.id} lesson={lesson} index={lessons.indexOf(lesson)} />
                    ))}
                  </div>

                  {level < levels.length && (
                    <div className="flex justify-center my-4">
                      <div className="w-0.5 h-8 bg-border" />
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
