import { createFileRoute } from "@tanstack/react-router";
import { callAI } from "@/lib/ai.server";

export const Route = createFileRoute("/api/market-trend")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { role } = await request.json();
          if (!role) return Response.json({ error: "Role required" }, { status: 400 });

          const result = await callAI({
            system: `You are a 2026 tech labour-market analyst specializing in India and global hiring trends. Provide realistic, data-informed projections for tech roles. Base growth on current AI/cloud/security momentum.`,
            user: `Analyze the career trajectory for: "${role}". Project the next 3 years (2026-2029).`,
            tool: {
              name: "submit_trend",
              description: "Submit market trend analysis",
              parameters: {
                type: "object",
                properties: {
                  growth_probability: { type: "integer", minimum: 0, maximum: 100, description: "Probability (0-100) this role will be highly beneficial in 2-3 years" },
                  demand_today: { type: "integer", minimum: 0, maximum: 100 },
                  demand_2027: { type: "integer", minimum: 0, maximum: 100 },
                  demand_2028: { type: "integer", minimum: 0, maximum: 100 },
                  demand_2029: { type: "integer", minimum: 0, maximum: 100 },
                  trend_direction: { type: "string", enum: ["rising_fast", "rising", "stable", "declining"] },
                  avg_salary_inr_lakhs: { type: "number", description: "Average annual salary in India (lakhs INR) for entry-mid level" },
                  top_skills: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 8 },
                  top_cities: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
                  outlook: { type: "string", description: "2-3 sentence outlook with concrete advice" },
                  recommended_action: { type: "string", description: "One-line strategic recommendation" },
                },
                required: ["growth_probability", "demand_today", "demand_2027", "demand_2028", "demand_2029", "trend_direction", "avg_salary_inr_lakhs", "top_skills", "top_cities", "outlook", "recommended_action"],
              },
            },
          });
          return Response.json(result);
        } catch (e: any) {
          console.error("market-trend error:", e);
          return Response.json({ error: e.message ?? "Failed" }, { status: 500 });
        }
      },
    },
  },
});
