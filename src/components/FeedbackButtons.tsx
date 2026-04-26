import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function FeedbackButtons({
  page,
  responseId,
  size = "sm",
}: {
  page: string;
  responseId: string;
  size?: "sm" | "xs";
}) {
  const { user } = useAuth();
  const [chosen, setChosen] = useState<"positive" | "negative" | null>(null);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");
  const [thanks, setThanks] = useState(false);
  const ic = size === "xs" ? "size-3" : "size-3.5";

  const send = async (type: "positive" | "negative", r?: string) => {
    if (!user || chosen) return;
    setChosen(type);
    await supabase.from("ai_feedback").insert({
      user_id: user.id, page, response_id: responseId, feedback_type: type, reason: r ?? null,
    });
    setThanks(true);
    setTimeout(() => setThanks(false), 2500);
  };

  return (
    <div className="inline-flex items-center gap-1.5 mt-1">
      <button
        type="button"
        title="Helpful"
        onClick={() => send("positive")}
        disabled={!!chosen}
        className={`p-1 rounded hover:bg-success/10 transition ${chosen === "positive" ? "text-success" : chosen ? "text-muted-foreground/40" : "text-muted-foreground"}`}
      >
        <ThumbsUp className={ic} />
      </button>
      <button
        type="button"
        title="Not helpful"
        onClick={() => { setChosen("negative"); setShowReason(true); }}
        disabled={!!chosen}
        className={`p-1 rounded hover:bg-destructive/10 transition ${chosen === "negative" ? "text-destructive" : chosen ? "text-muted-foreground/40" : "text-muted-foreground"}`}
      >
        <ThumbsDown className={ic} />
      </button>
      {thanks && <span className="text-[10px] text-muted-foreground ml-1">Thanks 🙏</span>}
      {showReason && chosen === "negative" && !reason && (
        <select
          autoFocus
          value=""
          onChange={(e) => { setReason(e.target.value); send("negative", e.target.value); setShowReason(false); }}
          className="text-[10px] bg-background border border-border rounded px-1 py-0.5 ml-1"
        >
          <option value="">Why?</option>
          <option value="inaccurate">Inaccurate</option>
          <option value="not_helpful">Not helpful</option>
          <option value="too_generic">Too generic</option>
          <option value="other">Other</option>
        </select>
      )}
    </div>
  );
}
