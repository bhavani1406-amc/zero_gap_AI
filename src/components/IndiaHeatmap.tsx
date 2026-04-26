import { useEffect, useState } from "react";

const cities = [
  { name: "Bengaluru", cx: 210, cy: 290, color: "#00e5ff", size: 8, label: "AI/ML Hub 🔥", listings: 842 },
  { name: "Mumbai",    cx: 155, cy: 230, color: "#a78bfa", size: 7, label: "FinTech 📈",  listings: 612 },
  { name: "Hyderabad", cx: 215, cy: 255, color: "#34d399", size: 6, label: "Cloud & SaaS", listings: 487 },
  { name: "Pune",      cx: 165, cy: 238, color: "#fbbf24", size: 6, label: "Web Dev",     listings: 391 },
  { name: "Delhi",     cx: 195, cy: 140, color: "#f87171", size: 7, label: "Govt Tech",   listings: 326 },
  { name: "Chennai",   cx: 215, cy: 305, color: "#60a5fa", size: 5, label: "Data Eng.",   listings: 189 },
];

export function IndiaHeatmap() {
  const [count, setCount] = useState(2847);
  const [hover, setHover] = useState<typeof cities[number] | null>(null);

  useEffect(() => {
    const id = setInterval(() => setCount((c) => c + 1), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="container mx-auto px-4 py-20 border-t border-border/50 dark-section">
      <div className="text-center mb-10">
        <div className="text-xs uppercase tracking-widest text-primary mb-2">Localized intelligence</div>
        <h2 className="text-3xl md:text-5xl font-bold">Your <span className="text-gradient-cyan">city</span>, your jobs.</h2>
        <div className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <span className="size-2 rounded-full bg-success animate-pulse" />
          <span><span className="text-success font-semibold">{count.toLocaleString()}</span> opportunities mapped live</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
        <div className="relative mx-auto">
          <svg width="340" height="360" viewBox="0 0 340 360" className="bg-[oklch(0.14_0.03_250)] rounded-2xl border border-border/60">
            <defs>
              <pattern id="grid-india" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="340" height="360" fill="url(#grid-india)" />
            {/* Simplified India silhouette */}
            <path
              d="M 175 60 L 210 80 L 235 110 L 245 145 L 250 175 L 260 200 L 250 230 L 240 260 L 225 290 L 215 320 L 195 340 L 175 320 L 160 295 L 145 270 L 130 245 L 120 215 L 115 185 L 120 160 L 130 135 L 140 110 L 155 85 Z"
              fill="rgba(255,255,255,0.03)"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
            />
            {cities.map((c) => (
              <g key={c.name} onMouseEnter={() => setHover(c)} onMouseLeave={() => setHover(null)} style={{ cursor: "pointer" }}>
                <circle cx={c.cx} cy={c.cy} r={c.size * 2} fill={c.color} opacity="0.4">
                  <animate attributeName="r" from={c.size} to={c.size * 2.5} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={c.cx} cy={c.cy} r={c.size * 2} fill={c.color} opacity="0.4">
                  <animate attributeName="r" from={c.size} to={c.size * 2.5} dur="2s" begin="0.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.4" to="0" dur="2s" begin="0.6s" repeatCount="indefinite" />
                </circle>
                <circle cx={c.cx} cy={c.cy} r={c.size} fill={c.color} />
              </g>
            ))}
            {hover && (
              <g pointerEvents="none">
                <rect x={hover.cx + 10} y={hover.cy - 30} width="140" height="42" rx="6" fill="oklch(0.22 0.045 250)" stroke={hover.color} />
                <text x={hover.cx + 18} y={hover.cy - 14} fill="white" fontSize="11" fontWeight="600">{hover.name}</text>
                <text x={hover.cx + 18} y={hover.cy + 1} fill="rgba(255,255,255,0.7)" fontSize="9">{hover.listings} listings this week</text>
              </g>
            )}
          </svg>
        </div>

        <div className="space-y-2">
          {cities.map((c) => (
            <div key={c.name} className="flex items-center justify-between p-3 rounded-lg gradient-card border border-border/60">
              <div className="flex items-center gap-3">
                <span className="size-3 rounded-full" style={{ background: c.color, boxShadow: `0 0 12px ${c.color}` }} />
                <div>
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-display font-bold text-primary">{c.listings}</div>
                <div className="text-[10px] text-muted-foreground">this week</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
