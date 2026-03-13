import StatsBar from "../components/StatsBar";
import { ArrowLeft, Save, RotateCcw, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { KeyboardEvent, useState } from "react";
import { getDailyGoalTargets, saveDailyGoalTargets } from "@/lib/dailyGoals";

const DEFAULT_TARGETS = {
  lessons: 1,
  xp: 120,
  correctAnswers: 10,
};

export default function DailyGoalsSettingsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [targets, setTargets] = useState(getDailyGoalTargets);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/app");
  };

  const handleTargetChange = (key: keyof typeof targets, value: string) => {
    if (value.trim() === "") {
      setTargets((prev) => ({
        ...prev,
        [key]: 0,
      }));
      return;
    }

    const parsedValue = Number(value);
    const minValue = key === "lessons" ? 1 : 0;
    setTargets((prev) => ({
      ...prev,
      [key]: Number.isFinite(parsedValue) ? Math.max(minValue, Math.floor(parsedValue)) : minValue,
    }));
  };

  const handleZeroReplaceOnType = (key: keyof typeof targets, event: KeyboardEvent<HTMLInputElement>) => {
    if (targets[key] !== 0) {
      return;
    }

    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      setTargets((prev) => ({
        ...prev,
        [key]: Number(event.key),
      }));
    }
  };

  const handleSave = () => {
    const sanitizedTargets = {
      ...targets,
      lessons: Math.max(1, Math.floor(targets.lessons)),
    };

    setTargets(sanitizedTargets);
    saveDailyGoalTargets(sanitizedTargets);
  };

  const handleReset = () => {
    setTargets(DEFAULT_TARGETS);
    saveDailyGoalTargets(DEFAULT_TARGETS);
    toast({
      title: "Varsayılan hedefler geri yüklendi",
      description: "Ders, XP ve doğru cevap hedefleri başlangıç değerlerine döndü.",
    });
  };

  return (
    <div className="pb-20">
      <StatsBar />

      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 rounded-xl bg-muted/40 hover:bg-muted transition-colors"
            aria-label="Geri dön"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-foreground">Günlük Hedefleri Ayarla</h1>
          </div>
        </div>

        <section className="bg-card rounded-2xl p-4 shadow-card space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Ders Tamamla</label>
            <Input
              type="number"
              min={1}
              value={targets.lessons}
              onChange={(event) => handleTargetChange("lessons", event.target.value)}
              onKeyDown={(event) => handleZeroReplaceOnType("lessons", event)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">XP Kazan</label>
            <Input
              type="number"
              min={0}
              value={targets.xp}
              onChange={(event) => handleTargetChange("xp", event.target.value)}
              onKeyDown={(event) => handleZeroReplaceOnType("xp", event)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Doğru Cevap Ver</label>
            <Input
              type="number"
              min={0}
              value={targets.correctAnswers}
              onChange={(event) => handleTargetChange("correctAnswers", event.target.value)}
              onKeyDown={(event) => handleZeroReplaceOnType("correctAnswers", event)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button className="w-full font-extrabold" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
            <Button className="w-full font-extrabold" variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Varsayılanlara Dön
            </Button>
          </div>
        </section>

        <div className="rounded-2xl p-4 bg-muted/40 flex items-start gap-3">
          <Target className="w-5 h-5 mt-0.5 text-flamingo" />
          <p className="text-xs font-semibold text-muted-foreground">Hedeflerini yükselttikçe günlük ilerleme çubuğu daha motive edici bir şekilde güncellenir.</p>
        </div>
      </div>
    </div>
  );
}
