import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { localDb } from "@/lib/local-db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2, ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  Sparkles, Code2, Brain, BarChart3, ArrowRight, Camera, Mic,
  AlertTriangle, Calendar, BookOpen, Target, TrendingUp,
} from "lucide-react";

type MCQQuestion = { id: number; text: string; type: "single"; marks: number; options: { id: number; text: string }[]; correct: number[]; explanation: string };
type CodingProblem = { id: number; title: string; difficulty: string; statement: string; example_input: string; example_output: string; constraints: string; solution: string; marks: number };
type DSAQuestion = { id: number; text: string; topic?: string; type: "single"; marks: number; options: { id: number; text: string }[]; correct: number[]; explanation: string };

type TestData = {
  testId: string; domain: string; city: string; totalMarks: number;
  sections: {
    mcq: { title: string; duration: number; questions: MCQQuestion[] };
    coding: { title: string; duration: number; problems: CodingProblem[] };
    dsa: { title: string; duration: number; questions: DSAQuestion[] };
  };
};

type Phase = "start" | "loading" | "mcq" | "coding" | "dsa" | "results";

export const Route = createFileRoute("/mock-test")({
  validateSearch: (s: Record<string, unknown>) => ({
    domain: (s.domain as string) || "Python",
    city: (s.city as string) || "Bengaluru",
  }),
  head: () => ({ meta: [{ title: "AI Mock Test — ZeroGap AI" }] }),
  component: MockTestPage,
});

// ── Proctoring hook ──
function useProctoring(active: boolean, onViolation: (reason: string) => void) {
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const violationsRef = useRef(0);
  const gazeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const faceCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start camera + mic
  const startMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const stopMedia = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (faceCheckRef.current) clearInterval(faceCheckRef.current);
    if (gazeTimerRef.current) clearTimeout(gazeTimerRef.current);
  }, []);

  const addViolation = useCallback((reason: string) => {
    violationsRef.current += 1;
    const count = violationsRef.current;
    if (count >= 3) {
      onViolation(reason);
    } else {
      toast.warning(`⚠️ Warning ${count}/3: ${reason}`);
    }
  }, [onViolation]);

  useEffect(() => {
    if (!active) return;

    // Tab switch detection
    const onVisibility = () => {
      if (document.hidden) addViolation("Tab switched / window minimized");
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Gaze detection via mouse leaving window (proxy for looking away)
    const onMouseLeave = () => {
      gazeTimerRef.current = setTimeout(() => {
        addViolation("Eyes away from screen for too long");
      }, 4000);
    };
    const onMouseEnter = () => {
      if (gazeTimerRef.current) clearTimeout(gazeTimerRef.current);
    };
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // Face detection via canvas pixel analysis (simple brightness check)
    faceCheckRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1;
      canvas.height = video.videoHeight || 1;
      if (canvas.width === 0 || canvas.height === 0) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      try {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        // Check if frame is mostly dark (face not visible / covered)
        let brightness = 0;
        for (let i = 0; i < data.length; i += 40) brightness += data[i];
        brightness /= (data.length / 40);
        if (brightness < 15) addViolation("Face not visible — camera may be covered");
      } catch {}
    }, 8000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      if (faceCheckRef.current) clearInterval(faceCheckRef.current);
      if (gazeTimerRef.current) clearTimeout(gazeTimerRef.current);
    };
  }, [active, addViolation]);

  return { videoRef, startMedia, stopMedia };
}

