// XP & Level system for ZeroGap mock tests

export const LEVELS = [
  { level: 1, name: "Beginner", emoji: "🌱", min: 0, max: 200 },
  { level: 2, name: "Explorer", emoji: "🔍", min: 200, max: 500 },
  { level: 3, name: "Challenger", emoji: "⚡", min: 500, max: 900 },
  { level: 4, name: "Achiever", emoji: "🎯", min: 900, max: 1400 },
  { level: 5, name: "Interview Ready", emoji: "🏆", min: 1400, max: 2000 },
  { level: 6, name: "ZeroGap Master", emoji: "💎", min: 2000, max: Infinity },
];

export function levelForXp(xp: number) {
  for (const l of LEVELS) {
    if (xp >= l.min && xp < l.max) return l;
  }
  return LEVELS[LEVELS.length - 1];
}

export function xpForResult(opts: {
  scorePct: number;
  improvedOverLast: boolean;
  streakDays: number;
}) {
  let xp = 50; // base for completing a test
  const p = opts.scorePct;
  if (p >= 100) xp += 100;
  else if (p >= 90) xp += 70;
  else if (p >= 80) xp += 50;
  else if (p >= 70) xp += 30;

  if (opts.streakDays > 0) xp += 10;
  if (opts.improvedOverLast) xp += 20;
  return xp;
}

export function performanceLabel(scorePct: number) {
  if (scorePct >= 90) return { label: "Outstanding 🏆", tone: "text-warning" };
  if (scorePct >= 75) return { label: "Excellent 🎯", tone: "text-success" };
  if (scorePct >= 60) return { label: "Good 👍", tone: "text-primary" };
  if (scorePct >= 45) return { label: "Average 📈", tone: "text-muted-foreground" };
  return { label: "Needs Work 💪 — Keep practicing!", tone: "text-destructive" };
}
