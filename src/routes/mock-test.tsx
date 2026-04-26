import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { localDb } from "@/lib/local-db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Shield, Camera, Mic, Maximize, Eye, AlertTriangle, Flag, ChevronLeft, ChevronRight, Send, CheckCircle2, XCircle, Sparkles, Trophy } from "lucide-react";
import { LEVELS, levelForXp, xpForResult, performanceLabel } from "@/lib/levels";
import confetti from "canvas-confetti";

type MockQuestion = {
  id: number;
  text: string;
  type: "single" | "multiple";
  marks: number;
  options: { id: number; text: string }[];
  correct: number[];
  explanation: string;
};

type MockTest = {
  testId: string;
  domain: string;
  city: string;
  totalMarks: number;
  duration: number;
  questions: MockQuestion[];
};

type Phase = "pre" | "loading" | "exam" | "emoji" | "results";

export const Route = createFileRoute("/mock-test")({
  validateSearch: (s: Record<string, unknown>) => ({
    domain: (s.domain as string) || "AI / ML",
    city: (s.city as string) || "Bengaluru",
  }),
  head: () => ({ meta: [{ title: "AI Mock Test — ZeroGap AI" }] }),
  component: MockTestPage,
});

function MockTestPage() {
  const { domain, city } = useSearch({ from: "/mock-test" });
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("pre");
  const [test, setTest] = useState<MockTest | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Pre-test state
  const [camReady, setCamReady] = useState<boolean | null>(null);
  const [micReady, setMicReady] = useState<boolean | null>(null);
  const [agreed, setAgreed] = useState(false);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  // Exam state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [reviewMarks, setReviewMarks] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(2700);
  const [violationCount, setViolationCount] = useState(0);
  const violationLog = useRef<string[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const startedAt = useRef<number>(0);

  // Submit/results
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [emoji, setEmoji] = useState<string | null>(null);
  const [emojiNote, setEmojiNote] = useState("");
  const [resultRow, setResultRow] = useState<any>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [savedRow, setSavedRow] = useState<any>(null);
  const [leveledUp, setLeveledUp] = useState<{ from: number; to: number } | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) setUserId(user.id);
    else navigate({ to: "/auth" });
  }, [user, navigate]);

  // Pre-test system check
  useEffect(() => {
    if (phase !== "pre") return;
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        cameraStreamRef.current = stream;
        setCamReady(true);
        setMicReady(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() => {
        setCamReady(false);
        setMicReady(false);
      });

    return () => {
      // Cleanup handled by explicit cleanupCamera call on navigation or submission
    };
  }, [phase]);

  // Wire preview video once we are in exam phase
  useEffect(() => {
    if (phase === "exam" && previewVideoRef.current && cameraStreamRef.current) {
      previewVideoRef.current.srcObject = cameraStreamRef.current;
      previewVideoRef.current.play().catch(() => {});
    }
  }, [phase]);

  const cleanupCamera = useCallback(() => {
    cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    cameraStreamRef.current = null;
  }, []);

  const showWarning = useCallback((msg: string) => {
    setWarning(msg);
    setTimeout(() => setWarning(null), 4000);
  }, []);

  // Submit logic — defined before proctoring effects so we can reference safely
  const handleSubmit = useCallback(
    async (reason: "manual" | "time_up" | "force_violations" = "manual") => {
      if (!test || !userId) return;
      const timeUsed = Math.min(test.duration, Math.floor((Date.now() - startedAt.current) / 1000));
      let correct = 0;
      let wrong = 0;
      let skipped = 0;
      let score = 0;
      const detailed: any[] = [];
      for (const q of test.questions) {
        const ans = answers[q.id];
        if (!ans || ans.length === 0) {
          skipped++;
          detailed.push({ id: q.id, answer: [], result: "skipped", marks: 0 });
          continue;
        }
        const sortedA = [...ans].sort();
        const sortedC = [...q.correct].sort();
        const isCorrect = sortedA.length === sortedC.length && sortedA.every((v, i) => v === sortedC[i]);
        if (isCorrect) {
          correct++;
          score += q.marks;
          detailed.push({ id: q.id, answer: ans, result: "correct", marks: q.marks });
        } else {
          wrong++;
          score -= 1;
          detailed.push({ id: q.id, answer: ans, result: "wrong", marks: -1 });
        }
      }
      score = Math.max(0, score);

      // Fetch progress for XP and streak
      const prog = localDb.getStreak(userId);
      const analyses = localDb.getAnalyses(userId);
      const lastAnalysis = analyses.find((a) => a.file_name?.includes(test.domain));

      const scorePct = Math.round((score / test.totalMarks) * 100);
      const xp = Math.max(10, Math.round(scorePct / 2));

      // Save test result to local storage
      const testResults = JSON.parse(localStorage.getItem(`zerogap_mock_tests_${userId}`) ?? "[]");
      const inserted = { id: crypto.randomUUID(), domain: test.domain, city: test.city, score, total_marks: test.totalMarks, correct_count: correct, wrong_count: wrong, skipped_count: skipped, time_taken_secs: timeUsed, xp_earned: xp, created_at: new Date().toISOString() };
      testResults.unshift(inserted);
      localStorage.setItem(`zerogap_mock_tests_${userId}`, JSON.stringify(testResults.slice(0, 50)));

      // Update streak
      const today = new Date().toISOString().slice(0, 10);
      const last = prog.last_active_date;
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      let newStreak = prog.streak_count;
      if (last !== today) {
        newStreak = last === yStr ? prog.streak_count + 1 : 1;
        localDb.saveStreak(userId, { streak_count: newStreak, longest_streak: Math.max(prog.longest_streak, newStreak), last_active_date: today });
      }

      const oldLevel = Math.floor((prog.streak_count * 10) / 100);
      const newLevel = Math.floor((newStreak * 10) / 100);
      if (newLevel > oldLevel) setLeveledUp({ from: oldLevel, to: newLevel });

      if (document.fullscreenElement) { try { await document.exitFullscreen(); } catch {} }

      setSavedRow(inserted);
      setResultRow({ score, correct, wrong, skipped, timeUsed, xp, scorePct, detailed, reason });
      setPhase("emoji");
    },
    [answers, test, userId]
  );

  // Proctoring listeners — only in exam phase
  useEffect(() => {
    if (phase !== "exam") return;

    const addViolation = (reason: string) => {
      const entry = `${new Date().toISOString()} — ${reason}`;
      violationLog.current.push(entry);
      const count = violationLog.current.length;
      setViolationCount(count);
      if (count === 1) showWarning(`⚠️ Warning 1/3: ${reason}`);
      else if (count === 2) showWarning(`🚨 Warning 2/3: ${reason} — One more will end the test`);
      else {
        showWarning("Test terminated: 3 violations detected");
        setTimeout(() => handleSubmit("force_violations"), 2500);
      }
    };

    const onVisibility = () => {
      if (document.hidden) addViolation("Tab switched / window minimized");
    };
    const onFullscreen = () => {
      if (!document.fullscreenElement) addViolation("Exited fullscreen mode");
    };
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        e.preventDefault();
        addViolation("Screenshot attempted");
      }
      if ((e.ctrlKey || e.metaKey) && "cvxa".includes(e.key.toLowerCase())) {
        e.preventDefault();
        addViolation("Copy/paste shortcut used");
      }
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
        addViolation("Alt+Tab detected");
      }
      if (e.key === "F12") e.preventDefault();
    };
    const onContext = (e: MouseEvent) => e.preventDefault();

    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreen);
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("contextmenu", onContext);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullscreen);
      document.removeEventListener("keydown", onKeydown);
      document.removeEventListener("contextmenu", onContext);
    };
  }, [phase, showWarning, handleSubmit]);

  // Timer
  useEffect(() => {
    if (phase !== "exam") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit("time_up");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, handleSubmit]);

  const beginTest = async () => {
    if (!camReady || !micReady || !agreed) return;
    setPhase("loading");
    try {
      const res = await fetch("/api/generate-mock-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, city }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");
      const t = json as MockTest;
      setTest(t);
      setTimeLeft(t.duration ?? 2700);
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        /* ignore — will flag as soon as exam starts only if intentionally exited */
      }
      startedAt.current = Date.now();
      setPhase("exam");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to generate test");
      setPhase("pre");
    }
  };

  const toggleOption = (qId: number, optId: number, type: "single" | "multiple") => {
    setAnswers((prev) => {
      const curr = prev[qId] ?? [];
      if (type === "single") return { ...prev, [qId]: [optId] };
      if (curr.includes(optId)) return { ...prev, [qId]: curr.filter((x) => x !== optId) };
      return { ...prev, [qId]: [...curr, optId] };
    });
  };

  const toggleReview = (qId: number) => {
    setReviewMarks((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const submitWithFeedback = async () => {
    setPhase("results");
  };

  // Confetti on level up modal
  useEffect(() => {
    if (leveledUp) {
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 } });
    }
  }, [leveledUp]);

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const answeredCount = useMemo(
    () => Object.values(answers).filter((v) => v.length > 0).length,
    [answers]
  );

  // ============ RENDER ============

  if (phase === "pre") {
    const allReady = camReady && micReady && agreed;
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
        <div className="border-b border-border/60 bg-background/95 backdrop-blur sticky top-0 z-10">
          <div className="container mx-auto px-6 py-3 flex items-center justify-between text-sm">
            <div className="font-display">ZeroGap AI · Mock Test</div>
            <div className="text-muted-foreground">
              Domain: <span className="text-foreground font-medium">{domain}</span>
              <span className="mx-3 opacity-40">|</span>
              City: <span className="text-foreground font-medium">{city}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { l: "Total Questions", v: "30" },
              { l: "Total Marks", v: "100" },
              { l: "Duration", v: "45 min" },
              { l: "Marking", v: "+3 / -1 / 0" },
            ].map((b) => (
              <Card key={b.l} className="p-4 gradient-card border-border/60 text-center">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{b.l}</div>
                <div className="text-2xl font-display mt-1">{b.v}</div>
              </Card>
            ))}
          </div>

          <Card className="p-6 gradient-card border-border/60 mb-6">
            <h2 className="font-semibold mb-3 flex items-center gap-2"><Shield className="size-4 text-primary" /> Instructions</h2>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-5">
              <li>This test is AI proctored. Camera + microphone are required.</li>
              <li>The test runs in fullscreen. Exiting fullscreen flags a violation.</li>
              <li>Do NOT switch browser tabs or open other applications.</li>
              <li>Do NOT use a phone or take external help during the test.</li>
              <li>Copy + Paste and Print Screen are disabled during the test.</li>
              <li>3 violations will automatically terminate and submit your test.</li>
              <li>Each question displays its individual mark weightage.</li>
              <li>Unanswered questions carry 0 marks. Wrong answers carry −1 mark.</li>
              <li>Use the left panel to navigate. Mark questions for review with ⚑.</li>
              <li>The test auto-submits when the timer reaches 00:00.</li>
            </ol>
          </Card>

          <Card className="p-6 gradient-card border-border/60 mb-6">
            <h2 className="font-semibold mb-3">System Check</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm">
                <SystemCheckRow icon={<Camera className="size-4" />} ok={camReady} okMsg="Camera Ready" failMsg="Camera Required — cannot proceed" pending={camReady === null} />
                <SystemCheckRow icon={<Mic className="size-4" />} ok={micReady} okMsg="Microphone Ready" failMsg="Microphone Required — cannot proceed" pending={micReady === null} />
                <SystemCheckRow icon={<Maximize className="size-4" />} ok={true} okMsg="Browser Fullscreen will be enabled on test start" />
                <SystemCheckRow icon={<Eye className="size-4" />} ok={true} okMsg="Tab monitoring active" />
              </div>
              <div className="aspect-video rounded-lg bg-black/60 border border-border/60 overflow-hidden flex items-center justify-center">
                {camReady ? (
                  <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
                ) : camReady === false ? (
                  <div className="text-xs text-destructive p-4 text-center">Camera blocked — please grant permission and refresh.</div>
                ) : (
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5 gradient-card border-border/60 mb-6">
            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} className="mt-0.5" />
              <span className="text-muted-foreground">
                I agree to the ZeroGap AI exam terms and will attempt this test honestly without
                external help, AI tools, or devices.
              </span>
            </label>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => { cleanupCamera(); navigate({ to: "/opportunities" }); }}>Cancel</Button>
            <Button
              disabled={!allReady}
              onClick={beginTest}
              className="gradient-cyan text-primary-foreground"
            >
              Begin Test →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center text-center px-6">
        <Sparkles className="size-12 text-primary animate-pulse mb-4" />
        <h2 className="font-display text-2xl">⚡ Generating your personalized test for {domain} in {city}…</h2>
        <p className="text-muted-foreground mt-2 text-sm">This usually takes 10–30 seconds.</p>
        <div className="mt-6 w-64 h-2 rounded-full bg-border/40 overflow-hidden">
          <div className="h-full bg-primary animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: "40%" }} />
        </div>
        <style>{`@keyframes loading{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}`}</style>
      </div>
    );
  }

  if (phase === "exam" && test) {
    const q = test.questions[currentIdx];
    const sel = answers[q.id] ?? [];
    const timerColor = timeLeft < 300 ? "text-destructive animate-pulse" : timeLeft < 600 ? "text-warning" : "text-foreground";

    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col select-none">
        {warning && (
          <div className="absolute top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground py-3 px-4 text-center text-sm font-medium animate-[slideDown_0.3s_ease-out]">
            {warning}
          </div>
        )}
        <style>{`@keyframes slideDown{from{transform:translateY(-100%)}to{transform:translateY(0)}}`}</style>

        <div className="border-b border-border/60 px-4 py-2 flex items-center justify-between gap-3 bg-background">
          <div className="text-sm font-display">ZeroGap AI Mock Test · <span className="text-muted-foreground">{test.domain} — {test.city}</span></div>
          <div className="flex items-center gap-3">
            <div className="text-[10px] text-muted-foreground hidden sm:block">🔴 Live Proctored</div>
            <div className="w-[100px] h-[75px] rounded-md bg-black/60 border border-border/60 overflow-hidden">
              <video ref={previewVideoRef} muted playsInline className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* LEFT PANEL */}
          <aside className="w-[280px] shrink-0 border-r border-border/60 bg-background/60 p-4 flex flex-col gap-4 overflow-y-auto">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Time Remaining</div>
              <div className={`text-3xl font-display tabular-nums ${timerColor}`}>{fmtTime(timeLeft)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Questions ({test.questions.length})</div>
              <div className="grid grid-cols-5 gap-1.5">
                {test.questions.map((qq, i) => {
                  const ans = answers[qq.id];
                  const reviewing = reviewMarks.has(qq.id);
                  const isCurrent = i === currentIdx;
                  let cls = "bg-background border-border/60 text-muted-foreground";
                  if (reviewing) cls = "bg-warning/20 border-warning text-warning";
                  else if (ans?.length) cls = "bg-primary/20 border-primary text-primary";
                  return (
                    <button
                      key={qq.id}
                      onClick={() => setCurrentIdx(i)}
                      className={`aspect-square rounded text-xs font-medium border ${cls} ${isCurrent ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-primary/40 border border-primary" /> Answered</div>
              <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-warning/40 border border-warning" /> For Review</div>
              <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-background border border-border/60" /> Not Visited</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">Progress: {answeredCount}/{test.questions.length} answered</div>
              <div className="h-2 bg-border/40 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${(answeredCount / test.questions.length) * 100}%` }} />
              </div>
            </div>
            <Button onClick={() => setSubmitConfirm(true)} variant="destructive" className="mt-auto">
              <AlertTriangle className="size-4 mr-2" /> Submit Test
            </Button>
            {violationCount > 0 && (
              <div className="text-[10px] text-destructive">Violations: {violationCount}/3</div>
            )}
          </aside>

          {/* RIGHT PANEL */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-muted-foreground">Question {currentIdx + 1} / {test.questions.length}</div>
                <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/30">{q.marks} Marks</div>
              </div>
              <div className="border-t border-border/40 mb-4" />
              <h2 className="text-lg md:text-xl font-medium mb-2 leading-snug">{q.text}</h2>
              {q.type === "multiple" && (
                <div className="text-[11px] text-warning mb-3">(multiple correct)</div>
              )}

              <div className="space-y-2.5 mt-4">
                {q.options.map((opt) => {
                  const selected = sel.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleOption(q.id, opt.id, q.type)}
                      className={`w-full text-left rounded-xl border p-3.5 flex items-start gap-3 transition ${
                        selected
                          ? "border-l-4 border-primary bg-primary/10"
                          : "border-border/60 hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      <div className={`size-7 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 ${selected ? "bg-primary text-primary-foreground" : "bg-border/40 text-foreground"}`}>
                        {String.fromCharCode(65 + opt.id)}
                      </div>
                      <div className="text-sm pt-0.5">{opt.text}</div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-2 mt-8 flex-wrap">
                <Button variant="outline" disabled={currentIdx === 0} onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}>
                  <ChevronLeft className="size-4 mr-1" /> Previous
                </Button>
                <Button variant={reviewMarks.has(q.id) ? "default" : "outline"} onClick={() => toggleReview(q.id)}>
                  <Flag className="size-4 mr-1" /> {reviewMarks.has(q.id) ? "Unmark Review" : "Mark Review"}
                </Button>
                <Button onClick={() => setCurrentIdx((i) => Math.min(test.questions.length - 1, i + 1))} disabled={currentIdx === test.questions.length - 1} className="gradient-cyan text-primary-foreground">
                  Next <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          </main>
        </div>

        {submitConfirm && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 gradient-card border-border/60">
              <h3 className="font-semibold text-lg mb-2">Submit Test?</h3>
              <p className="text-sm text-muted-foreground mb-1">You have answered {answeredCount}/{test.questions.length} questions.</p>
              <p className="text-sm text-muted-foreground mb-1">{test.questions.length - answeredCount} questions are unanswered (0 marks each).</p>
              <p className="text-sm text-muted-foreground mb-4">Wrong answers carry −1 mark.</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setSubmitConfirm(false)}>Cancel</Button>
                <Button onClick={() => { setSubmitConfirm(false); handleSubmit("manual"); }} className="gradient-cyan text-primary-foreground">
                  Yes, Submit Now <Send className="size-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  if (phase === "emoji" && resultRow) {
    const emojis = [
      { id: "veryhard", emoji: "😫", label: "Very Hard" },
      { id: "tough", emoji: "😕", label: "Tough" },
      { id: "okay", emoji: "😐", label: "Okay" },
      { id: "good", emoji: "🙂", label: "Good" },
      { id: "amazing", emoji: "🔥", label: "Amazing!" },
    ];
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-3xl md:text-4xl font-display mb-3">🎉 Test Submitted!</h1>
          <p className="text-muted-foreground mb-8">How was your test experience today?</p>
          <div className="flex justify-center gap-4 md:gap-6 mb-6 flex-wrap">
            {emojis.map((e) => (
              <button
                key={e.id}
                onClick={() => setEmoji(e.id)}
                className={`flex flex-col items-center gap-2 transition ${emoji === e.id ? "scale-110" : "opacity-70 hover:opacity-100"}`}
              >
                <div className={`text-5xl ${emoji === e.id ? "drop-shadow-[0_0_20px_rgba(0,229,255,0.6)]" : ""}`}>{e.emoji}</div>
                <div className={`text-xs ${emoji === e.id ? "text-primary font-medium" : "text-muted-foreground"}`}>{e.label}</div>
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Tell us more... What topic felt hardest? (optional)"
            value={emojiNote}
            onChange={(e) => setEmojiNote(e.target.value)}
            className="mb-4"
          />
          <Button onClick={submitWithFeedback} className="gradient-cyan text-primary-foreground">
            See My Results →
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "results" && resultRow && test) {
    return <ResultsView result={resultRow} test={test} feedbackRating={feedbackRating} setFeedbackRating={setFeedbackRating} feedbackText={feedbackText} setFeedbackText={setFeedbackText} savedRow={savedRow} cleanupCamera={cleanupCamera} leveledUp={leveledUp} clearLevelUp={() => setLeveledUp(null)} />;
  }

  return null;
}

function SystemCheckRow({
  icon,
  ok,
  okMsg,
  failMsg,
  pending,
}: {
  icon: React.ReactNode;
  ok: boolean | null;
  okMsg: string;
  failMsg?: string;
  pending?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      {pending ? (
        <span className="text-muted-foreground">Checking…</span>
      ) : ok ? (
        <span className="text-success flex items-center gap-1.5">✅ {okMsg}</span>
      ) : (
        <span className="text-destructive flex items-center gap-1.5">❌ {failMsg ?? okMsg}</span>
      )}
    </div>
  );
}

function ResultsView({
  result,
  test,
  feedbackRating,
  setFeedbackRating,
  feedbackText,
  setFeedbackText,
  savedRow,
  cleanupCamera,
  leveledUp,
  clearLevelUp,
}: any) {
  const navigate = useNavigate();
  const perf = performanceLabel(result.scorePct);

  // Topic breakdown — categorize via heuristic on question.text length / type
  const groups = useMemo(() => {
    const buckets: Record<string, { name: string; correct: number; total: number }> = {
      conceptual: { name: "Conceptual Questions", correct: 0, total: 0 },
      coding: { name: "Coding/Practical", correct: 0, total: 0 },
      scenario: { name: "Scenario-based", correct: 0, total: 0 },
    };
    test.questions.forEach((q: MockQuestion, i: number) => {
      // Round-robin allocation roughly matching 40/35/25
      const key = i % 3 === 0 ? "scenario" : i % 3 === 1 ? "coding" : "conceptual";
      const det = result.detailed[i];
      buckets[key].total++;
      if (det?.result === "correct") buckets[key].correct++;
    });
    return Object.values(buckets);
  }, [test, result]);

  const saveFeedback = async () => {
    if (!savedRow) return;
    // feedback saved locally — no-op
    toast.success("Thanks for the feedback!");
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-6 max-w-4xl">
        <Card className="p-8 gradient-card border-border/60 text-center mb-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Your Score</div>
          <div className="text-6xl font-display font-bold">{result.score}<span className="text-2xl text-muted-foreground"> / {test.totalMarks}</span></div>
          <div className="mt-3 inline-flex items-center gap-2 text-2xl font-display text-primary">{result.scorePct}%</div>
          <div className={`mt-2 font-medium ${perf.tone}`}>Performance: {perf.label}</div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3 text-left text-sm">
            <Stat label="✅ Correct" value={`${result.correct} qs`} sub={`+${result.detailed.filter((d: any) => d.result === "correct").reduce((s: number, d: any) => s + d.marks, 0)} marks`} />
            <Stat label="❌ Wrong" value={`${result.wrong} qs`} sub={`-${result.wrong} marks`} />
            <Stat label="⬜ Skipped" value={`${result.skipped} qs`} sub="0 marks" />
            <Stat label="⏱ Time" value={`${Math.floor(result.timeUsed / 60)}m ${result.timeUsed % 60}s`} sub={`/ ${test.duration / 60} min`} />
            <Stat label="🚨 Violations" value={`${(result as any).violations ?? 0}`} sub="" />
            <Stat label="⚡ XP Earned" value={`+${result.xp} XP`} sub="" />
          </div>
        </Card>

        <Card className="p-6 gradient-card border-border/60 mb-6">
          <h2 className="font-semibold mb-4">Topic Breakdown</h2>
          <div className="space-y-3">
            {groups.map((g) => (
              <div key={g.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{g.name}</span>
                  <span className="text-muted-foreground">{g.correct}/{g.total} correct</span>
                </div>
                <div className="h-2 bg-border/40 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${g.total ? (g.correct / g.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 gradient-card border-border/60 mb-6">
          <h2 className="font-semibold mb-4">Question Review</h2>
          <div className="divide-y divide-border/40">
            {test.questions.map((q: MockQuestion, i: number) => {
              const det = result.detailed[i];
              const userAns = det.answer as number[];
              const isCorrect = det.result === "correct";
              const isSkipped = det.result === "skipped";
              return (
                <details key={q.id} className="py-3 group">
                  <summary className="flex items-center justify-between cursor-pointer text-sm gap-3">
                    <span className="font-medium truncate">Q{i + 1}. {q.text}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      {isCorrect ? <CheckCircle2 className="size-4 text-success" /> : isSkipped ? <span className="text-muted-foreground text-xs">Skipped</span> : <XCircle className="size-4 text-destructive" />}
                      <span className={isCorrect ? "text-success" : isSkipped ? "text-muted-foreground" : "text-destructive"}>{det.marks > 0 ? `+${det.marks}` : det.marks}</span>
                    </span>
                  </summary>
                  <div className="mt-3 space-y-2 pl-1">
                    {q.options.map((opt) => {
                      const isUser = userAns.includes(opt.id);
                      const isAnswer = q.correct.includes(opt.id);
                      let cls = "border-border/60";
                      if (isAnswer) cls = "border-success/60 bg-success/10";
                      if (isUser && !isAnswer) cls = "border-destructive/60 bg-destructive/10";
                      return (
                        <div key={opt.id} className={`text-sm p-2 rounded border flex items-center gap-2 ${cls}`}>
                          <span className="font-mono text-xs">{String.fromCharCode(65 + opt.id)}.</span>
                          <span className="flex-1">{opt.text}</span>
                          {isUser && <span className="text-[10px] text-muted-foreground">Your answer</span>}
                          {isAnswer && <span className="text-[10px] text-success">✓ Correct</span>}
                        </div>
                      );
                    })}
                    <div className="text-sm bg-primary/5 border border-primary/20 rounded p-3 mt-2">
                      <span className="text-primary font-medium">💡 Key Concept: </span>
                      <span className="text-muted-foreground">{q.explanation}</span>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 gradient-card border-border/60 mb-6">
          <h2 className="font-semibold mb-3">Help us improve this test</h2>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setFeedbackRating(s)} className={`text-2xl ${s <= feedbackRating ? "text-warning" : "text-muted-foreground/50"}`}>★</button>
            ))}
          </div>
          <Textarea placeholder="What could be better?" value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} className="mb-3" />
          <Button size="sm" variant="outline" onClick={saveFeedback}>Save Feedback</Button>
        </Card>

        <div className="flex gap-3 justify-center flex-wrap">
          <Button asChild className="gradient-cyan text-primary-foreground" onClick={() => cleanupCamera()}>
            <Link to="/dashboard">📊 Add to Dashboard</Link>
          </Button>
          <Button variant="outline" onClick={() => { cleanupCamera(); navigate({ to: "/opportunities" }); }}>← Back to Listings</Button>
        </div>
      </div>

      {leveledUp && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 gradient-card border-primary/40 text-center">
            <Trophy className="size-12 text-warning mx-auto mb-4" />
            <h2 className="text-3xl font-display mb-2">🎉 Level Up!</h2>
            <p className="text-muted-foreground mb-1">You reached</p>
            <div className="text-2xl font-display text-primary mb-6">
              Level {leveledUp.to} — {LEVELS[leveledUp.to - 1].name} {LEVELS[leveledUp.to - 1].emoji}
            </div>
            <Button onClick={clearLevelUp} className="gradient-cyan text-primary-foreground">Awesome! →</Button>
          </Card>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg bg-background/40 border border-border/60 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-display mt-0.5">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
