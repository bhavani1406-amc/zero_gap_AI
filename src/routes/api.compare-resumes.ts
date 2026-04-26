import { createFileRoute } from "@tanstack/react-router";
import { callAI } from "@/lib/ai.server";

export const Route = createFileRoute("/api/compare-resumes")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { a, b } = await request.json();
          if (!a || !b) return Response.json({ error: "Two analyses required" }, { status: 400 });

          const result = await callAI({
            system: `You compare two resume analyses (older vs newer) for the same candidate. Be specific, constructive, and highlight measurable progress or regression on ATS-friendliness and 2026 trend alignment.`,
            user: `OLDER (${a.file_name}, ATS ${a.ats_score}, Trend ${a.trend_score}):
Strengths: ${JSON.stringify(a.strengths)}
Weaknesses: ${JSON.stringify(a.weaknesses)}
Missing keywords: ${JSON.stringify(a.missing_keywords)}
Summary: ${a.summary ?? ""}

NEWER (${b.file_name}, ATS ${b.ats_score}, Trend ${b.trend_score}):
Strengths: ${JSON.stringify(b.strengths)}
Weaknesses: ${JSON.stringify(b.weaknesses)}
Missing keywords: ${JSON.stringify(b.missing_keywords)}
Summary: ${b.summary ?? ""}`,
            tool: {
              name: "submit_compare",
              description: "Submit a structured comparison",
              parameters: {
                type: "object",
                properties: {
                  verdict: { type: "string", description: "1-2 sentence overall verdict on progress" },
                  improvements: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 },
                  regressions: { type: "array", items: { type: "string" }, minItems: 0, maxItems: 5 },
                  newly_added_keywords: { type: "array", items: { type: "string" } },
                  still_missing_keywords: { type: "array", items: { type: "string" } },
                  next_actions: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
                },
                required: ["verdict", "improvements", "regressions", "newly_added_keywords", "still_missing_keywords", "next_actions"],
              },
            },
          });

          return Response.json(result);
        } catch (e: any) {
          console.error("compare-resumes error:", e);
          return Response.json({ error: e.message ?? "Compare failed" }, { status: 500 });
        }
      },
    },
  },
});