// ── 4-week roadmap generator ──
async function generateWeeklyRoadmap(domain: string, pct: number): Promise<{ intro: string; weeks: { title: string; tasks: { title: string; description: string; udemy_query?: string }[] }[] }> {
  const level = pct >= 80 ? "advanced" : pct >= 60 ? "intermediate" : pct >= 40 ? "beginner-intermediate" : "beginner";
  const weeks = pct >= 60 ? 4 : 6;
  const res = await fetch("/api/generate-roadmap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      goal: `${weeks}-week structured learning plan to master ${domain} from ${level} level. Scored ${pct}% in mock test. Include daily tasks, resources, projects, and milestones for each week.`,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);

  const tasks: any[] = data.tasks ?? [];
  const weekSize = Math.ceil(tasks.length / weeks);
  const weekGroups = [];
  for (let w = 0; w < weeks; w++) {
    const slice = tasks.slice(w * weekSize, (w + 1) * weekSize);
    if (slice.length === 0) continue;
    weekGroups.push({
      title: `Week ${w + 1}`,
      tasks: slice.map((t: any) => ({
        title: t.title,
        description: t.description ?? "",
        udemy_query: t.udemy_query ?? "",
      })),
    });
  }
  return { intro: data.intro ?? "", weeks: weekGroups };
}

function MockTestPage() {
  const { domain, city } = useSearch({ from: "/mock-test" });
  const navigate = useNavigate();
  const { user } = useAuth();

  const [phase, setPhase] = useState<Phase>("start");
  const [test, setTest] = useState<TestData | null>(null);
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});
  const [dsaAnswers, setDsaAnswers] = useState<Record<number, number>>({});
  const [codingAnswers, setCodingAnswers] = useState<Record<number, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<{ intro: string; weeks: { title: string; tasks: { title: string; description: string; udemy_query?: string }[] }[] } | null>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [camReady, setCamReady] = useState<boolean | null>(null);
  const [violationReason, setViolationReason] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const isExamPhase = ["mcq", "coding", "dsa"].includes(phase);

  const forceSubmit = useCallback((reason: string) => {
    setViolationReason(reason);
    toast.error(`Test terminated: ${reason}`);
    submitAll();
  }, []); // eslint-disable-line

  const { videoRef, startMedia, stopMedia } = useProctoring(isExamPhase, forceSubmit);

  // Start camera when entering exam
  useEffect(() => {
    if (phase === "mcq") {
      startMedia().then(ok => setCamReady(ok));
    }
    if (phase === "results") stopMedia();
    return () => { if (phase === "results") stopMedia(); };
  }, [phase]); // eslint-disable-line

  const generate = async () => {
    if (!user) { navigate({ to: "/auth" }); return; }
    setPhase("loading");
    try {
      const res = await fetch("/api/generate-mock-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, city }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setTest(data);
      setCurrentIdx(0);
      setPhase("mcq");
    } catch (e: any) {
      toast.error(e.message);
      setPhase("start");
    }
  };

  const submitAll = useCallback(() => {
    if (!test) return;
    const mcqScore = test.sections.mcq.questions.reduce((s, q) => {
      const ans = mcqAnswers[q.id];
      return s + (ans !== undefined && q.correct.includes(ans) ? q.marks : 0);
    }, 0);
    const dsaScore = test.sections.dsa.questions.reduce((s, q) => {
      const ans = dsaAnswers[q.id];
      return s + (ans !== undefined && q.correct.includes(ans) ? q.marks : 0);
    }, 0);
    const codingScore = test.sections.coding.problems.reduce((s, p) => s + Math.round(p.marks * 0.5), 0);
    const total = mcqScore + dsaScore + codingScore;
    const pct = Math.round((total / test.totalMarks) * 100);
    setResults({ mcqScore, dsaScore, codingScore, total, pct, totalMarks: test.totalMarks });
    if (user) localDb.logActivity(user.id, "mock_test");
    setPhase("results");
  }, [test, mcqAnswers, dsaAnswers, codingAnswers, user]);

  const fetchRoadmap = async () => {
    if (!test || !results) return;
    setLoadingRoadmap(true);
    try {
      const rm = await generateWeeklyRoadmap(test.domain, results.pct);
      setRoadmap(rm);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingRoadmap(false);
    }
  };

  // Camera preview overlay (shown during exam)
  const CamOverlay = () => (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <div className="w-28 h-20 rounded-lg overflow-hidden border-2 border-primary/60 bg-black shadow-lg">
        <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
      </div>
      <div className="flex items-center gap-1.5 text-[10px]">
        <span className={`size-2 rounded-full ${camReady ? "bg-success animate-pulse" : "bg-destructive"}`} />
        <span className="text-muted-foreground">{camReady ? "Proctored" : "No camera"}</span>
      </div>
    </div>
  );

  // Warning banner
  const WarningBanner = () => violationReason ? (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2">
      <AlertTriangle className="size-4" /> Test terminated: {violationReason}
    </div>
  ) : null;

  // ── START ──
  if (phase === "start") return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <Card className="p-8 gradient-card border-border/60 max-w-md w-full text-center">
        <Sparkles className="size-12 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">AI Mock Test</h1>
        <p className="text-muted-foreground text-sm mb-1"><span className="text-primary font-semibold">{domain}</span> · {city}</p>
        <div className="grid grid-cols-3 gap-3 my-5 text-xs">
          {[
            { icon: Brain, label: "10 MCQs", sub: "10 min" },
            { icon: Code2, label: "2 Coding", sub: "Open" },
            { icon: BarChart3, label: "5 DSA", sub: "45 min" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="p-3 rounded-lg bg-background/40 border border-border/60">
              <Icon className="size-5 text-primary mx-auto mb-1" />
              <div className="font-semibold">{label}</div>
              <div className="text-muted-foreground">{sub}</div>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-warning/10 border border-warning/30 p-3 mb-5 text-xs text-left space-y-1">
          <div className="flex items-center gap-2 font-semibold text-warning"><Camera className="size-3.5" /> Proctoring enabled</div>
          <p className="text-muted-foreground">Camera + microphone will be active. Switching tabs or looking away repeatedly will auto-submit the test.</p>
        </div>
        <Button onClick={generate} className="w-full gradient-cyan text-primary-foreground">
          Generate & Start Test
        </Button>
        <Link to="/opportunities" className="block mt-3 text-xs text-muted-foreground hover:text-primary">← Back</Link>
      </Card>
    </div>
  );

  // ── LOADING ──
  if (phase === "loading") return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center gap-4">
      <Loader2 className="size-12 text-primary animate-spin" />
      <p className="text-lg font-display">Generating your test for <span className="text-primary">{domain}</span>…</p>
      <p className="text-sm text-muted-foreground">This takes 15–30 seconds</p>
    </div>
  );

  if (!test) return null;

  // ── MCQ ──
  if (phase === "mcq") {
    const qs = test.sections.mcq.questions;
    const safeIdx = Math.min(currentIdx, qs.length - 1);
    const q = qs[safeIdx];
    if (!q) return null;
    return (
      <div className="min-h-screen bg-background">
        <WarningBanner />
        <CamOverlay />
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border/60 px-4 py-3 flex items-center justify-between">
          <div className="font-semibold text-sm">Section 1 · MCQ <span className="text-muted-foreground">({Object.keys(mcqAnswers).length}/{qs.length})</span></div>
          <Button size="sm" variant="outline" onClick={() => { setCurrentIdx(0); setPhase("coding"); }}>Next: Coding →</Button>
        </div>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex gap-1.5 flex-wrap mb-6">
            {qs.map((qq, i) => (
              <button key={qq.id} onClick={() => setCurrentIdx(i)}
                className={`size-8 rounded text-xs font-medium border transition ${i === safeIdx ? "ring-2 ring-primary" : ""} ${mcqAnswers[qq.id] !== undefined ? "bg-primary/20 border-primary text-primary" : "bg-background/40 border-border/60 text-muted-foreground"}`}>
                {i + 1}
              </button>
            ))}
          </div>
          <Card className="p-6 gradient-card border-border/60">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-muted-foreground">Q{safeIdx + 1} of {qs.length}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">{q.marks} marks</span>
            </div>
            <h2 className="text-lg font-medium mb-5">{q.text}</h2>
            <div className="space-y-2.5">
              {q.options.map((opt) => {
                const sel = mcqAnswers[q.id] === opt.id;
                return (
                  <button key={opt.id} onClick={() => setMcqAnswers(p => ({ ...p, [q.id]: opt.id }))}
                    className={`w-full text-left rounded-xl border p-3.5 flex items-start gap-3 transition ${sel ? "border-l-4 border-primary bg-primary/10" : "border-border/60 hover:border-primary/40"}`}>
                    <div className={`size-7 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 ${sel ? "bg-primary text-primary-foreground" : "bg-border/40"}`}>
                      {String.fromCharCode(65 + opt.id)}
                    </div>
                    <span className="text-sm pt-0.5">{opt.text}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" disabled={safeIdx === 0} onClick={() => setCurrentIdx(i => i - 1)}><ChevronLeft className="size-4 mr-1" />Prev</Button>
              {safeIdx < qs.length - 1
                ? <Button onClick={() => setCurrentIdx(i => i + 1)} className="gradient-cyan text-primary-foreground">Next <ChevronRight className="size-4 ml-1" /></Button>
                : <Button onClick={() => { setCurrentIdx(0); setPhase("coding"); }} className="gradient-cyan text-primary-foreground">Go to Coding →</Button>
              }
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── CODING ──
  if (phase === "coding") {
    const probs = test.sections.coding.problems;
    return (
      <div className="min-h-screen bg-background">
        <WarningBanner />
        <CamOverlay />
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border/60 px-4 py-3 flex items-center justify-between">
          <div className="font-semibold text-sm">Section 2 · Coding Challenges</div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { setCurrentIdx(0); setPhase("mcq"); }}>← MCQ</Button>
            <Button size="sm" onClick={() => { setCurrentIdx(0); setPhase("dsa"); }} className="gradient-cyan text-primary-foreground">Next: DSA →</Button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
          {probs.map((p) => (
            <Card key={p.id} className="p-6 gradient-card border-border/60">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-lg">{p.title}</h2>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${p.difficulty === "Easy" ? "border-success/40 text-success" : p.difficulty === "Medium" ? "border-warning/40 text-warning" : "border-destructive/40 text-destructive"}`}>{p.difficulty}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">{p.marks} marks</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{p.statement}</p>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-background/40 border border-border/60">
                  <div className="text-xs text-primary uppercase tracking-wider mb-1">Input</div>
                  <code className="text-xs">{p.example_input}</code>
                </div>
                <div className="p-3 rounded-lg bg-background/40 border border-border/60">
                  <div className="text-xs text-primary uppercase tracking-wider mb-1">Output</div>
                  <code className="text-xs">{p.example_output}</code>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-4">Constraints: {p.constraints}</div>
              <textarea value={codingAnswers[p.id] ?? ""} onChange={(e) => setCodingAnswers(prev => ({ ...prev, [p.id]: e.target.value }))}
                placeholder="Write your solution here..." rows={8}
                className="w-full bg-background/60 border border-border rounded-lg p-3 text-sm font-mono outline-none focus:border-primary/50 resize-y" />
              <details className="mt-3">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-primary">View sample solution</summary>
                <pre className="mt-2 p-3 rounded-lg bg-background/40 border border-border/60 text-xs overflow-x-auto">{p.solution}</pre>
              </details>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ── DSA ──
  if (phase === "dsa") {
    const qs = test.sections.dsa.questions;
    const safeIdx = Math.min(currentIdx, qs.length - 1);
    const q = qs[safeIdx];
    if (!q) return null;
    return (
      <div className="min-h-screen bg-background">
        <WarningBanner />
        <CamOverlay />
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border/60 px-4 py-3 flex items-center justify-between">
          <div className="font-semibold text-sm">Section 3 · DSA <span className="text-muted-foreground">({Object.keys(dsaAnswers).length}/{qs.length}) · 45 min</span></div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { setCurrentIdx(0); setPhase("coding"); }}>← Coding</Button>
            <Button size="sm" onClick={submitAll} className="gradient-cyan text-primary-foreground">Submit Test →</Button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex gap-1.5 flex-wrap mb-6">
            {qs.map((qq, i) => (
              <button key={qq.id} onClick={() => setCurrentIdx(i)}
                className={`size-8 rounded text-xs font-medium border transition ${i === safeIdx ? "ring-2 ring-primary" : ""} ${dsaAnswers[qq.id] !== undefined ? "bg-primary/20 border-primary text-primary" : "bg-background/40 border-border/60 text-muted-foreground"}`}>
                {i + 1}
              </button>
            ))}
          </div>
          <Card className="p-6 gradient-card border-border/60">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">Q{safeIdx + 1} of {qs.length} · {q?.topic ?? "DSA"}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">{q.marks} marks</span>
            </div>
            <h2 className="text-lg font-medium mb-5">{q.text}</h2>
            <div className="space-y-2.5">
              {q.options.map((opt) => {
                const sel = dsaAnswers[q.id] === opt.id;
                return (
                  <button key={opt.id} onClick={() => setDsaAnswers(p => ({ ...p, [q.id]: opt.id }))}
                    className={`w-full text-left rounded-xl border p-3.5 flex items-start gap-3 transition ${sel ? "border-l-4 border-primary bg-primary/10" : "border-border/60 hover:border-primary/40"}`}>
                    <div className={`size-7 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 ${sel ? "bg-primary text-primary-foreground" : "bg-border/40"}`}>
                      {String.fromCharCode(65 + opt.id)}
                    </div>
                    <span className="text-sm pt-0.5">{opt.text}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" disabled={safeIdx === 0} onClick={() => setCurrentIdx(i => i - 1)}><ChevronLeft className="size-4 mr-1" />Prev</Button>
              {safeIdx < qs.length - 1
                ? <Button onClick={() => setCurrentIdx(i => i + 1)} className="gradient-cyan text-primary-foreground">Next <ChevronRight className="size-4 ml-1" /></Button>
                : <Button onClick={submitAll} className="gradient-cyan text-primary-foreground">Submit Test →</Button>
              }
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  if (phase === "results" && results && test) {
    const grade = results.pct >= 80 ? "Excellent 🏆" : results.pct >= 60 ? "Good 👍" : results.pct >= 40 ? "Average 📈" : "Needs Work 💪";
    const gradeColor = results.pct >= 80 ? "text-success" : results.pct >= 60 ? "text-primary" : results.pct >= 40 ? "text-warning" : "text-destructive";

    return (
      <div className="min-h-screen bg-background py-10">
        {violationReason && (
          <div className="container mx-auto px-4 max-w-4xl mb-4">
            <div className="rounded-lg bg-destructive/10 border border-destructive/40 p-4 flex items-center gap-3">
              <AlertTriangle className="size-5 text-destructive shrink-0" />
              <div>
                <div className="font-semibold text-destructive text-sm">Test auto-submitted</div>
                <div className="text-xs text-muted-foreground">{violationReason}</div>
              </div>
            </div>
          </div>
        )}
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Score */}
          <Card className="p-8 gradient-card border-border/60 text-center mb-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Your Score</div>
            <div className="text-6xl font-display font-bold">{results.total}<span className="text-2xl text-muted-foreground"> / {results.totalMarks}</span></div>
            <div className={`text-2xl font-display mt-2 ${gradeColor}`}>{results.pct}% · {grade}</div>
          </Card>

          {/* Section breakdown */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: "MCQ", score: results.mcqScore, total: test.sections.mcq.questions.reduce((s: number, q: any) => s + q.marks, 0), icon: Brain },
              { label: "Coding", score: results.codingScore, total: test.sections.coding.problems.reduce((s: number, p: any) => s + p.marks, 0), icon: Code2 },
              { label: "DSA", score: results.dsaScore, total: test.sections.dsa.questions.reduce((s: number, q: any) => s + q.marks, 0), icon: BarChart3 },
            ].map(({ label, score, total, icon: Icon }) => (
              <Card key={label} className="p-5 gradient-card border-border/60 text-center">
                <Icon className="size-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{score}<span className="text-sm text-muted-foreground">/{total}</span></div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </Card>
            ))}
          </div>

          {/* MCQ Review */}
          <Card className="p-6 gradient-card border-border/60 mb-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Brain className="size-5 text-primary" /> MCQ Review</h2>
            <div className="space-y-3">
              {test.sections.mcq.questions.map((q, i) => {
                const userAns = mcqAnswers[q.id];
                const correct = userAns !== undefined && q.correct.includes(userAns);
                return (
                  <div key={q.id} className={`p-4 rounded-lg border ${correct ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                    <div className="flex items-start gap-2 mb-1">
                      {correct ? <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" /> : <XCircle className="size-4 text-destructive shrink-0 mt-0.5" />}
                      <span className="text-sm font-medium">Q{i + 1}: {q.text}</span>
                    </div>
                    {!correct && userAns !== undefined && <p className="text-xs text-destructive ml-6">Your: {q.options.find(o => o.id === userAns)?.text}</p>}
                    <p className="text-xs text-success ml-6">Correct: {q.options.find(o => q.correct.includes(o.id))?.text}</p>
                    <p className="text-xs text-muted-foreground ml-6 mt-1 italic">{q.explanation}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* DSA Review */}
          <Card className="p-6 gradient-card border-border/60 mb-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><BarChart3 className="size-5 text-primary" /> DSA Review</h2>
            <div className="space-y-3">
              {test.sections.dsa.questions.map((q, i) => {
                const userAns = dsaAnswers[q.id];
                const correct = userAns !== undefined && q.correct.includes(userAns);
                return (
                  <div key={q.id} className={`p-4 rounded-lg border ${correct ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                    <div className="flex items-start gap-2 mb-1">
                      {correct ? <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" /> : <XCircle className="size-4 text-destructive shrink-0 mt-0.5" />}
                      <span className="text-sm font-medium">Q{i + 1} [{q?.topic ?? "DSA"}]: {q.text}</span>
                    </div>
                    {!correct && userAns !== undefined && <p className="text-xs text-destructive ml-6">Your: {q.options.find(o => o.id === userAns)?.text}</p>}
                    <p className="text-xs text-success ml-6">Correct: {q.options.find(o => q.correct.includes(o.id))?.text}</p>
                    <p className="text-xs text-muted-foreground ml-6 mt-1 italic">{q.explanation}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 4-week Roadmap */}
          <Card className="p-6 gradient-card border-primary/40 mb-6">
            <h2 className="font-bold text-lg mb-1 flex items-center gap-2"><Calendar className="size-5 text-primary" /> Your Personalized Learning Roadmap</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Based on your <span className="text-primary font-semibold">{results.pct}%</span> score, here's a structured {results.pct >= 60 ? "4" : "6"}-week plan to master <span className="text-primary font-semibold">{test.domain}</span>.
            </p>
            {!roadmap ? (
              <Button onClick={fetchRoadmap} disabled={loadingRoadmap} className="gradient-cyan text-primary-foreground">
                {loadingRoadmap
                  ? <><Loader2 className="size-4 animate-spin mr-2" />Building your roadmap…</>
                  : <><TrendingUp className="size-4 mr-2" />Generate {results.pct >= 60 ? "4" : "6"}-Week Roadmap</>
                }
              </Button>
            ) : (
              <div className="space-y-4">
                {roadmap.intro && (
                  <p className="text-sm text-muted-foreground italic">{roadmap.intro}</p>
                )}
                {roadmap.weeks.map((week, wi) => (
                  <div key={wi} className="rounded-xl border border-border/60 overflow-hidden">
                    <div className="px-4 py-2.5 bg-primary/10 border-b border-border/60 flex items-center gap-2">
                      <BookOpen className="size-4 text-primary" />
                      <span className="font-semibold text-sm">{week.title}</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {week.tasks.map((task, ti) => (
                        <div key={ti} className="flex gap-3">
                          <div className="size-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">{ti + 1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{task.title}</div>
                            {task.description && <div className="text-xs text-muted-foreground mt-0.5">{task.description}</div>}
                            {task.udemy_query && (
                              <a
                                href={`https://www.udemy.com/courses/search/?q=${encodeURIComponent(task.udemy_query)}&sort=highest-rated`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition"
                              >
                                <BookOpen className="size-2.5" /> Udemy: {task.udemy_query}
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="flex gap-3 justify-center">
            <Button onClick={() => { setPhase("start"); setMcqAnswers({}); setDsaAnswers({}); setCodingAnswers({}); setResults(null); setRoadmap(null); setViolationReason(null); }} variant="outline">
              Retake Test
            </Button>
            <Button asChild className="gradient-cyan text-primary-foreground">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
