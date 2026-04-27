export function IndiaCityMap({
  activeCity,
  onCityClick,
}: {
  activeCity?: string | null;
  onCityClick?: (city: string) => void;
}) {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/8" style={{ height: "520px" }}>
      <iframe
        src="/india-heatmap.html"
        className="w-full h-full border-0"
        title="India IT Hiring Heatmap"
      />
    </div>
  );
}
