import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { localDb } from "@/lib/local-db";
import { Briefcase, MapPin, Search, ArrowRight, Wifi, Building2, Sparkles, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — Filter Internships & Jobs Across India | ZeroGap AI" },
      {
        name: "description",
        content:
          "Browse curated internships, full-time, hybrid, and remote roles for Indian students. Filter by city, domain, and experience — matched to your resume.",
      },
      { property: "og:title", content: "Opportunities — ZeroGap AI" },
      {
        property: "og:description",
        content: "Curated internships and jobs filtered by city, domain, and ATS fit.",
      },
    ],
  }),
  component: OpportunitiesPage,
});

type EmpType = "Full-Time" | "Remote" | "Hybrid" | "Internship";

interface Job {
  id: string;
  role: string;
  company: string;
  city: string;
  type: EmpType;
  domain: string;
  level: string;
  skills: string[];
  pay: string;
  schedule: string;
  posted: string;
  url: string;
}

const CITIES = [
  "All Cities",
  "Bengaluru",
  "Hyderabad",
  "Mumbai",
  "Pune",
  "Delhi NCR",
  "Chennai",
  "Noida",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Kochi",
  "Remote",
];

const DOMAINS = [
  "All Domains",
  "AI / ML",
  "Web Development",
  "Data Science",
  "Cloud / DevOps",
  "Cybersecurity",
  "Mobile Dev",
  "UI/UX Design",
  "Product Management",
  "FinTech",
  "Blockchain",
  "Game Development",
  "Embedded Systems",
];

const LEVELS = ["Any Level", "Fresher (0–1 yr)", "Junior (1–3 yrs)", "Mid-level (3–5 yrs)"];

const EMP_TYPES: EmpType[] = ["Full-Time", "Remote", "Hybrid", "Internship"];

const JOBS: Job[] = [
  { id: "1", role: "ML Engineer Intern", company: "Swiggy", city: "Bengaluru", type: "Internship", domain: "AI / ML", level: "Fresher (0–1 yr)", skills: ["Python", "TensorFlow", "MLOps"], pay: "₹30,000/mo", schedule: "Hybrid · 6 mo", posted: "2d ago", url: "#" },
  { id: "2", role: "Full Stack Developer", company: "Razorpay", city: "Bengaluru", type: "Full-Time", domain: "Web Development", level: "Junior (1–3 yrs)", skills: ["React", "Node.js", "TypeScript"], pay: "₹12–18 LPA", schedule: "Hybrid · 3 days office", posted: "5d ago", url: "#" },
  { id: "3", role: "Cloud Engineer Intern", company: "Microsoft", city: "Hyderabad", type: "Internship", domain: "Cloud / DevOps", level: "Fresher (0–1 yr)", skills: ["Azure", "Docker", "Kubernetes"], pay: "₹35,000/mo", schedule: "Hybrid · 6 mo", posted: "1d ago", url: "#" },
  { id: "4", role: "Data Analyst", company: "Amazon", city: "Remote", type: "Remote", domain: "Data Science", level: "Junior (1–3 yrs)", skills: ["SQL", "Python", "Tableau"], pay: "₹14 LPA", schedule: "Fully remote", posted: "3d ago", url: "#" },
  { id: "5", role: "FinTech Backend Intern", company: "JP Morgan", city: "Mumbai", type: "Internship", domain: "FinTech", level: "Fresher (0–1 yr)", skills: ["Java", "Spring Boot", "Kafka"], pay: "₹40,000/mo", schedule: "On-site · 6 mo", posted: "1w ago", url: "#" },
  { id: "6", role: "Frontend Developer", company: "Flipkart", city: "Bengaluru", type: "Hybrid", domain: "Web Development", level: "Junior (1–3 yrs)", skills: ["React", "Redux", "CSS"], pay: "₹10–14 LPA", schedule: "3 days office", posted: "4d ago", url: "#" },
  { id: "7", role: "AI Research Intern", company: "Google", city: "Hyderabad", type: "Internship", domain: "AI / ML", level: "Fresher (0–1 yr)", skills: ["PyTorch", "NLP", "Research"], pay: "₹50,000/mo", schedule: "On-site · 4 mo", posted: "6d ago", url: "#" },
  { id: "8", role: "UX Designer", company: "Zepto", city: "Mumbai", type: "Full-Time", domain: "UI/UX Design", level: "Junior (1–3 yrs)", skills: ["Figma", "User Research", "Prototyping"], pay: "₹8–12 LPA", schedule: "Hybrid", posted: "2d ago", url: "#" },
  { id: "9", role: "Cybersecurity Analyst", company: "Infosys", city: "Pune", type: "Full-Time", domain: "Cybersecurity", level: "Junior (1–3 yrs)", skills: ["SIEM", "Networking", "Pen Testing"], pay: "₹9–13 LPA", schedule: "On-site", posted: "1w ago", url: "#" },
  { id: "10", role: "Android Developer Intern", company: "PhonePe", city: "Bengaluru", type: "Internship", domain: "Mobile Dev", level: "Fresher (0–1 yr)", skills: ["Kotlin", "Jetpack", "REST"], pay: "₹35,000/mo", schedule: "Hybrid · 6 mo", posted: "3d ago", url: "#" },
];

