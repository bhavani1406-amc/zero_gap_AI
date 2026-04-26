import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AtsGauge } from "@/components/AtsGauge";
import { BadgeShare } from "@/components/BadgeShare";
import { PeerComparison } from "@/components/PeerComparison";
import { KeywordHighlight } from "@/components/KeywordHighlight";
import { FeedbackButtons } from "@/components/FeedbackButtons";
import { SkillRing } from "@/components/SkillRing";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Sparkles, History, GitCompare, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { toast } from "sonner";
import { useAuth, logActivity } from "@/lib/auth";
import { anonymousName } from "@/lib/anonymous-name";
import { localDb } from "@/lib/local-db";

export const Route = createFileRoute("/resume-analysis")({
  head: () => ({ meta: [{ title: "Resume Analysis — ZeroGap AI" }] }),
  component: ResumePage,
});

type Analysis = {
  ats_score: number;
  trend_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  missing_keywords: string[];
};

async function extractText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["txt", "md", "rtf", "csv", "html", "htm", "json"].includes(ext)) {
    return await file.text();
  }
  if (ext === "pdf" || file.type === "application/pdf") {
    try {
      const pdfjs: any = await import("pdfjs-dist");
      const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      const buf = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: buf }).promise;
      let out = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        out += content.items.map((it: any) => it.str).join(" ") + "\n\n";
      }
      const cleaned = out.replace(/\s+/g, " ").trim();
      if (cleaned.length > 50) return cleaned;
    } catch (e) {
      console.warn("PDF parse failed, falling back", e);
    }
  }
  if (ext === "docx" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    try {
      const mammoth: any = await import("mammoth/mammoth.browser");
      const buf = await file.arrayBuffer();
      const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
      const cleaned = (value ?? "").replace(/\s+/g, " ").trim();
      if (cleaned.length > 50) return cleaned;
    } catch (e) {
      console.warn("DOCX parse failed, falling back", e);
    }
  }
  try {
    const txt = await file.text();
    const cleaned = txt.replace(/[^\x20-\x7E\n\r\t]+/g, " ").replace(/\s+/g, " ").trim();
    if (cleaned.length > 200) return cleaned;
  } catch {}
  return `(Resume file "${file.name}" of type ${file.type || ext}. Please analyze based on the file metadata and provide general 2026 best-practice ATS guidance.)`;
}

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="text-center">
      <div className="relative size-32 mx-auto">
        <svg className="size-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="10" fill="none" className="text-border" />
          <circle cx="60" cy="60" r="52" stroke={color} strokeWidth="10" fill="none"
            strokeDasharray={`${(pct / 100) * 326.7} 326.7`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-display font-bold">{pct}</div>
          <div className="text-xs text-muted-foreground">/100</div>
        </div>
      </div>
      <div className="mt-2 text-sm font-medium">{label}</div>
    </div>
  );
}

function ResumePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [compareResult, setCompareResult] = useState<any>(null);
  const [doneSuggestions, setDoneSuggestions] = useState<number[]>([]);
  const [resumeText, setResumeText] = useState<string>("");
  const [profile, setProfile] = useState<{ college?: string | null; city?: string | null } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    setHistory(localDb.getAnalyses(user.id));
  }, [user, result]);

  const toggleSelect = (id: string) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length >= 2 ? [s[1], id] : [...s, id]
    );
  };

  const compareSelected = async () => {
    if (selected.length !== 2) { toast.error("Pick exactly 2 versions"); return; }
    setComparing(true);
    setCompareResult(null);
    try {
      const items = selected.map((id) => history.find((h) => h.id === id));
      items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const res = await fetch("/api/compare-resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: items[0], b: items[1] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Compare failed");
      setCompareResult({ ...data, a: items[0], b: items[1] });
      toast.success("Comparison ready");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setComparing(false);
    }
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error("File too large (max 10 MB)"); return; }
    setFile(f);
    setResult(null);
  };

  const analyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    try {
      const text = await extractText(file);
      setResumeText(text);
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, fileName: file.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");

      setResult(data);
      setDoneSuggestions([]);
      localDb.saveAnalysis(user!.id, {
        user_id: user!.id,
        file_name: file.name,
        ats_score: data.ats_score,
        trend_score: data.trend_score,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        suggestions: data.suggestions,
        missing_keywords: data.missing_keywords,
        summary: data.summary,
      });
      await logActivity("resume_analysis");
      toast.success(`ATS Score: ${data.ats_score}/100`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-xs text-muted-foreground flex items-start gap-2">
          <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
          <span><span className="text-primary font-medium">Privacy-first:</span> your resume is parsed locally in your browser. Only the extracted text is sent to AI — files are never stored.</span>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">AI Resume Analysis</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Upload any resume format. Our AI checks if it's <span className="text-primary">ATS-friendly</span> and aligned with <span className="text-primary">2026 market trends</span>.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 gradient-card border-border/60">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-primary/60 transition"
              >
                <input ref={inputRef} type="file" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="size-8 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">{file.name}</div>
                      <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · click to change</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="size-10 text-muted-foreground mx-auto mb-3" />
                    <div className="font-medium">Drop resume or click to upload</div>
                    <div className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, MD — any format up to 10 MB</div>
                  </>
                )}
              </div>
              <Button
                onClick={analyze}
                disabled={!file || analyzing}
                className="w-full mt-6 gradient-cyan text-primary-foreground"
                size="lg"
              >
                {analyzing ? <><Loader2 className="size-4 animate-spin mr-2" /> Analyzing on Ryzen AI…</> : <><Sparkles className="size-4 mr-2" /> Analyze resume</>}
              </Button>
            </Card>

            {result && (
              <Card className="p-8 gradient-card border-border/60 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 place-items-center">
                  <AtsGauge score={result.ats_score} />
                  <ScoreRing value={result.trend_score} label="2026 Trend Alignment" color="oklch(0.75 0.18 155)" />
                </div>
                <div className="rounded-xl bg-background/40 border border-border/60 p-4 text-sm">
                  <div className="text-xs text-primary uppercase tracking-wider mb-1">Summary</div>
                  {result.summary}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3"><CheckCircle2 className="size-4 text-success" /> Strengths</h3>
                    <ul className="space-y-2">{result.strengths.map((s, i) => <li key={i} className="text-sm text-muted-foreground">• {s}</li>)}</ul>
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3"><AlertCircle className="size-4 text-warning" /> Weaknesses</h3>
                    <ul className="space-y-2">{result.weaknesses.map((s, i) => <li key={i} className="text-sm text-muted-foreground">• {s}</li>)}</ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Action items</h3>
                  <div className="space-y-2">
                    {result.suggestions.map((s, i) => {
                      const checked = doneSuggestions.includes(i);
                      return (
                        <div key={i} className={`p-3 rounded-lg border transition ${checked ? "bg-success/5 border-success/40" : "bg-background/40 border-border/60 hover:border-primary/40"}`}>
                          <button
                            onClick={() => setDoneSuggestions((d) => d.includes(i) ? d.filter((x) => x !== i) : [...d, i])}
                            className="w-full flex gap-3 text-sm text-left"
                          >
                            <div className={`size-6 rounded-full text-xs flex items-center justify-center shrink-0 font-semibold ${checked ? "bg-success text-background" : "gradient-cyan text-primary-foreground"}`}>
                              {checked ? "✓" : i + 1}
                            </div>
                            <span className={checked ? "line-through text-muted-foreground" : ""}>{s}</span>
                          </button>
                          <FeedbackButtons page="resume-analysis" responseId={`sug-${i}-${result.ats_score}`} size="xs" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {resumeText && (
                  <div>
                    <h3 className="font-semibold mb-3">Resume keyword scan</h3>
                    <KeywordHighlight
                      text={resumeText}
                      present={(result as any).strengths_keywords ?? []}
                      missing={result.missing_keywords}
                    />
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3">Missing trending keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_keywords.map((k) => (
                      <Badge key={k} variant="outline" className="border-primary/40 text-primary">{k}</Badge>
                    ))}
                  </div>
                </div>

                <SkillRing acquiredKeywords={result.missing_keywords ? [] : []} targetRole="SDE Intern" />

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button asChild className="gradient-cyan text-primary-foreground flex-1">
                    <Link to="/micro-roadmap">Build my 48h roadmap →</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link to="/confidence-coach">Talk to coach</Link>
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            {result && <BadgeShare score={result.ats_score} />}
            {result && <PeerComparison score={result.ats_score} college={profile?.college} city={profile?.city} />}

            <Card className="p-5 gradient-card border-border/60">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><History className="size-4 text-primary" /><div className="font-semibold text-sm">Recent analyses</div></div>
                {history.length >= 2 && (
                  <span className="text-[10px] text-muted-foreground">{selected.length}/2 picked</span>
                )}
              </div>
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground">Your past scores will show here.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((h) => {
                    const isSel = selected.includes(h.id);
                    return (
                      <button
                        key={h.id}
                        onClick={() => toggleSelect(h.id)}
                        className={`w-full text-left p-3 rounded-lg border transition ${isSel ? "bg-primary/10 border-primary/60" : "bg-background/40 border-border/60 hover:border-primary/40"}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`size-4 rounded border mt-0.5 shrink-0 flex items-center justify-center ${isSel ? "bg-primary border-primary" : "border-border"}`}>
                            {isSel && <CheckCircle2 className="size-3 text-primary-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{h.file_name}</div>
                            <div className="flex justify-between items-center mt-2">
                              <Progress value={h.ats_score} className="h-1.5 flex-1 mr-3" />
                              <span className="text-xs text-primary font-semibold">{h.ats_score}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{new Date(h.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {history.length >= 2 && (
                <Button
                  size="sm"
                  onClick={compareSelected}
                  disabled={selected.length !== 2 || comparing}
                  className="w-full mt-3 gradient-cyan text-primary-foreground"
                >
                  {comparing ? <><Loader2 className="size-3 animate-spin mr-2" />Comparing…</> : <><GitCompare className="size-3 mr-2" />Compare 2 versions</>}
                </Button>
              )}
            </Card>

            {compareResult && <CompareCard data={compareResult} onClose={() => setCompareResult(null)} />}

            <Card className="p-5 gradient-card border-border/60 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground mb-1">How it works</div>
              PDF & DOCX text is parsed locally in your browser (privacy-first). Only the extracted text is sent to AI for scoring; nothing else is stored beyond your account.
            </Card>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Delta({ a, b, label }: { a: number; b: number; label: string }) {
  const d = b - a;
  const Icon = d > 0 ? TrendingUp : d < 0 ? TrendingDown : Minus;
  const color = d > 0 ? "text-success" : d < 0 ? "text-destructive" : "text-muted-foreground";
  return (
    <div className="flex-1 rounded-lg bg-background/40 border border-border/60 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-xs text-muted-foreground">{a}</span>
        <span className="text-xs">→</span>
        <span className="text-lg font-display font-bold">{b}</span>
        <span className={`text-xs font-semibold flex items-center gap-0.5 ${color}`}>
          <Icon className="size-3" />{d > 0 ? `+${d}` : d}
        </span>
      </div>
    </div>
  );
}

function CompareCard({ data, onClose }: { data: any; onClose: () => void }) {
  return (
    <Card className="p-5 gradient-card border-primary/40">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><GitCompare className="size-4 text-primary" /><div className="font-semibold text-sm">Version comparison</div></div>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
      </div>
      <div className="text-[10px] text-muted-foreground mb-3 truncate">
        {data.a.file_name} → {data.b.file_name}
      </div>
      <div className="flex gap-2 mb-4">
        <Delta a={data.a.ats_score} b={data.b.ats_score} label="ATS" />
        <Delta a={data.a.trend_score} b={data.b.trend_score} label="Trend" />
      </div>
      <div className="text-xs rounded-lg bg-background/40 border border-border/60 p-3 mb-3">
        <div className="text-[10px] text-primary uppercase tracking-wider mb-1">Verdict</div>
        {data.verdict}
      </div>
      {data.improvements?.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold flex items-center gap-1 mb-1.5"><TrendingUp className="size-3 text-success" /> Improvements</div>
          <ul className="space-y-1">{data.improvements.map((s: string, i: number) => <li key={i} className="text-xs text-muted-foreground">• {s}</li>)}</ul>
        </div>
      )}
      {data.regressions?.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold flex items-center gap-1 mb-1.5"><TrendingDown className="size-3 text-destructive" /> Regressions</div>
          <ul className="space-y-1">{data.regressions.map((s: string, i: number) => <li key={i} className="text-xs text-muted-foreground">• {s}</li>)}</ul>
        </div>
      )}
      {data.newly_added_keywords?.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold mb-1.5">New keywords added</div>
          <div className="flex flex-wrap gap-1">{data.newly_added_keywords.map((k: string) => <Badge key={k} variant="outline" className="border-success/40 text-success text-[10px]">{k}</Badge>)}</div>
        </div>
      )}
      {data.still_missing_keywords?.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold mb-1.5">Still missing</div>
          <div className="flex flex-wrap gap-1">{data.still_missing_keywords.map((k: string) => <Badge key={k} variant="outline" className="border-warning/40 text-warning text-[10px]">{k}</Badge>)}</div>
        </div>
      )}
      <div>
        <div className="text-xs font-semibold mb-1.5">Next actions</div>
        <ul className="space-y-1">{data.next_actions?.map((s: string, i: number) => <li key={i} className="text-xs text-muted-foreground">• {s}</li>)}</ul>
      </div>
    </Card>
  );
}
