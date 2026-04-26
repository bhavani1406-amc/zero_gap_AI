import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { TypewriterRotator } from "@/components/TypewriterRotator";
import { TechTrendChart } from "@/components/TechTrendChart";
import { IndiaHeatmap } from "@/components/IndiaHeatmap";
import { Testimonials } from "@/components/Testimonials";
import {
  ArrowRight, BarChart3, Brain, Cpu, FileSearch, Gauge,
  MapPin, MessagesSquare, Rocket, ShieldCheck, Sparkles,
  GraduationCap, Calendar,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZeroGap AI — Be the Signal, not the Noise" },
      { name: "description", content: "Upload your resume. Get your ATS score in 60 seconds. Fix the exact gaps keeping you from getting shortlisted. Free for Indian college students." },
      { property: "og:title", content: "Be the Signal, not the Noise." },
      { property: "og:description", content: "Know your ATS score in 60 seconds. Built for Indian students. Free for college emails." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: FileSearch, title: "Know exactly why you're getting rejected", desc: "Upload your resume in any format. Get your ATS score, a list of missing keywords, and specific fixes — in under 60 seconds.", cta: "Scan My Resume", to: "/resume-analysis" as const },
  { icon: BarChart3, title: "See which skills are paying off in your city right now", desc: "Real-time job trend data for 8 tech roles across India. AI projects which skills will rise in the next 2–3 years.", cta: "View Trends", to: "/market-mapping" as const },
  { icon: MessagesSquare, title: "Turn rejection into a comeback plan", desc: "An AI mentor that validates your frustration, identifies what went wrong, and gives you a clear 3-step path back — without the corporate fluff.", cta: "Talk to Coach", to: "/confidence-coach" as const },
  { icon: Calendar, title: "From 'missing skills' to interview-ready in 2 days", desc: "Tell ZeroGap your target role. Get a precise 48-hour plan of tasks, resources, and milestones to close your skill gap.", cta: "Build My Roadmap", to: "/micro-roadmap" as const },
  { icon: MapPin, title: "Only see internships you can actually attend", desc: "Filter by distance from your college, schedule compatibility, and your skill set. No more missing out because the office is too far.", cta: "Find Near Me", to: "/localized-intelligence" as const },
  { icon: GraduationCap, title: "Get your entire T&P cell using ZeroGap — free", desc: "A white-label dashboard for Training & Placement officers. Track college-wide ATS scores, top skill gaps, and placement-ready students.", cta: "Partner With Us", to: "/campus-partnership" as const },
];

const steps = [
  { n: "01", title: "Upload Resume", desc: "Drag any format — we parse on-device.", to: "/resume-analysis" as const },
  { n: "02", title: "Get ATS Score", desc: "Honest, recruiter-grade diagnostic.", to: "/resume-analysis" as const },
  { n: "03", title: "Bridge the Gap", desc: "Receive your custom 48h roadmap.", to: "/micro-roadmap" as const },
  { n: "04", title: "Hit Submit", desc: "Apply with verified market readiness.", to: "/market-mapping" as const },
];

const heroStats = [
  { to: 14200, label: "Students helped", suffix: "+", duration: 2000, liveTickMs: 8000 },
  { to: 91, label: "ATS improvement rate", suffix: "%", duration: 1500 },
  { to: 50, label: "Campus partners", suffix: "+", duration: 1800 },
  { to: 48, label: "Hours to market-ready", suffix: "h", duration: 1000 },
];

const rotatingWords = ["CSE students", "future engineers", "first-gen coders", "Tier 2 college grads", "rejected applicants", "underconfident dreamers"];

