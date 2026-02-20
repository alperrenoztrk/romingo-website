import { useEffect, useMemo, useRef, useState } from "react";
import { Globe2, Trophy, WandSparkles, ArrowRight, Pause, Play } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type TutorialStep = {
  title: string;
  description: string;
  path: string;
};

type TutorialFeature = {
  title: string;
  description: string;
  icon: typeof WandSparkles;
  tutorialTitle: string;
  tutorialDescription: string;
  actionLabel: string;
  actionTo: string;
  tutorialSteps: TutorialStep[];
};

const appTourSteps: TutorialStep[] = [
  {
    title: "Ana ekran açılır",
    description: "Uygulamaya giriş yaptığında günlük hedefini, XP ilerlemeni ve hızlı erişim kartlarını görürsün.",
    path: "/app",
  },
  {
    title: "Öğren sekmesi",
    description: "Öğren bölümünde seviyene uygun dersleri ve kilitli/aktif üniteleri takip edersin.",
    path: "/app/learn",
  },
  {
    title: "Lig sekmesi",
    description: "Lig ekranında haftalık puan durumunu, sıralamanı ve rekabet hedeflerini görürsün.",
    path: "/app/league",
  },
];

const features: TutorialFeature[] = [
  {
    title: "Akıllı Öğrenme Akışı",
    description: "Zayıf olduğun konuları tespit eden adaptif dersler ile daha hızlı ilerle.",
    icon: WandSparkles,
    tutorialTitle: "Akıllı Öğrenme Akışı eğitimi",
    tutorialDescription: "Bu akış, dersi başlatınca hangi ekranların sırayla geldiğini gerçek uygulama ekranı üzerinde gösterir.",
    actionLabel: "Öğrenme akışını aç",
    actionTo: "/app/learn",
    tutorialSteps: [
      {
        title: "Öğren sayfası açılır",
        description: "Tüm ders kartları, ilerleme durumları ve önerilen ders sırası görünür.",
        path: "/app/learn",
      },
      {
        title: "Ders ekranı",
        description: "Bir dersi başlatınca soru ekranına geçilir ve anlık doğru/yanlış geri bildirimi alırsın.",
        path: "/app/lesson/1",
      },
      {
        title: "Tamamlanma sonrası",
        description: "Ders bittiğinde XP artışı ve bir sonraki önerilen adım gösterilir.",
        path: "/app/learn",
      },
    ],
  },
  {
    title: "Gerçek Zamanlı Çeviri",
    description: "Kelime ve cümle çevirilerini tek tıkla öğren, tekrar kartlarına ekle.",
    icon: Globe2,
    tutorialTitle: "Gerçek Zamanlı Çeviri eğitimi",
    tutorialDescription: "Bu akış, çeviri ekranına girişten sonucun alınmasına kadar olan adımları canlı ekran önizlemesiyle anlatır.",
    actionLabel: "Çeviri ekranına git",
    actionTo: "/translate",
    tutorialSteps: [
      {
        title: "Çeviri ekranı açılır",
        description: "Metni gireceğin alan ve çeviri yönü seçenekleri görünür.",
        path: "/translate",
      },
      {
        title: "Öğren sekmesine geçiş",
        description: "Çevrilen kelimeleri pratik etmek için tek tuşla öğren akışına geçebilirsin.",
        path: "/app/learn",
      },
      {
        title: "Tekrar döngüsü",
        description: "Öğrendiğin içerikleri tekrar ederek kalıcılığı artırırsın.",
        path: "/app/lesson/2",
      },
    ],
  },
  {
    title: "Lig ve Motivasyon",
    description: "Haftalık lig sisteminde yarışarak seri oluştur, XP topla ve seviye atla.",
    icon: Trophy,
    tutorialTitle: "Lig ve Motivasyon eğitimi",
    tutorialDescription: "Bu akış, lig tablosu, XP kazanımı ve profildeki ilerleme özetinin nasıl güncellendiğini gösterir.",
    actionLabel: "Lige git",
    actionTo: "/app/league",
    tutorialSteps: [
      {
        title: "Lig tablosu",
        description: "Sıralamadaki yerini ve rakiplerinin puanlarını takip edersin.",
        path: "/app/league",
      },
      {
        title: "Ders tamamla, puan kazan",
        description: "Ders tamamlama sonrası XP birikimi lig puanına yansır.",
        path: "/app/lesson/3",
      },
      {
        title: "Profilde motivasyon özeti",
        description: "Serin, toplam XP ve kişisel hedef ilerlemen profilde özetlenir.",
        path: "/app/profile",
      },
    ],
  },
];

