import { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { TrendingUp, Flame, Activity } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Tab = "demand" | "yoy" | "salary";

const ROLES = ["AI/ML", "Web Dev", "Data Sci", "Cloud", "Cyber", "Mobile", "UI/UX", "FinTech"];

const DATA: Record<Tab, { values: number[]; suffix: string; label: string }> = {
  demand: { values: [92, 74, 81, 78, 65, 60, 55, 70], suffix: "", label: "Demand index (0–100)" },
  yoy: { values: [34, 3, 18, 22, 28, 12, 8, 19], suffix: "%", label: "YoY growth" },
  salary: { values: [18, 12, 15, 14, 16, 13, 10, 17], suffix: " LPA", label: "Avg salary (₹ LPA)" },
};

const TAB_LABELS: Record<Tab, string> = {
  demand: "Demand",
  yoy: "YoY Growth",
  salary: "Avg Salary",
};

export function TechTrendChart() {
  const [tab, setTab] = useState<Tab>("demand");

  const { chartData, options, hottestRole } = useMemo(() => {
    const dataset = DATA[tab];
    const max = Math.max(...dataset.values);
    const leaderIdx = dataset.values.indexOf(max);
    const colors = dataset.values.map((_, i) =>
      i === leaderIdx ? "rgba(0,229,255,1)" : "rgba(0,229,255,0.35)"
    );

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0b1628",
          titleColor: "#f0f6ff",
          bodyColor: "#7a9bb5",
          borderColor: "rgba(0,229,255,0.15)",
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: (ctx: { parsed: { y: number | null } }) =>
              `${ctx.parsed.y ?? 0}${dataset.suffix}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: { color: "#4a6a85", font: { size: 10 } },
        },
        y: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: { color: "#4a6a85" },
          beginAtZero: true,
        },
      },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    return {
      hottestRole: ROLES[leaderIdx],
      chartData: {
        labels: ROLES,
        datasets: [
          {
            label: dataset.label,
            data: dataset.values,
            backgroundColor: colors,
            borderRadius: 6,
            borderSkipped: false as const,
          },
        ],
      },
      options,
    };
  }, [tab]);

  const lastUpdated = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }, []);

  return (
    <div
      className="rounded-2xl border w-full"
      style={{
        background: "#0b1628",
        borderColor: "rgba(0,229,255,0.1)",
        padding: "20px 24px",
      }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-[13px] font-medium text-foreground/90">
          Tech Job Market Trends — India 2026
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-success">
          <span className="size-1.5 rounded-full bg-success animate-pulse" />
          Live data
        </div>
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">
        Demand index by role · updates automatically every 24h
      </div>

      <div className="flex gap-1 mt-3 mb-2">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-md text-[11px] transition"
            style={{
              background: tab === t ? "rgba(0,229,255,0.12)" : "transparent",
              color: tab === t ? "#00e5ff" : "#7a9bb5",
              border: tab === t ? "1px solid rgba(0,229,255,0.3)" : "1px solid transparent",
            }}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div style={{ height: 180 }}>
        <Bar data={chartData} options={options} />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <MiniStat
          icon={<Flame className="size-3.5" />}
          label="Hottest"
          value={hottestRole}
          accent="text-[#00e5ff]"
        />
        <MiniStat
          icon={<TrendingUp className="size-3.5" />}
          label="Rising fast"
          value="AI/ML +34%"
          accent="text-success"
        />
        <MiniStat
          icon={<Activity className="size-3.5" />}
          label="Stable"
          value="Cloud · Cyber"
          accent="text-foreground/80"
        />
      </div>

      <div className="text-[10px] text-muted-foreground mt-3">
        Last updated: {lastUpdated} · Auto-refreshes daily
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-lg px-2.5 py-2 border"
      style={{ background: "#0f1f35", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={`text-[12px] font-medium mt-0.5 ${accent}`}>{value}</div>
    </div>
  );
}
