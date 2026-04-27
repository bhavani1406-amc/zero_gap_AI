import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Building2, Wifi, Search, X, Target, ExternalLink, Briefcase } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/localized-intelligence")({
  head: () => ({ meta: [{ title: "Localized Intelligence — ZeroGap AI" }] }),
  component: LocalizedPage,
});

const CITIES = ["Bengaluru", "Hyderabad", "Mumbai", "Pune", "Delhi NCR", "Chennai", "Kolkata", "Ahmedabad"];

const ALL_CITIES = [
  "Agartala","Agra","Ahmedabad","Aizawl","Ajmer","Aligarh","Allahabad","Alwar","Ambala",
  "Amravati","Amritsar","Anand","Anantapur","Asansol","Aurangabad","Bareilly","Bengaluru",
  "Bhilai","Bhiwandi","Bhopal","Bhubaneswar","Bikaner","Bilaspur","Chandigarh","Chennai",
  "Coimbatore","Cuttack","Dehradun","Delhi NCR","Dhanbad","Dharamshala","Dibrugarh",
  "Durgapur","Erode","Faridabad","Ghaziabad","Gandhinagar","Goa","Gorakhpur","Gurugram",
  "Guwahati","Gwalior","Haridwar","Hisar","Hubli","Hyderabad","Imphal","Indore","Itanagar",
  "Jabalpur","Jaipur","Jalandhar","Jamnagar","Jamshedpur","Jhansi","Jodhpur","Jorhat",
  "Kalaburagi","Kanpur","Kakinada","Karnal","Kochi","Kohima","Kolkata","Kota","Kozhikode",
  "Lucknow","Ludhiana","Madurai","Mangaluru","Meerut","Moradabad","Mumbai","Mussoorie",
  "Mysuru","Nagpur","Nainital","Nashik","Noida","Panaji","Patna","Pune","Raipur","Ranchi",
  "Rajkot","Rishikesh","Rohtak","Roorkee","Saharanpur","Salem","Shimla","Siliguri",
  "Silchar","Srinagar","Surat","Thane","Thiruvananthapuram","Thrissur","Tirupati",
  "Tiruchirappalli","Udaipur","Ujjain","Vadodara","Varanasi","Vijayawada","Visakhapatnam",
  "Warangal",
];

const INTERNSHIPS = [
  { company: "Google",     role: "SWE Intern",       city: "Bengaluru", stipend: "Rs.80K/mo", duration: "3 months", skills: ["Python", "ML"],        color: "#4285F4", link: "https://careers.google.com/jobs/results/?jex=Entry-Level" },
  { company: "Microsoft",  role: "SDE Intern",        city: "Hyderabad", stipend: "Rs.70K/mo", duration: "6 months", skills: ["Java", "Azure"],       color: "#00A4EF", link: "https://careers.microsoft.com/students" },
  { company: "Amazon",     role: "SDE Intern",        city: "Bengaluru", stipend: "Rs.60K/mo", duration: "6 months", skills: ["DSA", "AWS"],          color: "#FF9900", link: "https://www.amazon.jobs/en/teams/internships-for-students" },
  { company: "Zoho",       role: "Full Stack Intern", city: "Chennai",   stipend: "Rs.20K/mo", duration: "6 months", skills: ["Java", "React"],       color: "#E42527", link: "https://careers.zohocorp.com/jobs/Careers" },
  { company: "Freshworks", role: "Backend Intern",    city: "Chennai",   stipend: "Rs.25K/mo", duration: "3 months", skills: ["Ruby", "Node.js"],     color: "#25C16F", link: "https://careers.freshworks.com" },
  { company: "Infosys",    role: "Java Intern",       city: "Pune",      stipend: "Rs.15K/mo", duration: "3 months", skills: ["Java", "Spring Boot"], color: "#007CC3", link: "https://www.infosys.com/careers/apply.html" },
  { company: "Wipro",      role: "Cloud Intern",      city: "Bengaluru", stipend: "Rs.18K/mo", duration: "6 months", skills: ["AWS", "Python"],       color: "#341C6E", link: "https://careers.wipro.com/careers-home" },
  { company: "PhonePe",    role: "Android Intern",    city: "Bengaluru", stipend: "Rs.50K/mo", duration: "6 months", skills: ["Kotlin", "Android"],   color: "#5F259F", link: "https://careers.phonepe.com" },
  { company: "Swiggy",     role: "ML Intern",         city: "Bengaluru", stipend: "Rs.30K/mo", duration: "6 months", skills: ["Python", "TensorFlow"],color: "#FC8019", link: "https://careers.swiggy.com" },
  { company: "Razorpay",   role: "Frontend Intern",   city: "Bengaluru", stipend: "Rs.35K/mo", duration: "6 months", skills: ["React", "TypeScript"], color: "#2D9CDB", link: "https://razorpay.com/jobs" },
  { company: "JP Morgan",  role: "FinTech Intern",    city: "Mumbai",    stipend: "Rs.40K/mo", duration: "6 months", skills: ["Java", "Kafka"],       color: "#003087", link: "https://careers.jpmorgan.com/students" },
  { company: "Flipkart",   role: "SDE Intern",        city: "Bengaluru", stipend: "Rs.45K/mo", duration: "6 months", skills: ["Java", "React"],       color: "#F74F00", link: "https://www.flipkartcareers.com" },
];

