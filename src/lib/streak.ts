import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";

const todayStr = () => new Date().toISOString().slice(0, 10);
const dateDiffDays = (a: string, b: string) =>
  Math.round((+new Date(b) - +new Date(a)) / 86_400_000);

export type StreakRow = {
  user_id: string;
  streak_count: number;
  longest_streak: number;
  last_active_date: string | null;
  freezes_remaining: number;
};

export type StreakUpdate = {
  row: StreakRow;
  /** "same" — already counted today; "incremented" — +1 day; "reset" — broken */
  action: "same" | "incremented" | "reset";
  milestone: 3 | 7 | 30 | null;
};

export async function pingStreak(userId: string): Promise<StreakUpdate | null> {
  const { data: existing } = await supabase
    .from("user_streaks").select("*").eq("user_id", userId).maybeSingle();
  const today = todayStr();

  if (!existing) {
    const row = {
      user_id: userId,
      streak_count: 1,
      longest_streak: 1,
      last_active_date: today,
      freezes_remaining: 2,
    };
    await supabase.from("user_streaks").insert(row);
    return { row, action: "incremented", milestone: null };
  }

  const last = existing.last_active_date;
  if (last === today) {
    return { row: existing as StreakRow, action: "same", milestone: null };
  }

  let newCount = existing.streak_count;
  let action: "incremented" | "reset" = "incremented";
  if (last) {
    const diff = dateDiffDays(last, today);
    if (diff === 1) newCount = existing.streak_count + 1;
    else if (diff > 1) {
      newCount = 1;
      action = "reset";
    }
  } else {
    newCount = 1;
  }

  const longest = Math.max(existing.longest_streak ?? 0, newCount);
  const updated = {
    ...existing,
    streak_count: newCount,
    longest_streak: longest,
    last_active_date: today,
  } as StreakRow;
  await supabase
    .from("user_streaks")
    .update({ streak_count: newCount, longest_streak: longest, last_active_date: today })
    .eq("user_id", userId);

  let milestone: 3 | 7 | 30 | null = null;
  if (newCount === 3) milestone = 3;
  else if (newCount === 7) milestone = 7;
  else if (newCount === 30) milestone = 30;

  return { row: updated, action, milestone };
}

export function fireConfetti(intensity: "low" | "high" = "low") {
  const count = intensity === "high" ? 200 : 80;
  confetti({
    particleCount: count,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#00e5ff", "#a78bfa", "#34d399", "#fbbf24"],
  });
}