const TYPE_COLORS: Record<EmpType, string> = {
  "Full-Time": "border-primary/40 text-primary bg-primary/10",
  Remote: "border-success/40 text-success bg-success/10",
  Hybrid: "border-warning/40 text-warning bg-warning/10",
  Internship: "border-pink-500/40 text-pink-400 bg-pink-500/10",
};

function OpportunitiesPage() {
  const { user } = useAuth();
  const [city, setCity] = useState("All Cities");
  const [domain, setDomain] = useState("All Domains");
  const [level, setLevel] = useState("Any Level");
  const [activeTypes, setActiveTypes] = useState<EmpType[]>([]);
  const [sortBy, setSortBy] = useState<"match" | "latest" | "pay" | "fit">("match");
  const [resumeKeywords, setResumeKeywords] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const analyses = localDb.getAnalyses(user.id);
    const latest = analyses[0];
    if (!latest) return;
    const strengths = (latest.strengths as string[] | null) ?? [];
    setResumeKeywords(strengths.map((s) => s.toLowerCase()));
  }, [user]);

  const toggleType = (t: EmpType) => {
    setActiveTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const reset = () => {
    setCity("All Cities");
    setDomain("All Domains");
    setLevel("Any Level");
    setActiveTypes([]);
  };

  const filtered = useMemo(() => {
    let list = JOBS.filter((j) => {
      if (city !== "All Cities" && j.city !== city) return false;
      if (domain !== "All Domains" && j.domain !== domain) return false;
      if (level !== "Any Level" && j.level !== level) return false;
      if (activeTypes.length && !activeTypes.includes(j.type)) return false;
      return true;
    });

    if (sortBy === "latest") {
      // crude posted-date sort using string heuristic
      const order = (p: string) => (p.includes("h") ? 0 : parseInt(p) || 99);
      list = [...list].sort((a, b) => order(a.posted) - order(b.posted));
    } else if (sortBy === "pay") {
      const num = (p: string) => parseInt(p.replace(/[^\d]/g, "")) || 0;
      list = [...list].sort((a, b) => num(b.pay) - num(a.pay));
    }
    return list;
  }, [city, domain, level, activeTypes, sortBy]);

  const calcMatch = (skills: string[]): number | null => {
    if (!resumeKeywords.length) return null;
    const hits = skills.filter((s) => resumeKeywords.some((k) => k.includes(s.toLowerCase()) || s.toLowerCase().includes(k))).length;
    return Math.round((hits / skills.length) * 100);
  };

  return (
    <PageShell>
      <section className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs text-primary mb-3">
            <Briefcase className="size-3" /> Career Explorer
          </div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">Find Your Next Opportunity</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Filter by city, domain, and employment type. Every listing matched to your skill profile.
          </p>
        </div>

        {/* Filters */}
        <div
          className="rounded-2xl border p-6 mb-6"
          style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="grid sm:grid-cols-3 gap-3.5">
            <FilterSelect label="City" value={city} onChange={setCity} options={CITIES} />
            <FilterSelect label="Domain / Role" value={domain} onChange={setDomain} options={DOMAINS} />
            <FilterSelect label="Experience Level" value={level} onChange={setLevel} options={LEVELS} />
          </div>

          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Employment Type</div>
            <div className="flex flex-wrap gap-2">
              <PillBtn active={activeTypes.length === 0} onClick={() => setActiveTypes([])}>
                All Types
              </PillBtn>
              {EMP_TYPES.map((t) => (
                <PillBtn key={t} active={activeTypes.includes(t)} onClick={() => toggleType(t)}>
                  {iconForType(t)} {t}
                </PillBtn>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2">
              <Button size="sm" className="gradient-cyan text-primary-foreground" onClick={() => { /* filtering is reactive */ }}>
                Apply Filters
              </Button>
              <Button size="sm" variant="ghost" onClick={reset}>
                Reset
              </Button>
            </div>
            <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
              <Sparkles className="size-3 text-primary" /> Tip: scan your resume to unlock ATS match scores
            </div>
          </div>
        </div>

        {/* Result bar */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-medium">{filtered.length}</span> opportunit
            {filtered.length === 1 ? "y" : "ies"}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs bg-[#0b1628] border border-border/50 rounded-md px-2 py-1.5 text-foreground"
          >
            <option value="match">Best Match</option>
            <option value="latest">Latest</option>
            <option value="pay">Stipend / Pay High → Low</option>
            <option value="fit">ATS Fit</option>
          </select>
        </div>

        {/* Job cards */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/40 p-10 text-center" style={{ background: "#0b1628" }}>
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="font-display text-xl">No opportunities match your filters</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try expanding your city selection or switching to Remote.
            </p>
            <Button onClick={reset} className="mt-5 gradient-cyan text-primary-foreground">
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((j) => {
              const match = calcMatch(j.skills);
              return (
                <article
                  key={j.id}
                  className="rounded-2xl border p-5 transition hover:-translate-y-0.5"
                  style={{ background: "#0b1628", borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-start gap-4 flex-wrap">
                    <div
                      className="size-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
                      style={{ background: "rgba(0,229,255,0.12)", color: "#00e5ff" }}
                    >
                      {j.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="font-display text-lg leading-tight">{j.role}</h3>
                        <Badge variant="outline" className={`text-[10px] ${TYPE_COLORS[j.type]}`}>
                          {j.type}
                        </Badge>
                        {match !== null && (
                          <Badge
                            variant="outline"
                            className={
                              match > 70
                                ? "border-success/40 text-success bg-success/10 text-[10px]"
                                : match >= 50
                                  ? "border-warning/40 text-warning bg-warning/10 text-[10px]"
                                  : "border-pink-500/40 text-pink-400 bg-pink-500/10 text-[10px]"
                            }
                          >
                            {match > 70 ? "Great fit ✓" : match >= 50 ? "Good fit" : "Skill gap"} · {match}%
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-1.5">
                        <Building2 className="size-3" /> {j.company}
                        <span className="opacity-40">·</span>
                        <MapPin className="size-3" /> {j.city}
                        <span className="opacity-40">·</span>
                        <span>{j.posted}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {j.skills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: "#0f1f35", color: "#7a9bb5", border: "1px solid rgba(255,255,255,0.05)" }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-medium text-foreground">{j.pay}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{j.schedule}</div>
                      <a
                        href={j.url}
                        className="inline-flex items-center gap-1 text-xs text-primary mt-3 hover:gap-2 transition-all"
                      >
                        View & Apply <ArrowRight className="size-3" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!user && (
          <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm flex items-center gap-3 flex-wrap">
            <GraduationCap className="size-4 text-primary shrink-0" />
            <span className="text-muted-foreground flex-1">
              Sign in and scan your resume to see ATS-match scores on every role.
            </span>
            <Button asChild size="sm" className="gradient-cyan text-primary-foreground">
              <Link to="/auth">Get Started Free</Link>
            </Button>
          </div>
        )}
      </section>
    </PageShell>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground block mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0f1f35] border border-border/50 rounded-md px-3 py-2 text-sm text-foreground focus:border-primary/60 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function PillBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition border"
      style={{
        borderColor: active ? "rgba(0,229,255,0.5)" : "rgba(255,255,255,0.08)",
        background: active ? "rgba(0,229,255,0.08)" : "transparent",
        color: active ? "#00e5ff" : "#7a9bb5",
      }}
    >
      {children}
    </button>
  );
}

function iconForType(t: EmpType) {
  if (t === "Remote") return <Wifi className="size-3" />;
  if (t === "Internship") return <GraduationCap className="size-3" />;
  if (t === "Hybrid") return <Search className="size-3" />;
  return <Building2 className="size-3" />;
}
