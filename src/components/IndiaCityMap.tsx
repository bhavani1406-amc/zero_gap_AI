type City = { name: string; x: number; y: number; color: string; delay: string };

const CITIES: City[] = [
  { name: "Bengaluru", x: 188, y: 340, color: "#00e5ff", delay: "0s" },
  { name: "Mumbai", x: 118, y: 268, color: "#a78bfa", delay: "0.3s" },
  { name: "Hyderabad", x: 195, y: 295, color: "#00e676", delay: "0.6s" },
  { name: "Pune", x: 135, y: 282, color: "#ffb300", delay: "0.9s" },
  { name: "Delhi NCR", x: 175, y: 142, color: "#ff4d6d", delay: "1.2s" },
  { name: "Chennai", x: 205, y: 368, color: "#60a5fa", delay: "1.5s" },
  { name: "Kolkata", x: 248, y: 218, color: "#fbbf24", delay: "1.8s" },
  { name: "Ahmedabad", x: 108, y: 215, color: "#34d399", delay: "2.1s" },
];

export function IndiaCityMap({
  activeCity,
  onCityClick,
}: {
  activeCity?: string | null;
  onCityClick?: (city: string) => void;
}) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <svg
        viewBox="0 0 340 440"
        className="w-full h-auto rounded-2xl border border-border/60"
        style={{ background: "oklch(0.14 0.03 250)" }}
      >
        <defs>
          <pattern id="grid-india-map" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>
          <linearGradient id="india-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,229,255,0.08)" />
            <stop offset="100%" stopColor="rgba(167,139,250,0.06)" />
          </linearGradient>
        </defs>
        <rect width="340" height="440" fill="url(#grid-india-map)" />

        {/* Main India body */}
        <path
          d="M 160 80 L 175 70 L 195 75 L 215 90 L 240 110 L 255 135 L 260 165 L 250 190 L 245 215 L 250 240 L 245 265 L 235 290 L 220 320 L 210 350 L 200 380 L 188 405 L 175 415 L 162 405 L 150 385 L 140 360 L 128 335 L 118 305 L 108 275 L 100 245 L 98 215 L 102 185 L 110 155 L 122 125 L 140 100 Z"
          fill="url(#india-fill)"
          stroke="rgba(0,229,255,0.4)"
          strokeWidth="1.5"
        />

        {/* Kashmir */}
        <path
          d="M 155 78 L 170 60 L 190 55 L 200 70 L 195 80 L 175 78 Z"
          fill="url(#india-fill)"
          stroke="rgba(0,229,255,0.4)"
          strokeWidth="1.5"
        />

        {/* Northeast */}
        <path
          d="M 252 175 L 280 165 L 300 175 L 305 195 L 290 215 L 265 210 L 250 195 Z"
          fill="url(#india-fill)"
          stroke="rgba(0,229,255,0.4)"
          strokeWidth="1.5"
        />

        {/* Sri Lanka hint */}
        <ellipse cx="210" cy="420" rx="14" ry="18" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

        {/* Andaman Islands */}
        <circle cx="295" cy="370" r="2" fill="rgba(255,255,255,0.2)" />
        <circle cx="298" cy="380" r="1.5" fill="rgba(255,255,255,0.2)" />
        <circle cx="293" cy="390" r="1.5" fill="rgba(255,255,255,0.2)" />

        {/* Subtle state boundary lines */}
        <line x1="115" y1="200" x2="245" y2="200" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2 3" />
        <line x1="170" y1="80" x2="170" y2="400" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="2 3" />
        <line x1="105" y1="270" x2="255" y2="270" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2 3" />
        <line x1="115" y1="330" x2="225" y2="330" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="2 3" />

        {/* City Dots */}
        {CITIES.map((city) => {
          const isActive = activeCity === city.name;
          return (
            <g
              key={city.name}
              style={{ cursor: "pointer" }}
              onClick={() => onCityClick?.(city.name)}
            >
              {/* Outer pulse ring 1 */}
              <circle cx={city.x} cy={city.y} r="6" fill={city.color} opacity="0.4">
                <animate attributeName="r" values="6;18;6" dur="2.5s" begin={city.delay} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" begin={city.delay} repeatCount="indefinite" />
              </circle>

              {/* Outer pulse ring 2 (offset) */}
              <circle cx={city.x} cy={city.y} r="6" fill={city.color} opacity="0.3">
                <animate attributeName="r" values="6;22;6" dur="2.5s" begin={`${parseFloat(city.delay) + 1.0}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" begin={`${parseFloat(city.delay) + 1.0}s`} repeatCount="indefinite" />
              </circle>

              {/* Core dot */}
              <circle
                cx={city.x}
                cy={city.y}
                r={isActive ? 7 : 5}
                fill={city.color}
                stroke={isActive ? "white" : "rgba(255,255,255,0.4)"}
                strokeWidth={isActive ? 2 : 1}
                style={{ filter: `drop-shadow(0 0 6px ${city.color})` }}
              />

              {/* Label */}
              <text
                x={city.x + 10}
                y={city.y + 4}
                fill={isActive ? city.color : "rgba(255,255,255,0.85)"}
                fontSize="10"
                fontWeight={isActive ? 700 : 500}
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)", pointerEvents: "none" }}
              >
                {city.name}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 text-center text-[10px] text-muted-foreground">
        Tap any city to load its skill heatmap
      </div>
    </div>
  );
}