const ALL_SKILLS = ["Java", "Python", "React", "ML", "AWS", "Android", "Node.js", "TypeScript", "Kotlin", "DSA"];

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-primary font-semibold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

type Heatmap = {
  hot_skills: { skill: string; demand_score: number; avg_openings: number }[];
  remote_friendly_pct: number;
  top_companies: string[];
  insight: string;
};

function LocalizedPage() {
  const [city, setCity] = useState<string | null>(null);
  const [data, setData] = useState<Heatmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [filtered, setFiltered] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [activeSkills, setActiveSkills] = useState<string[]>([]);

  const handleCityInput = (val: string) => {
    setInputValue(val);
    if (!val.trim()) { setShowSuggestions(false); setFiltered([]); return; }
    const results = ALL_CITIES.filter((c) => c.toLowerCase().includes(val.toLowerCase())).slice(0, 8);
    setFiltered(results);
    setShowSuggestions(results.length > 0);
    setHighlighted(-1);
  };

  const pickCity = (c: string) => {
    setInputValue(c);
    setShowSuggestions(false);
    load(c);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0 && filtered[highlighted]) pickCity(filtered[highlighted]);
      else if (inputValue.trim()) pickCity(inputValue.trim());
    } else if (e.key === "Escape") { setShowSuggestions(false); }
  };

  const toggleSkill = (skill: string) => {
    setActiveSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  };

  useEffect(() => { load("Bengaluru"); }, []);

  const load = async (c: string) => {
    setCity(c); setLoading(true); setData(null);
    try {
      const res = await fetch("/api/city-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: c }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredInternships = INTERNSHIPS.filter((i) => {
    const cityMatch = !city || i.city === city || !CITIES.includes(city);
    const skillMatch = activeSkills.length === 0 || activeSkills.some((s) => i.skills.includes(s));
    return cityMatch && skillMatch;
  });

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Localized Intelligence</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Find internships near your campus. We surface <span className="text-primary">remote-friendly</span> openings and skill data for your city.
          </p>
        </div>

        <Card className="p-5 gradient-card border-border/60 mb-6">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 font-medium">Search any Indian city</div>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input type="text" placeholder="Search any city in India..." value={inputValue}
                onChange={(e) => handleCityInput(e.target.value)} onKeyDown={handleKeyDown}
                onFocus={() => { if (filtered.length > 0) setShowSuggestions(true); }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className="w-full bg-background/60 border border-border rounded-lg pl-10 pr-9 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition" />
              {inputValue && (
                <button onClick={() => { setInputValue(""); setShowSuggestions(false); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary" type="button">
                  <X className="size-4" />
                </button>
              )}
              {showSuggestions && filtered.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-popover border border-border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                  {filtered.map((c, i) => (
                    <button key={c} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pickCity(c)} onMouseEnter={() => setHighlighted(i)}
                      className={`w-full text-left flex items-center gap-2 px-3.5 py-2 text-sm transition ${highlighted === i ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-primary/5"}`}>
                      <MapPin className="size-3.5 text-primary/70" />
                      <span><HighlightMatch text={c} query={inputValue} /></span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => { if (inputValue.trim()) pickCity(inputValue.trim()); }}
              className="gradient-cyan text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition whitespace-nowrap" type="button">
              Find Opportunities
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground/70 mr-1">Quick pick:</span>
            {CITIES.map((c) => (
              <button key={c} onClick={() => pickCity(c)}
                className={`px-3.5 py-1.5 rounded-full border text-xs transition ${city === c ? "gradient-cyan text-primary-foreground border-transparent" : "border-border hover:border-primary/60 text-muted-foreground hover:text-foreground"}`}>
                <MapPin className="size-3 inline mr-1" />{c}
              </button>
            ))}
          </div>
        </Card>

        {loading && (
          <Card className="p-12 gradient-card border-border/60 text-center mb-6">
            <Loader2 className="size-8 animate-spin text-primary mx-auto" />
            <div className="text-sm text-muted-foreground mt-3">Mapping {city}...</div>
          </Card>
        )}

        {data && !loading && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="md:col-span-2 p-6 gradient-card border-border/60">
              <h2 className="font-semibold mb-4">Skill heatmap - {city}</h2>
              <div className="space-y-3">
                {data.hot_skills.map((s) => (
                  <div key={s.skill}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{s.skill}</span>
                      <span className="text-muted-foreground text-xs">~{s.avg_openings} openings/mo - {s.demand_score}</span>
                    </div>
                    <Progress value={s.demand_score} className="h-2" />
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl bg-background/40 border border-border/60 text-sm">
                <div className="text-xs text-primary uppercase tracking-wider mb-1">Local insight</div>
                {data.insight}
              </div>
            </Card>
            <div className="space-y-4">
              <Card className="p-6 gradient-card border-border/60 text-center">
                <Wifi className="size-7 text-primary mx-auto mb-2" />
                <div className="text-4xl font-display font-bold text-gradient-cyan">{data.remote_friendly_pct}%</div>
                <div className="text-xs text-muted-foreground mt-1">remote/hybrid friendly</div>
              </Card>
              <Card className="p-5 gradient-card border-border/60">
                <div className="flex items-center gap-2 mb-3"><Building2 className="size-4 text-primary" /><div className="font-semibold text-sm">Top hiring companies</div></div>
                <div className="flex flex-wrap gap-1.5">
                  {data.top_companies.map((c) => (
                    <Badge key={c} variant="outline" className="border-primary/40 text-primary text-xs">{c}</Badge>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="size-5 text-primary" />
              <h2 className="text-xl font-bold">Available Internships 2026</h2>
              {city && CITIES.includes(city) && (
                <Badge variant="outline" className="border-primary/40 text-primary text-xs">📍 {city}</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{filteredInternships.length} opportunities found</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_SKILLS.map((s) => (
              <button key={s} onClick={() => toggleSkill(s)}
                className={`px-3 py-1 rounded-full text-xs border transition ${activeSkills.includes(s) ? "bg-primary/20 border-primary text-primary font-semibold" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredInternships.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
              No internships match your filters. Try clearing skill filters or selecting a different city.
            </div>
          ) : filteredInternships.map((i) => (
            <Card key={`${i.company}-${i.role}`} className="p-5 gradient-card border-border/60 flex flex-col gap-3 hover:border-primary/40 transition">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: i.color }}>
                  {i.company[0]}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{i.company}</div>
                  <div className="text-xs text-muted-foreground truncate">{i.role}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                  <MapPin className="size-3" />{i.city}
                </span>
                <span className="font-bold text-green-400">{i.stipend}</span>
                <span className="text-muted-foreground">⏱ {i.duration}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {i.skills.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400">{s}</span>
                ))}
              </div>
              <a href={i.link} target="_blank" rel="noopener noreferrer"
                className="mt-auto flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
                style={{ background: "#4A7C59" }}>
                Apply Now <ExternalLink className="size-3" />
              </a>
            </Card>
          ))}
        </div>

        {data && (
          <Card className="p-6 gradient-card border-primary/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="size-5 text-primary" />
                <h3 className="font-semibold text-lg">AI Mock Test - {data.hot_skills[0]?.skill ?? "Tech"}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Get tested on real recruiter questions for {data.hot_skills[0]?.skill ?? "tech"} roles in {city}.</p>
              <div className="text-xs text-muted-foreground">30 Questions - 45 Min - 100 Marks - AI Proctored</div>
            </div>
            <Button asChild className="gradient-cyan text-primary-foreground shrink-0">
              <Link to="/mock-test" search={{ domain: data.hot_skills[0]?.skill ?? "Tech", city: city ?? "Bengaluru" }}>
                Start Mock Test
              </Link>
            </Button>
          </Card>
        )}
      </section>
    </PageShell>
  );
}