function Landing() {
  return (
    <PageShell showFounder>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute top-1/3 left-1/4 size-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 size-96 rounded-full bg-cyan/10 blur-3xl" />

        <div className="container mx-auto px-6 relative" style={{ paddingTop: "var(--space-7)", paddingBottom: "var(--space-7)" }}>
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs text-primary mb-6">
                <Sparkles className="size-3" />
                <span>Built on AMD Ryzen AI · 60 TOPS NPU</span>
              </div>

              <h1 className="hero-headline font-display tracking-tight">
                Be the Signal,<br />not the Noise.
              </h1>

              <p className="font-display italic mt-3 text-2xl md:text-3xl" style={{ color: "#00e5ff", fontWeight: 400 }}>
                ZeroGap makes your resume impossible to ignore.
              </p>

              <p className="mt-6 text-lg max-w-[52ch] mx-auto lg:mx-0" style={{ color: "#94a3b8" }}>
                Upload your resume. Get your ATS score in 60 seconds. Fix the exact gaps keeping you from getting shortlisted.
              </p>

              <div className="mt-6 text-xs text-muted-foreground italic">
                Trusted by <TypewriterRotator words={rotatingWords} />
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center">
                <Button size="lg" asChild className="gradient-cyan text-primary-foreground hover:opacity-90 glow-cyan" style={{ padding: "14px 28px", fontSize: 16 }}>
                  <Link to="/auth">Check My ATS Score</Link>
                </Button>
                <Link to="/resume-analysis" className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline">
                  See how it works (60 sec) →
                </Link>
              </div>

              {/* Stat bar */}
              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 justify-center lg:justify-start text-xs text-muted-foreground">
                <span><span className="text-foreground font-medium">2,400+</span> resumes analyzed</span>
                <span className="opacity-40">|</span>
                <span><span className="text-foreground font-medium">89%</span> saw ATS improvement</span>
                <span className="opacity-40">|</span>
                <span><span className="text-foreground font-medium">12</span> colleges in beta</span>
              </div>
            </motion.div>

            <div className="hidden lg:block">
              <TechTrendChart />
            </div>
          </div>

          {/* Animated stats row */}
          <Reveal as="div" className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 max-w-4xl mx-auto md:divide-x md:divide-border/50">
            {heroStats.map((s) => (
              <div key={s.label} className="text-center px-4 py-3">
                <div className="font-display text-[#00e5ff]" style={{ fontSize: 40, lineHeight: 1.1, fontWeight: 400 }}>
                  <AnimatedCounter to={s.to} duration={s.duration} suffix={s.suffix} liveTickMs={s.liveTickMs} />
                </div>
                <div className="text-xs md:text-sm text-[#94a3b8] mt-2">{s.label}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-widest text-primary mb-2">Features</div>
          <h2 className="font-display text-3xl md:text-5xl">Six tools. One outcome: <span className="text-gradient-cyan">recruiter-readiness</span>.</h2>
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <Link to={f.to} className="block group h-full">
                <div className="glass-card h-full" style={{ padding: "var(--space-3)" }}>
                  <div className="size-11 rounded-[10px] flex items-center justify-center mb-4 group-hover:scale-110 transition" style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)" }}>
                    <f.icon className="size-5 text-primary" />
                  </div>
                  <h3 className="font-display text-lg mb-2 leading-snug">{f.title}</h3>
                  <p className="text-sm text-muted-foreground" style={{ maxWidth: "60ch" }}>{f.desc}</p>
                  <div className="flex items-center gap-1 text-primary text-sm mt-4 font-medium group-hover:gap-2 transition-all">
                    {f.cta} <ArrowRight className="size-3.5" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* How it works */}
      <section className="container mx-auto px-6 py-20 border-t border-border/50">
        <Reveal className="text-center mb-14">
          <div className="text-xs uppercase tracking-widest text-primary mb-2">How it works</div>
          <h2 className="font-display text-3xl md:text-5xl">From confused to <span className="text-gradient-cyan">callback</span> in 4 steps.</h2>
        </Reveal>
        <div className="grid md:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 150}>
              <Link to={s.to} className="group block h-full">
                <div className="glass-card h-full" style={{ padding: "var(--space-3)" }}>
                  <div className="text-4xl font-display text-primary/40 group-hover:text-primary transition">{s.n}</div>
                  <div className="font-display text-lg mt-2">{s.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.desc}</div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="container mx-auto px-6 py-20 border-t border-border/50">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <div className="text-xs uppercase tracking-widest text-primary mb-2">Architecture</div>
            <h2 className="font-display text-3xl md:text-4xl mb-4">Engineered for the <span className="text-gradient-cyan">AMD Ryzen AI</span> stack.</h2>
            <p className="text-muted-foreground mb-6" style={{ maxWidth: "60ch" }}>Hybrid AI ecosystem leveraging XDNA 2 NPU, Lemonade SDK, and AMD Quark quantization for blazing-fast on-device inference at 40% better battery efficiency than cloud competitors.</p>
            <div className="space-y-3">
              {[
                { i: Cpu, t: "ONNX Runtime + Vitis AI EP", d: "60 TOPS NPU offload for resume parsing & ATS scoring." },
                { i: Brain, t: "Lemonade SDK + Llama-3-8B", d: "Hybrid NPU/iGPU pipeline at BF16 — 2× lower latency." },
                { i: ShieldCheck, t: "Privacy-First OCR", d: "All PII extraction runs locally; data never leaves your device." },
                { i: Gauge, t: "AMD Quark PTQ", d: "128MB footprint — runs on any Ryzen AI laptop." },
              ].map((x, i) => (
                <Reveal key={x.t} delay={i * 80}>
                  <div className="glass-card flex gap-3 p-3">
                    <x.i className="size-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">{x.t}</div>
                      <div className="text-xs text-muted-foreground">{x.d}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="aspect-square rounded-3xl glass-card p-8 relative overflow-hidden">
              <div className="absolute inset-0 grid-pattern opacity-30" />
              <div className="relative h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="text-xs text-muted-foreground">Hybrid Pipeline</div>
                  <div className="size-2 rounded-full bg-success animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {["NPU XDNA 2", "Radeon iGPU", "Llama-3-8B", "Vitis AI"].map((b) => (
                    <div key={b} className="p-3 rounded-lg bg-background/40 border border-primary/20 text-center text-xs font-medium">{b}</div>
                  ))}
                </div>
                <div className="text-3xl font-display text-gradient-cyan">60 TOPS</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* India heatmap */}
      <IndiaHeatmap />

      {/* CTA */}
      <section className="container mx-auto px-6 py-20">
        <Reveal>
          <div className="rounded-3xl glass-card p-10 md:p-16 text-center relative overflow-hidden" style={{ borderColor: "rgba(0,229,255,0.3)" }}>
            <div className="absolute inset-0 grid-pattern opacity-20" />
            <div className="relative">
              <Rocket className="size-12 text-primary mx-auto mb-4" />
              <h2 className="font-display text-3xl md:text-5xl mb-4">Ready to be <span className="text-gradient-cyan">market-ready</span>?</h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Join the 48-hour challenge. Free for all undergraduates.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" asChild className="gradient-cyan text-primary-foreground glow-cyan">
                  <Link to="/auth">Create Free Account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/campus-partnership"><GraduationCap className="size-4 mr-1" /> For colleges</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
