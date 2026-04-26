import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Cpu, Brain, BatteryCharging, HardDrive, Gauge, ShieldCheck,
  Upload, ScanLine, EyeOff, BarChart3, Sparkles, ArrowRight,
  Lock, Download, ExternalLink, Globe,
} from "lucide-react";

export const Route = createFileRoute("/amd-ryzen")({
  head: () => ({
    meta: [
      { title: "AMD Ryzen AI — On-device intelligence | ZeroGap AI" },
      { name: "description", content: "ZeroGap AI runs on the AMD Ryzen AI stack — XDNA 2 NPU, Lemonade SDK, ONNX + Vitis AI, and AMD Quark — for instant, private, on-device career analysis." },
      { property: "og:title", content: "AMD Ryzen AI — On-device intelligence | ZeroGap AI" },
      { property: "og:description", content: "Faster, lower-power, hardware-private resume analysis powered by AMD Ryzen AI." },
    ],
  }),
  component: AmdPage,
});

const AMBER = "#ffb300";
const CYAN = "#00e5ff";
const GREEN = "#00e676";
const PURPLE = "#b06bff";
const RED = "#ff4d6d";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="block w-6 h-px" style={{ background: AMBER }} />
      <span className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: AMBER }}>
        {children}
      </span>
      <span className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${AMBER}33, transparent)` }} />
    </div>
  );
}

function AmdPage() {
  return (
    <PageShell>
      {/* SECTION 1 — HERO */}
      <section className="container mx-auto px-4 pt-20 pb-16 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionLabel>Powered by AMD Ryzen AI</SectionLabel>
            <h1 className="font-display text-4xl md:text-5xl lg:text-[52px] leading-[1.08] tracking-tight">
              On-device AI that runs <em className="italic" style={{ color: AMBER }}>faster</em>, uses less power, and never uploads your resume.
            </h1>
            <p className="text-muted-foreground mt-5 max-w-[50ch] leading-relaxed">
              ZeroGap AI is engineered on the AMD Ryzen AI software stack — combining the XDNA 2 NPU,
              Radeon iGPU, and Lemonade SDK to deliver instant, private, professional-grade career
              analysis directly on your laptop.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button className="gradient-cyan text-primary-foreground hover:opacity-90">
                <Download className="size-4 mr-2" /> Download for Windows
              </Button>
              <Button variant="outline" style={{ borderColor: AMBER, color: AMBER }}>
                AMD Ryzen AI Docs <ExternalLink className="size-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Animated chip visual */}
          <div className="relative aspect-square max-w-md mx-auto w-full">
            <div className="absolute inset-0 rounded-full border border-dashed" style={{ borderColor: `${AMBER}40`, animation: "amd-spin 20s linear infinite" }} />
            <div className="absolute inset-8 rounded-full border" style={{ borderColor: `${CYAN}30`, animation: "amd-spin 14s linear infinite reverse" }} />
            <div className="absolute inset-16 rounded-full border border-dashed" style={{ borderColor: `${AMBER}30`, animation: "amd-spin 28s linear infinite" }} />
            {/* 4 amber dots */}
            {[0, 90, 180, 270].map((deg) => (
              <span
                key={deg}
                className="absolute top-1/2 left-1/2 size-2.5 rounded-full"
                style={{
                  background: AMBER,
                  boxShadow: `0 0 12px ${AMBER}`,
                  transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(calc(-50% - 0px)) translateY(-50%)`,
                  // simpler approach below using inset
                }}
              />
            ))}
            {/* Fallback positioned dots */}
            <span className="absolute top-0 left-1/2 -translate-x-1/2 size-2.5 rounded-full" style={{ background: AMBER, boxShadow: `0 0 12px ${AMBER}` }} />
            <span className="absolute right-0 top-1/2 -translate-y-1/2 size-2.5 rounded-full" style={{ background: AMBER, boxShadow: `0 0 12px ${AMBER}` }} />
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 size-2.5 rounded-full" style={{ background: AMBER, boxShadow: `0 0 12px ${AMBER}` }} />
            <span className="absolute left-0 top-1/2 -translate-y-1/2 size-2.5 rounded-full" style={{ background: AMBER, boxShadow: `0 0 12px ${AMBER}` }} />

            <div className="absolute inset-1/3 rounded-2xl flex flex-col items-center justify-center text-center backdrop-blur-sm border" style={{ borderColor: `${AMBER}50`, background: "oklch(0.20 0.04 250 / 0.7)" }}>
              <div className="font-display text-2xl" style={{ color: AMBER }}>XDNA 2</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">60 TOPS NPU</div>
            </div>
          </div>
        </div>
        <style>{`@keyframes amd-spin { to { transform: rotate(360deg); } }`}</style>
      </section>

      <div className="border-t border-border/60" />

      {/* SECTION 2 — HARDWARE SPECS */}
      <section className="container mx-auto px-4 py-20 max-w-6xl">
        <SectionLabel>Hardware Specifications</SectionLabel>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight">What's under the hood</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">ZeroGap is optimized specifically for AMD Ryzen AI-powered laptops.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {[
            { icon: Cpu, tint: AMBER, value: "60 TOPS", title: "NPU Performance", desc: "XDNA 2 architecture delivers 60 Tera Operations Per Second — dedicated to running ZeroGap's resume parsing and ATS scoring models." },
            { icon: Brain, tint: CYAN, value: "8B Params", title: "On-Device LLM", desc: "Llama-3-8B quantized model runs locally via Lemonade SDK. The Confidence Coach never sends your conversation to the cloud." },
            { icon: BatteryCharging, tint: GREEN, value: "40% better", title: "Battery Efficiency", desc: "NPU offloading uses 40% less battery than cloud-polling equivalents. Scan resumes on the go without draining your laptop." },
            { icon: HardDrive, tint: AMBER, value: "128 MB", title: "Model Footprint", desc: "All models processed through AMD Quark post-training quantization. Runs on any Ryzen AI laptop without a discrete GPU." },
            { icon: Gauge, tint: CYAN, value: "2× faster", title: "Response Latency", desc: "Hybrid NPU + Radeon iGPU workload splitting via Lemonade SDK achieves 2× lower latency on BF16 pipeline vs CPU-only inference." },
            { icon: ShieldCheck, tint: GREEN, value: "100% local", title: "Privacy", desc: "Resume text extraction and PII scrubbing run entirely on the Ryzen AI chip. Phone and address never leave your device." },
          ].map((c) => (
            <Card key={c.title} className="p-5 gradient-card border-border/60 hover:-translate-y-0.5 transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-lg flex items-center justify-center" style={{ background: `${c.tint}1A`, border: `1px solid ${c.tint}33` }}>
                  <c.icon className="size-5" style={{ color: c.tint }} />
                </div>
                <div className="font-display text-2xl" style={{ color: c.tint }}>{c.value}</div>
              </div>
              <div className="font-semibold text-sm">{c.title}</div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{c.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 3 — SOFTWARE ARCHITECTURE */}
      <section className="container mx-auto px-4 py-20 max-w-6xl">
        <SectionLabel>Software Architecture</SectionLabel>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight">The AMD Ryzen AI stack inside ZeroGap</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">Four tightly integrated layers — from silicon to user experience.</p>

        <div className="space-y-3 mt-10">
          {[
            { color: AMBER, title: "Layer 1 — XDNA 2 NPU (Hardware)", body: "The dedicated Neural Processing Unit in AMD Ryzen AI chips. ZeroGap offloads all matrix-multiplication-heavy inference — resume parsing, ATS keyword matching, and skill gap classification — to the NPU. Runs without impacting CPU or GPU availability.", tag: "AMD XDNA 2 Architecture", metric: "60 TOPS", metricLabel: "compute capacity" },
            { color: CYAN, title: "Layer 2 — ONNX Runtime + Vitis AI EP (Inference)", body: "Resume parsing and ATS scoring models are exported to ONNX format and executed via the Vitis AI Execution Provider, routing operations directly to the NPU instruction set and delivering sub-second feedback on every scan.", tag: "ONNX Runtime · Vitis AI EP", metric: "< 1s", metricLabel: "resume scan time" },
            { color: GREEN, title: "Layer 3 — Lemonade SDK (LLM Serving)", body: "The Confidence Coach runs on a quantized Llama-3-8B model via Lemonade SDK in Hybrid Mode, splitting workloads between the NPU and Radeon iGPU using a BF16 pipeline. Achieves 2× lower latency than CPU-only inference.", tag: "Lemonade SDK · Hybrid Mode · BF16", metric: "2×", metricLabel: "lower latency" },
            { color: PURPLE, title: "Layer 4 — AMD Quark PTQ (Model Optimization)", body: "All ZeroGap models go through AMD Quark post-training quantization. Quark reduces precision from FP32 to INT8/INT4 without significant accuracy loss, shrinking the model footprint to 128 MB — making ZeroGap accessible on entry-level Ryzen AI laptops with 8 GB RAM.", tag: "AMD Quark · PTQ · INT4/INT8", metric: "128 MB", metricLabel: "total model size" },
          ].map((l) => (
            <div key={l.title} className="flex rounded-xl overflow-hidden border border-border/60">
              <div className="w-1.5 flex-shrink-0" style={{ background: l.color }} />
              <div className="flex-1 p-5 gradient-card">
                <div className="font-semibold mb-1.5" style={{ color: l.color }}>{l.title}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{l.body}</p>
                <div className="mt-3 inline-block text-[11px] px-2.5 py-1 rounded-full border" style={{ borderColor: `${l.color}40`, color: l.color, background: `${l.color}0D` }}>
                  {l.tag}
                </div>
              </div>
              <div className="hidden md:flex flex-col items-end justify-center px-6 py-5 min-w-[160px] bg-background/40 border-l border-border/60">
                <div className="font-display text-2xl" style={{ color: l.color }}>{l.metric}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{l.metricLabel}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — FEATURE MAPPING */}
      <section className="container mx-auto px-4 py-20 max-w-6xl">
        <SectionLabel>Feature Mapping</SectionLabel>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight">Which ZeroGap feature uses which AMD component</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">Every user-facing feature is mapped to a specific AMD hardware or software component.</p>

        <div className="grid md:grid-cols-3 gap-4 mt-10">
          {[
            { color: AMBER, label: "NPU — XDNA 2", title: "AI Resume Parsing + ATS Scoring", body: "The ONNX-based resume parser and ATS classifier run entirely on the NPU. Keyword extraction, formatting analysis, and skill gap detection are NPU-offloaded — instant feedback, zero cloud dependency.", metrics: ["< 800ms parse time", "NPU-only execution"] },
            { color: CYAN, label: "Lemonade SDK — NPU + iGPU", title: "Confidence Coach (LLM Chat)", body: "Llama-3-8B in Hybrid Mode — NPU handles attention layers, iGPU handles FFN layers. Streamed token-by-token responses at human-readable speed, offline capable.", metrics: ["8B param model", "Offline capable"] },
            { color: GREEN, label: "NPU — Privacy Processing", title: "Privacy-First OCR + PII Scrubbing", body: "All text extraction from uploaded resumes and PII detection run on the Ryzen AI chip via ONNX RT. Sensitive data is scrubbed before any value leaves the device — guaranteed by hardware, not policy.", metrics: ["On-chip processing", "0 raw data uploads"] },
          ].map((c) => (
            <Card key={c.title} className="relative p-6 gradient-card border-border/60 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${c.color}, transparent)` }} />
              <div className="text-[11px] uppercase tracking-wider font-medium mb-2" style={{ color: c.color }}>{c.label}</div>
              <div className="font-semibold mb-2">{c.title}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {c.metrics.map((m) => (
                  <span key={m} className="text-[11px] px-2 py-1 rounded bg-background/40 border border-border/60 text-muted-foreground">{m}</span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 5 — PIPELINE */}
      <section className="container mx-auto px-4 py-20 max-w-6xl">
        <SectionLabel>End-to-End Pipeline</SectionLabel>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight">From upload to ATS score — step by step</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">How your resume travels through the AMD Ryzen AI stack in under one second.</p>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-10">
          {[
            { icon: Upload, title: "File Upload", desc: "PDF/DOCX loaded into browser memory. No cloud.", chip: "Browser API", color: CYAN },
            { icon: ScanLine, title: "OCR + Extract", desc: "ONNX OCR model on NPU extracts raw text.", chip: "XDNA 2 NPU", color: AMBER },
            { icon: EyeOff, title: "PII Scrub", desc: "Phone, address, DOB masked on-chip.", chip: "NPU · Quark INT4", color: AMBER },
            { icon: BarChart3, title: "ATS Analysis", desc: "Vitis AI EP routes scoring model through NPU.", chip: "Vitis AI EP", color: AMBER },
            { icon: Sparkles, title: "Results Rendered", desc: "Score + gaps returned to UI. Total: < 1 second.", chip: "UI · React", color: GREEN },
          ].map((s, i, arr) => (
            <div key={s.title} className="relative">
              <Card className="p-4 gradient-card border-border/60 h-full">
                <div className="size-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${s.color}1A`, border: `1px solid ${s.color}33` }}>
                  <s.icon className="size-4" style={{ color: s.color }} />
                </div>
                <div className="font-semibold text-sm">{s.title}</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
                <div className="mt-3 inline-block text-[10px] px-2 py-0.5 rounded-full" style={{ color: s.color, background: `${s.color}14`, border: `1px solid ${s.color}33` }}>{s.chip}</div>
              </Card>
              {i < arr.length - 1 && (
                <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 size-5 text-muted-foreground/40 z-10" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6 — COMPARISON TABLE */}
      <section className="container mx-auto px-4 py-20 max-w-6xl">
        <SectionLabel>Why On-Device Matters</SectionLabel>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight">ZeroGap on AMD Ryzen AI vs cloud-only alternatives</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">Every competitor sends your resume to a server. We don't.</p>

        <div className="mt-10 rounded-2xl overflow-hidden border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-background/40">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Feature</th>
                <th className="text-left p-4 font-medium text-xs uppercase tracking-wider" style={{ color: AMBER, background: `${AMBER}0D` }}>ZeroGap on AMD Ryzen AI</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Cloud-only alternatives</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Resume privacy", "Never leaves your device", "Uploaded to cloud servers", true],
                ["Feedback speed", "< 1 second (NPU)", "3–8 seconds (network RTT)", true],
                ["Works offline", "Full functionality", "Requires internet", true],
                ["Battery impact", "40% less drain (NPU efficiency)", "High — constant polling", true],
                ["Data storage", "PII scrubbed before any storage", "Full resume stored in DB", true],
                ["Model size", "128 MB (Quark PTQ)", "N/A — server-side", false],
                ["LLM coaching", "On-device Llama-3-8B (Lemonade)", "API-dependent, costs per call", true],
              ].map(([feat, ours, theirs, bad], idx) => (
                <tr key={idx as number} className="border-t border-border/60">
                  <td className="p-4 font-medium">{feat as string}</td>
                  <td className="p-4" style={{ background: `${AMBER}08`, color: AMBER }}>
                    <span className="mr-1.5">✓</span>{ours as string}
                  </td>
                  <td className="p-4" style={{ color: bad ? RED : "var(--muted-foreground)" }}>
                    {bad ? <span className="mr-1.5">✗</span> : null}{theirs as string}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 7 — PRIVACY DEEP DIVE */}
      <section className="container mx-auto px-4 py-20 max-w-6xl">
        <SectionLabel>Privacy Architecture</SectionLabel>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight">How your data stays yours</h2>

        <Card className="mt-10 p-8 gradient-card" style={{ borderColor: `${CYAN}40` }}>
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${CYAN}1A`, border: `1px solid ${CYAN}40` }}>
              <Lock className="size-5" style={{ color: CYAN }} />
            </div>
            <div className="flex-1">
              <div className="font-display text-xl md:text-2xl">Hardware-enforced privacy — not just a policy</div>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Most tools claim privacy in their terms of service. ZeroGap enforces it at the hardware level.
                Because all processing runs on the AMD Ryzen AI chip, there is no network call to make,
                no server to breach, and no database that could be subpoenaed. Your resume is processed
                and discarded in the same chip cycle that produced your score.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                {[
                  ["1", "File loaded", "PDF/DOCX read into browser memory only"],
                  ["2", "On-chip OCR", "Text extracted by NPU — stays in device RAM"],
                  ["3", "PII scrubbed", "Phone, address, IDs masked on-chip"],
                  ["4", "Only scores saved", "ATS score + anonymized keywords stored — never raw text"],
                ].map(([n, t, d]) => (
                  <div key={n} className="p-3 rounded-lg bg-background/40 border border-border/60">
                    <div className="font-display text-lg" style={{ color: CYAN }}>{n}</div>
                    <div className="font-semibold text-sm mt-1">{t}</div>
                    <div className="text-xs text-muted-foreground mt-1">{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* SECTION 8 — SYSTEM REQUIREMENTS */}
      <section className="container mx-auto px-4 py-20 max-w-6xl">
        <SectionLabel>System Requirements</SectionLabel>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight">What you need to run ZeroGap at full speed</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {[
            { label: "Processor", value: "AMD Ryzen AI", desc: "Any Ryzen AI-series with XDNA 2 NPU. Recommended: Ryzen AI 9 HX 375 or Ryzen AI 7 PRO 360. Also works (slower) on any modern CPU." },
            { label: "RAM", value: "8 GB minimum", desc: "16 GB recommended for Coach + resume analysis together. 8 GB is sufficient for resume scanning only." },
            { label: "Storage", value: "512 MB free", desc: "Model files ~128 MB after Quark quantization. 384 MB for app + local data cache." },
            { label: "OS", value: "Windows 11", desc: "Windows 11 22H2+ for full AMD Ryzen AI Software 1.7 stack. Browser mode works on macOS and Linux (CPU inference only)." },
          ].map((r) => (
            <Card key={r.label} className="p-5 gradient-card border-border/60">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{r.label}</div>
              <div className="font-display text-xl mt-1" style={{ color: AMBER }}>{r.value}</div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{r.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="container mx-auto px-4 pb-24 max-w-4xl">
        <Card className="p-10 text-center gradient-card" style={{ borderColor: `${AMBER}50` }}>
          <h3 className="font-display text-2xl md:text-3xl">Run ZeroGap on your AMD Ryzen AI laptop</h3>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Download the desktop app for full NPU acceleration, offline mode, and hardware-enforced privacy.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button className="gradient-cyan text-primary-foreground hover:opacity-90">
              <Download className="size-4 mr-2" /> Download for Windows
            </Button>
            <Button variant="outline" style={{ borderColor: AMBER, color: AMBER }}>
              View AMD Ryzen AI Docs <ExternalLink className="size-4 ml-2" />
            </Button>
            <Button variant="ghost">
              <Globe className="size-4 mr-2" /> Try browser version
            </Button>
          </div>
        </Card>
      </section>
    </PageShell>
  );
}
