import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

type Entry = {
  id: string;
  user_id: string;
  college: string;
  city: string;
  ats_score: number;
  improvement_delta: number;
  anonymous_name: string;
};

export function Leaderboard({ userId, college, city }: { userId: string; college?: string | null; city?: string | null }) {
  const [tab, setTab] = useState<"college" | "city" | "india">("college");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    setLoading(true);
    let q = supabase
      .from("leaderboard_entries")
      .select("id,user_id,college,city,ats_score,improvement_delta,anonymous_name")
      .order("ats_score", { ascending: false })
      .limit(10);
    if (tab === "college" && college) q = q.eq("college", college);
    if (tab === "city" && city) q = q.eq("city", city);
    const { data } = await q;
    setEntries((data ?? []) as Entry[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
    const ch = supabase
      .channel(`leaderboard-${tab}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "leaderboard_entries" }, fetchEntries)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, college, city]);

  const myRank = entries.findIndex((e) => e.user_id === userId) + 1;

  return (
    <Card className="p-5 gradient-card border-border/60">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-warning" />
          <div className="font-semibold text-sm">Leaderboard</div>
          <span className="size-2 rounded-full bg-success animate-pulse" title="Live" />
        </div>
      </div>

      <div className="grid grid-cols-3 text-[11px] mb-3 rounded-md border border-border/60 overflow-hidden">
        {(["college", "city", "india"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-1.5 transition ${tab === t ? "bg-primary text-primary-foreground" : "bg-background/40 hover:bg-background/60"}`}
          >
            {t === "college" ? "College" : t === "city" ? "City" : "India"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-xs text-muted-foreground text-center py-6">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-6">
          No entries yet. Run a resume analysis to enter the leaderboard.
        </div>
      ) : (
        <ul className="space-y-1.5">
          {entries.map((e, i) => {
            const isMe = e.user_id === userId;
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
            return (
              <li
                key={e.id}
                className={`flex items-center gap-2 p-2 rounded-md text-xs transition ${isMe ? "bg-primary/10 border border-primary/40" : "bg-background/40 border border-border/40"}`}
              >
                <span className="w-7 text-center font-semibold">{medal}</span>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{e.anonymous_name}{isMe && <span className="text-primary"> · you</span>}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{tab === "india" ? e.college : tab === "city" ? e.college : e.city}</div>
                </div>
                <span className="text-primary font-bold">{e.ats_score}</span>
                {e.improvement_delta > 0 && <span className="text-[10px] text-success">↑{e.improvement_delta}</span>}
              </li>
            );
          })}
        </ul>
      )}
      {myRank > 0 && (
        <p className="text-[11px] text-muted-foreground text-center mt-3">Your rank: #{myRank}</p>
      )}
      <p className="text-[10px] text-muted-foreground text-center mt-3 italic">
        Anonymous · names hidden · only score & college shown
      </p>
    </Card>
  );
}
