import { Globe2, Trophy, WandSparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Akıllı Öğrenme Akışı",
    description: "Zayıf olduğun konuları tespit eden adaptif dersler ile daha hızlı ilerle.",
    icon: WandSparkles,
  },
  {
    title: "Gerçek Zamanlı Çeviri",
    description: "Kelime ve cümle çevirilerini tek tıkla öğren, tekrar kartlarına ekle.",
    icon: Globe2,
  },
  {
    title: "Lig ve Motivasyon",
    description: "Haftalık lig sisteminde yarışarak seri oluştur, XP topla ve seviye atla.",
    icon: Trophy,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 pb-20 pt-16 text-center">
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
          <Link
            to="/translate"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold transition hover:bg-muted"
          >
            Çeviri Aracını Dene
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-20 md:grid-cols-3">
        {features.map(({ title, description, icon: Icon }) => (
          <article key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-extrabold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
