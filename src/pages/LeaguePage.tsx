import { useEffect, useMemo, useState } from "react";
import StatsBar from "../components/StatsBar";
import { Crown, Medal, Award, ArrowUpCircle, ArrowDownCircle, MinusCircle } from "lucide-react";
import { addLeagueXp, getLeagueMeta, getLeagueState, getRankedLeaguePlayers, getTimeUntilReset } from "@/lib/league";

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-gold" fill="hsl(var(--gold))" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
  if (rank === 3) return <Award className="w-5 h-5 text-flamingo" />;
  return <span className="text-sm font-extrabold text-muted-foreground w-5 text-center">{rank}</span>;
}

export default function LeaguePage() {
  const [version, setVersion] = useState(0);
  const [countdown, setCountdown] = useState(getTimeUntilReset());

  useEffect(() => {
    const onLeagueUpdated = () => setVersion((value) => value + 1);
    window.addEventListener("romingo:league-updated", onLeagueUpdated);

    const timer = window.setInterval(() => {
      setCountdown(getTimeUntilReset());
      setVersion((value) => value + 1);
    }, 60_000);

    return () => {
      window.removeEventListener("romingo:league-updated", onLeagueUpdated);
      window.clearInterval(timer);
    };
  }, []);

  const state = useMemo(() => getLeagueState(), [version]);
  const rankedPlayers = useMemo(() => getRankedLeaguePlayers(state), [state]);
  const meta = useMemo(() => getLeagueMeta(), [version]);

  const you = rankedPlayers.find((player) => player.isYou);

  return (
    <div className="pb-20">
      <StatsBar />

      <div className="px-4 py-6 max-w-lg mx-auto">
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto gradient-gold rounded-full flex items-center justify-center mb-3 shadow-elevated">
            <span className="text-4xl">🏆</span>
          </div>
          <h1 className="text-xl font-black text-foreground">{meta.tierName} Lig</h1>
          <p className="text-muted-foreground text-sm font-semibold">İlk 3 yükselir, son 2 küme düşer.</p>
        </div>

        {meta.lastWeekSummary && (
          <div className="bg-card rounded-2xl p-3 shadow-card mb-4 flex items-center gap-3 animate-pulse">
            {meta.lastWeekSummary.movement === "promotion" && <ArrowUpCircle className="w-5 h-5 text-emerald-500" />}
            {meta.lastWeekSummary.movement === "relegation" && <ArrowDownCircle className="w-5 h-5 text-destructive" />}
            {meta.lastWeekSummary.movement === "stay" && <MinusCircle className="w-5 h-5 text-muted-foreground" />}
            <p className="text-xs font-bold text-foreground">
              Geçen hafta {meta.lastWeekSummary.previousRank}. oldun: {meta.lastWeekSummary.fromLeague} → {meta.lastWeekSummary.toLeague}
            </p>
          </div>
        )}

        <div className="bg-card rounded-2xl p-3 shadow-card mb-4 text-center">
          <span className="text-xs font-bold text-muted-foreground">Haftalık reset: </span>
          <span className="text-xs font-extrabold text-flamingo">
            {countdown.days} gün {countdown.hours} saat kaldı
          </span>
        </div>

        <div className="bg-card rounded-2xl p-3 shadow-card mb-6 flex items-center justify-end">
          <button
            type="button"
            className="text-xs font-black text-flamingo"
            onClick={() => {
              addLeagueXp(75);
              setVersion((value) => value + 1);
            }}
          >
            +75 XP simüle et
          </button>
        </div>

        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          {rankedPlayers.map((player, i) => (
            <div
              key={player.id}
              className={`flex items-center gap-3 px-4 py-3 transition-all ${
                i < rankedPlayers.length - 1 ? "border-b border-border" : ""
              } ${player.isYou ? "bg-flamingo-light ring-1 ring-flamingo/40" : ""} ${
                player.rank <= 3 ? "bg-gold-light/30" : ""
              }`}
            >
              <div className="w-8 flex justify-center">{getRankIcon(player.rank)}</div>
              <div className="text-2xl">{player.avatar}</div>
              <div className="flex-1">
                <span className={`font-bold text-sm ${player.isYou ? "text-flamingo" : "text-foreground"}`}>
                  {player.name}
                  {player.isYou && " (Sen)"}
                </span>
              </div>
              <span className="font-extrabold text-sm text-sky-brand">{player.xp.toLocaleString()} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
