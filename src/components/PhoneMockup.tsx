import { useEffect, useRef } from "react";

export function PhoneMockup() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      el.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="hidden md:block relative">
      <div className="absolute inset-0 -z-10 blur-3xl opacity-40 rounded-full bg-primary/40 mx-auto my-auto" style={{ width: 300, height: 300 }} />
      <div className="phone-float" style={{ transition: "transform 0.1s ease" }}>
        <div ref={ref} className="relative w-[220px] h-[440px] rounded-[36px] bg-[oklch(0.18_0.04_250)] border-2 border-[oklch(0.32_0.04_250)] mx-auto shadow-2xl">
          <div className="absolute right-[-3px] top-20 w-[3px] h-12 bg-[oklch(0.32_0.04_250)] rounded-l" />
          <div className="absolute right-[-3px] top-40 w-[3px] h-16 bg-[oklch(0.32_0.04_250)] rounded-l" />
          <div className="mx-auto mt-3 w-[60px] h-2 rounded-full bg-[oklch(0.32_0.04_250)]" />
          <div className="mx-auto mt-3 w-[196px] h-[390px] rounded-[24px] bg-[oklch(0.14_0.03_250)] overflow-hidden p-3 flex flex-col">
            <div className="text-[10px] font-display font-bold text-primary tracking-wider">ZEROGAP AI</div>
            <div className="mt-3 mx-auto relative">
              <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
                <circle cx="40" cy="40" r="32" stroke="oklch(0.28 0.04 250)" strokeWidth="6" fill="none" />
                <circle cx="40" cy="40" r="32" stroke="oklch(0.75 0.18 155)" strokeWidth="6" fill="none"
                  strokeDasharray="201" strokeDashoffset="32" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl font-display font-bold text-success">84</div>
                <div className="text-[7px] text-muted-foreground">/100</div>
              </div>
            </div>
            <div className="text-center text-[9px] text-foreground mt-1">Resume Analysis</div>
            <div className="mt-3 space-y-1.5">
              {[
                ["Keywords", "✓ 12/15", "text-success"],
                ["Formatting", "✓ Good", "text-success"],
                ["Skills", "⚠ 2 missing", "text-warning"],
              ].map(([k, v, c]) => (
                <div key={k} className="flex justify-between text-[8px] px-2 py-1 rounded bg-background/40 border border-border/40">
                  <span className="text-muted-foreground">{k}</span>
                  <span className={c as string}>{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto rounded-lg gradient-cyan text-center py-1.5 text-[8px] font-semibold text-primary-foreground">
              View Full Report →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
