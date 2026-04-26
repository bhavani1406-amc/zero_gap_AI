import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Loader2, Sparkles, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

export const Route = createFileRoute("/market-mapping")({
  head: () => ({ meta: [{ title: "Market Mapping — ZeroGap AI" }] }),
  component: MarketPage,
});

type Trend = {
  growth_probability: number;
  demand_today: number;
  demand_2027: number;
  demand_2028: number;
  demand_2029: number;
  trend_direction: "rising_fast" | "rising" | "stable" | "declining";
  avg_salary_inr_lakhs: number;
  top_skills: string[];
  top_cities: string[];
  outlook: string;
  recommended_action: string;
};

const PRESETS = [
  "AI/ML Engineer", "Full Stack Developer", "Data Scientist", "DevOps Engineer",
  "Cybersecurity Analyst", "Cloud Engineer", "Product Manager", "Mobile Developer",
  "Agentic AI Engineer", "Blockchain Developer",
];

function MarketPage() {
  const [role, setRole] = useState("");
  const [trend, setTrend] = useState<Trend | null>(null);
  const [activeRole, setActiveRole] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async (r: string) => {
    if (!r.trim()) return;
    setLoading(true);
    setActiveRole(r);
    try {
      const res = await fetch("/api/market-trend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: r }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTrend(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = trend ? [
    { year: "2026", demand: trend.demand_today },
    { year: "2027", demand: trend.demand_2027 },
    { year: "2028", demand: trend.demand_2028 },
    { year: "2029", demand: trend.demand_2029 },
  ] : [];

  const trendColor = trend?.trend_direction === "rising_fast" ? "text-success" :
    trend?.trend_direction === "rising" ? "text-primary" :
    trend?.trend_direction === "stable" ? "text-warning" : "text-destructive";

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Real-Time Market Mapping</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Pick any tech role. Get a 3-year demand projection and a probability score — so you know which careers will <span className="text-primary">rise within 2-3 years</span>.
          </p>
        </div>

        <Card className="p-6 gradient-card border-border/60 mb-6">
          <form onSubmit={(e) => { e.preventDefault(); analyze(role); }} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter a job role (e.g. Agentic AI Engineer)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <Button type="submit" disabled={loading || !role.trim()} className="gradient-cyan text-primary-foreground">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <><Sparkles className="size-4 mr-1" /> Analyze trend</>}
            </Button>
          </form>
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-2">Quick picks</div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setRole(p); analyze(p); }}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs rounded-full border border-border hover:border-primary/60 hover:text-primary transition disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {loading && (
          <Card className="p-12 gradient-card border-border/60 text-center">
            <Loader2 className="size-8 animate-spin text-primary mx-auto mb-3" />
            <div className="text-sm text-muted-foreground">Mapping the market for "{activeRole}"…</div>
          </Card>
        )}

        {trend && !loading && (
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6 gradient-card border-border/60">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-xs text-primary uppercase tracking-wider">Demand projection</div>
                  <h2 className="text-2xl font-bold">{activeRole}</h2>
                </div>
                <Badge className={`${trendColor} bg-background/40 border-border`}>
                  {trend.trend_direction === "rising_fast" ? <TrendingUp className="size-3 mr-1" /> :
                   trend.trend_direction === "declining" ? <TrendingDown className="size-3 mr-1" /> :
                   <ArrowUpRight className="size-3 mr-1" />}
                  {trend.trend_direction.replace("_", " ")}
                </Badge>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <defs>
                      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.78 0.14 200)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="oklch(0.78 0.14 200)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.04 250)" />
                    <XAxis dataKey="year" stroke="oklch(0.68 0.03 230)" />
                    <YAxis domain={[0, 100]} stroke="oklch(0.68 0.03 230)" />
                    <Tooltip contentStyle={{ background: "oklch(0.22 0.045 250)", border: "1px solid oklch(0.32 0.04 250)", borderRadius: 8 }} />
                    <ReferenceLine y={trend.demand_today} stroke="oklch(0.68 0.03 230)" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="demand" stroke="oklch(0.78 0.14 200)" strokeWidth={3} dot={{ r: 5, fill: "oklch(0.78 0.14 200)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-background/40 border border-border/60">
                <div className="text-xs text-primary uppercase tracking-wider mb-1">Outlook</div>
                <p className="text-sm">{trend.outlook}</p>
                <div className="mt-3 pt-3 border-t border-border/40 text-sm">
                  <span className="text-primary font-medium">Recommended:</span> {trend.recommended_action}
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="p-6 gradient-card border-border/60 text-center">
                <div className="text-xs text-primary uppercase tracking-wider mb-2">Future Probability</div>
                <div className="text-6xl font-display font-bold text-gradient-cyan">{trend.growth_probability}%</div>
                <div className="text-xs text-muted-foreground mt-2">chance this role will be highly beneficial in 2–3 years</div>
              </Card>

              <Card className="p-5 gradient-card border-border/60">
                <div className="text-xs text-primary uppercase tracking-wider mb-3">Avg salary (India)</div>
                <div className="text-2xl font-bold">₹{trend.avg_salary_inr_lakhs.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">L/yr</span></div>
              </Card>

              <Card className="p-5 gradient-card border-border/60">
                <div className="text-xs text-primary uppercase tracking-wider mb-3">Must-have skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {trend.top_skills.map((s) => (
                    <Badge key={s} variant="outline" className="border-primary/40 text-primary text-xs">{s}</Badge>
                  ))}
                </div>
              </Card>

              <Card className="p-5 gradient-card border-border/60">
                <div className="text-xs text-primary uppercase tracking-wider mb-3">Top hiring cities</div>
                <ul className="space-y-1 text-sm">{trend.top_cities.map((c) => <li key={c}>• {c}</li>)}</ul>
              </Card>

              <Button asChild className="w-full gradient-cyan text-primary-foreground">
                <Link to="/micro-roadmap">Build roadmap for this role →</Link>
              </Button>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}