function TutorialFlowPlayer({ steps }: { steps: TutorialStep[] }) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const current = useMemo(() => steps[index], [steps, index]);

  useEffect(() => {
    if (!isPlaying || steps.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % steps.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [isPlaying, steps.length]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    let animationFrame: number | null = null;
    let isStopped = false;

    const animateScroll = () => {
      if (isStopped) {
        return;
      }

      const frameWindow = iframe.contentWindow;
      const frameDocument = frameWindow?.document;
      if (!frameWindow || !frameDocument) {
        return;
      }

      const body = frameDocument.body;
      const html = frameDocument.documentElement;
      const maxScroll = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight,
      ) - frameWindow.innerHeight;

      frameWindow.scrollTo({ top: 0, behavior: "auto" });

      if (maxScroll <= 0) {
        return;
      }

      const duration = 5500;
      const start = performance.now();

      const step = (timestamp: number) => {
        if (isStopped) {
          return;
        }

        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        frameWindow.scrollTo({ top: maxScroll * progress, behavior: "auto" });

        if (progress < 1) {
          animationFrame = requestAnimationFrame(step);
        }
      };

      animationFrame = requestAnimationFrame(step);
    };

    const onLoad = () => {
      animateScroll();
    };

    iframe.addEventListener("load", onLoad);
    animateScroll();

    return () => {
      isStopped = true;
      iframe.removeEventListener("load", onLoad);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [current.path]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">Tutorial video akışı</div>
        <button
          type="button"
          onClick={() => setIsPlaying((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isPlaying ? "Duraklat" : "Oynat"}
        </button>
      </div>

      <div className="space-y-2">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((index + 1) / steps.length) * 100}%` }}
          />
        </div>
        <div className="text-sm font-bold">{current.title}</div>
        <p className="text-sm text-muted-foreground">{current.description}</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <iframe
          ref={iframeRef}
          title={current.title}
          src={current.path}
          className="h-[360px] w-full"
          loading="lazy"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {steps.map((step, stepIndex) => (
          <button
            key={step.title}
            type="button"
            onClick={() => setIndex(stepIndex)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              stepIndex === index
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {stepIndex + 1}. {step.title}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 pb-20 pt-16 text-center">
        <img src="/romingo-logo.svg" alt="Romingo logosu" className="h-24 w-auto" />
        <p className="rounded-full border border-border bg-card px-4 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Romingo ile dil öğrenmeyi eğlenceli hale getir
        </p>
        <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
          Günlük mini derslerle dil pratiği yap, gelişimini canlı takip et.
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
          Romingo, kısa ve etkili egzersizleri kişisel hedeflerinle birleştirerek seni her gün düzenli çalışmaya
          teşvik eden modern bir dil öğrenme platformudur.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Uygulamayı Aç
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Dialog>
            <DialogTrigger className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-extrabold transition hover:bg-muted">
              Uygulama turunu izle
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Romingo hızlı başlangıç tutorial videosu</DialogTitle>
                <DialogDescription>
                  Butona bastıktan sonra uygulamada neler olduğunu adım adım, gerçek ekran önizlemeleriyle izleyebilirsin.
                </DialogDescription>
              </DialogHeader>

              <TutorialFlowPlayer steps={appTourSteps} />
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-20 md:grid-cols-3">
        {features.map(({ title, description, icon: Icon, tutorialTitle, tutorialDescription, actionLabel, actionTo, tutorialSteps }) => (
          <article key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-extrabold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>

            <Dialog>
              <DialogTrigger className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/20">
                Tutorial videosunu izle
              </DialogTrigger>

              <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{tutorialTitle}</DialogTitle>
                  <DialogDescription>{tutorialDescription}</DialogDescription>
                </DialogHeader>

                <TutorialFlowPlayer steps={tutorialSteps} />

                <Link
                  to={actionTo}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:opacity-90"
                >
                  {actionLabel}
                </Link>
              </DialogContent>
            </Dialog>
          </article>
        ))}
      </section>
    </main>
  );
}
