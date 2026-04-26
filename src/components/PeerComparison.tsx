import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

export function PeerComparison({ score, college, city }: { score: number; college?: string | null; city?: string | null }) {
  const [stats, setStats] = useState<{ collegeAvg: number; collegeMax: number; collegeMin: number; collegePct: number; cityPct: number; total: number } | null>(null);

  useEffect(() => {
    if (!college) return;
    (async () => {
      const colRes = await supabase.from("college_stats").select("ats_score").eq("college", college);
      const cityRes = city
        ? await supabase.from("college_stats").select("ats_score").eq("city", city)
        : { data: [] as { ats_score: number }[] };
      const col = ((colRes.data ?? []) as { ats_score: number }[]).map((r) => r.ats_score);
      const cityArr = ((cityRes.data ?? []) as { ats_score: number }[]).map((r) => r.ats_score);
      const safeCity = cityArr.length > 0 ? cityArr : col;

      if (col.length === 0) { setStats(null); return; }
      const avg = Math.round(col.reduce((a, b) => a + b, 0) / col.length);
      const max = Math.max(...col);
      const min = Math.min(...col);
      const collegePct = Math.round((col.filter((s) => s < score).length / col.length) * 20) * 5; // round to 5%
      const cityPct = Math.round((safeCity.filter((s) => s < score).length / safeCity.length) * 20) * 5;
      setStats({ collegeAvg: avg, collegeMax: max, collegeMin: min, collegePct, cityPct, total: col.length });
    })();
  }, [score, college, city]);

  if (!college || !stats) return null;

  const pos = Math.max(0, Math.min(100, ((score - stats.collegeMin) / Math.max(1, stats.collegeMax - stats.collegeMin)) * 100));

  return (
    <Card className="p-5 gradient-card border-border/60">
      <div className="flex items-center gap-2 mb-3">
        <Users className="size-4 text-primary" />
        <div className="font-semibold text-sm">How you compare</div>
      </div>
      <p className="text-sm">
        You scored higher than <span className="text-primary font-bold">~{stats.collegePct}%</span> of {stats.total} students at <span className="font-medium">{college.split(",")[0]}</span>.
      </p>
      <div className="mt-4 relative h-2 rounded-full bg-border/60">
        <div className="absolute size-3 rounded-full bg-primary -top-0.5" style={{ left: `calc(${pos}% - 6px)`, boxShadow: "0 0 12px rgba(0,229,255,0.6)" }} />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
        <span>min {stats.collegeMin}</span>
        <span>avg {stats.collegeAvg}</span>
        <span>top {stats.collegeMax}</span>
      </div>
      {city && (
        <p className="text-xs text-muted-foreground mt-3">
          In {city}: top <span className="text-primary font-semibold">{Math.max(5, 100 - stats.cityPct)}%</span>
        </p>
      )}
      <p className="text-[10px] text-muted-foreground mt-3 italic">Based on anonymized, aggregated data. Nobody can identify you.</p>
    </Card>
  );
}
