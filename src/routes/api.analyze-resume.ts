import { createFileRoute } from "@tanstack/react-router";
import { callAI } from "@/lib/ai.server";

export const Route = createFileRoute("/api/analyze-resume")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { text, fileName } = await request.json();
          if (!text || typeof text !== "string") {
            return Response.json({ error: "No resume text provided" }, { status: 400 });
          }
          const truncated = text.slice(0, 12000);

          const result = await callAI({
            system: `You are an expert ATS (Applicant Tracking System) analyzer for 2026 tech internships and entry-level jobs. Analyze resumes for: keyword optimization, action verbs, quantified impact, current trending skills (Agentic AI, RAG, LLMs, Rust, Edge Computing, FinTech, Cybersecurity), formatting, and recruiter-readiness. Be honest and specific.`,
            user: `Analyze this resume (file: ${fileName}):\n\n${truncated}`,
            tool: {
              name: "submit_analysis",
              description: "Submit ATS analysis results",
              parameters: {
                type: "object",
                properties: {
                  ats_score: { type: "integer", minimum: 0, maximum: 100, description: "ATS-friendliness score" },
                  trend_score: { type: "integer", minimum: 0, maximum: 100, description: "How aligned with 2026 market trends" },
                  summary: { type: "string", description: "2-3 sentence overall assessment" },
                  strengths: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
                  weaknesses: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
                  suggestions: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 8, description: "Concrete, actionable improvements" },
                  missing_keywords: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 10, description: "Trending 2026 keywords missing from resume" },
                },
                required: ["ats_score", "trend_score", "summary", "strengths", "weaknesses", "suggestions", "missing_keywords"],
              },
            },
          });

          return Response.json(result);
        } catch (e: any) {
          console.error("analyze-resume error:", e);
          return Response.json({ error: e.message ?? "Analysis failed" }, { status: 500 });
        }
      },
    },
  },
});
