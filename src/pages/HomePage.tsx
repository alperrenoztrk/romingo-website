import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Languages, Target, Star, TrendingUp, SlidersHorizontal } from "lucide-react";
import { getCurrentWeekProgress } from "../lib/weeklyProgress";
import { getStoredProfileSettings } from "../lib/account";
import { getCompletedLessonsCountForDate } from "../lib/lessonProgress";
import {
  getCorrectAnswersForDate,
  getDailyGoalTargets,
  getTodayCorrectAnswers,
  getTodayXpProgress,
} from "../lib/dailyGoals";
import {
  learningEconomyUpdatedEvent,
} from "@/lib/learningEconomy";
import { getAdaptivePracticePlan, getExerciseTypeLabel } from "@/lib/adaptivePractice";

const GOAL_DEFINITIONS = [
  {
    metricKey: "lessons",
    label: "Ders Tamamla",
    target: 1,
  },
  {
    metricKey: "xp",
    label: "XP Kazan",
    target: 120,
  },
  {
    metricKey: "correctAnswers",
    label: "Doğru Cevap Ver",
    target: 10,
  },
] as const;

function getGoalCompletionRatio(current: number, target: number) {
  if (target <= 0) {
    return 1;
  }

  return Math.min(current / target, 1);
}

export default function HomePage() {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const baseGreeting = hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";
  const profileSettings = getStoredProfileSettings();
  const displayName = profileSettings.username.replace(/^@/, "").trim() || profileSettings.fullName;
  const greeting = `${baseGreeting} ${displayName}`;
  const [weeklyProgress, setWeeklyProgress] = useState(getCurrentWeekProgress());
  const [flamingoRotation, setFlamingoRotation] = useState(0);
  const [todayMetrics, setTodayMetrics] = useState({
    lessons: getCompletedLessonsCountForDate(),
    xp: getTodayXpProgress(),
    correctAnswers: getTodayCorrectAnswers(),
  });

  useEffect(() => {
    const syncProgress = () => {
      setWeeklyProgress(getCurrentWeekProgress());
      setTodayMetrics({
        lessons: getCompletedLessonsCountForDate(),
        xp: getTodayXpProgress(),
        correctAnswers: getTodayCorrectAnswers(),
      });
    };

    const interval = setInterval(syncProgress, 1000);
    window.addEventListener("storage", syncProgress);
    window.addEventListener("romingo:daily-goals-updated", syncProgress);
    window.addEventListener(learningEconomyUpdatedEvent, syncProgress);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", syncProgress);
      window.removeEventListener("romingo:daily-goals-updated", syncProgress);
      window.removeEventListener(learningEconomyUpdatedEvent, syncProgress);
    };
  }, []);

  const practicePlan = useMemo(() => getAdaptivePracticePlan(), [todayMetrics.correctAnswers]);
  const dailyGoalTargets = getDailyGoalTargets();

  const nextAction = useMemo(() => {
    const lessonsDone = todayMetrics.lessons >= 1;
    const xpDone = todayMetrics.xp >= dailyGoalTargets.xp;
    const correctDone = todayMetrics.correctAnswers >= dailyGoalTargets.correctAnswers;
    const topWeakType = practicePlan.weakTypes[0];

    if (!lessonsDone) {
      return {
        icon: BookOpen,
        title: "Bugün ne yapmalıyım?",
        label: "Sıradaki dersi tamamla",
        desc: "Serini korumak için kaldığın yerden devam et.",
        to: "/learn",
        gradient: "gradient-success",
        shadow: "shadow-button-success",
      };
    }

    if (!correctDone && topWeakType) {
      return {
        icon: Target,
        title: "Bugün ne yapmalıyım?",
        label: "Zayıf konunu tekrar et",
        desc: `Öneri: ${getExerciseTypeLabel(topWeakType.type)} pratiği yap.`,
        to: "/learn?view=tutorial&practice=adaptive",
        gradient: "gradient-sky",
        shadow: "shadow-button-sky",
      };
    }

    if (!xpDone) {
      return {
        icon: Star,
        title: "Bugün ne yapmalıyım?",
        label: "Hedef XP'yi tamamla",
        desc: `Kalan ${Math.max(dailyGoalTargets.xp - todayMetrics.xp, 0)} XP için kısa bir ders daha.`,
        to: "/learn",
        gradient: "gradient-hero",
        shadow: "shadow-button-primary",
      };
    }

    return {
      icon: Target,
      title: "Bugün ne yapmalıyım?",
      label: "Mini tekrar turu yap",
      desc: "Yarına hazırlanmak için 5 dakikalık pratik öneriyoruz.",
      to: "/learn?view=tutorial&practice=adaptive",
      gradient: "gradient-sky",
      shadow: "shadow-button-sky",
    };
  }, [dailyGoalTargets.correctAnswers, dailyGoalTargets.xp, practicePlan.weakTypes, todayMetrics.correctAnswers, todayMetrics.lessons, todayMetrics.xp]);


  const dailyGoals = useMemo(
    () =>
      GOAL_DEFINITIONS.map((goal) => ({
        id: goal.metricKey,
        label: goal.label,
        target: dailyGoalTargets[goal.metricKey],
        current: todayMetrics[goal.metricKey],
      })),
    [dailyGoalTargets, todayMetrics],
  );

  const weeklyProgressPercentages = useMemo(
    () =>
      weeklyProgress.map((item) => {
        const date = new Date(item.dateKey);
        const lessons = getCompletedLessonsCountForDate(date);
        const xp = item.progress;
        const correctAnswers = getCorrectAnswersForDate(date);

        const completionRatio =
          (getGoalCompletionRatio(lessons, dailyGoalTargets.lessons) +
            getGoalCompletionRatio(xp, dailyGoalTargets.xp) +
            getGoalCompletionRatio(correctAnswers, dailyGoalTargets.correctAnswers)) /
          3;

        return {
          ...item,
          completionPercent: Math.round(completionRatio * 100),
        };
      }),
    [dailyGoalTargets.correctAnswers, dailyGoalTargets.lessons, dailyGoalTargets.xp, weeklyProgress],
  );

  return (
    <div className="pb-20">
      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Greeting */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setFlamingoRotation((currentRotation) => currentRotation + 360)}
            className="transition-transform duration-700 ease-out active:scale-95"
            style={{ transform: `rotate(${flamingoRotation}deg)` }}
            aria-label="Logoyu döndür"
          >
            <img src="/romingo-logo.svg" alt="Romingo logosu" className="h-14 w-auto" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-foreground">{greeting}!</h1>
          </div>
        </div>

        {/* Daily Goals */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-extrabold text-foreground flex items-center gap-2">
              <Star className="w-5 h-5 text-gold" fill="hsl(var(--gold))" />
              Günlük Hedefler
            </h2>
            <button
              type="button"
              onClick={() => navigate("/settings/daily-goals")}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-extrabold text-foreground hover:bg-muted transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Ayarla
            </button>
          </div>
          <div className="space-y-3">
            {dailyGoals.map((goal) => {
              const done = goal.current >= goal.target;

              return (
                <div key={goal.id} className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        done
                          ? "bg-success text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done ? "✓" : ""}
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`font-semibold text-sm ${
                          done ? "text-foreground line-through opacity-60" : "text-foreground"
                        }`}
                      >
                        {goal.label}
                      </span>
                      <p className="text-xs text-muted-foreground font-semibold">
                        {goal.current}/{goal.target}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Best Action */}
        <button
          onClick={() => navigate(nextAction.to)}
          className={`${nextAction.gradient} ${nextAction.shadow} rounded-2xl p-5 text-left active:translate-y-1 active:shadow-none transition-all w-full`}
        >
          <div className="text-primary-foreground/80 text-xs font-extrabold uppercase tracking-wide mb-1">
            {nextAction.title}
          </div>
          <nextAction.icon className="w-8 h-8 text-primary-foreground mb-2" />
          <div className="text-primary-foreground font-extrabold text-base">{nextAction.label}</div>
          <div className="text-primary-foreground/80 text-xs font-semibold mt-1">{nextAction.desc}</div>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/learn?view=tutorial&practice=adaptive")}
            className="gradient-sky shadow-button-sky rounded-2xl p-4 text-left active:translate-y-1 active:shadow-none transition-all"
          >
            <Target className="w-8 h-8 text-primary-foreground mb-2" />
            <div className="text-primary-foreground font-extrabold text-sm">Pratik Yap</div>
          </button>

          <button
            onClick={() => navigate("/translate")}
            className="gradient-hero shadow-button-primary rounded-2xl p-4 text-left active:translate-y-1 active:shadow-none transition-all"
          >
            <Languages className="w-8 h-8 text-primary-foreground mb-2" />
            <div className="text-primary-foreground font-extrabold text-sm">Çeviri</div>
          </button>
        </div>

        {/* Streak Card */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-flamingo" />
            <div>
              <h2 className="font-extrabold text-foreground">Haftalık İlerleme</h2>
            </div>
          </div>
          <div className="flex items-end justify-between gap-1">
            {weeklyProgressPercentages.map((item, i) => {
              const isToday = i === (new Date().getDay() + 6) % 7;
              const hasProgress = item.completionPercent > 0;

              return (
                <div key={item.day} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-full max-w-[32px] bg-muted rounded-lg overflow-hidden h-20 flex items-end">
                    {hasProgress && (
                      <div
                        className={`w-full rounded-lg transition-all ${isToday ? "gradient-hero" : "gradient-sky"}`}
                        style={{ height: `${item.completionPercent}%` }}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold ${
                      isToday ? "text-flamingo" : "text-muted-foreground"
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
