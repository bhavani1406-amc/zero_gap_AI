import { createFileRoute } from "@tanstack/react-router";
import { callAI } from "@/lib/ai.server";

export const Route = createFileRoute("/api/generate-roadmap")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { goal } = await request.json();
          if (!goal) return Response.json({ error: "Goal required" }, { status: 400 });

          const result = await callAI({
            system: `You design intensive 48-hour micro-roadmaps for undergraduate students to bridge a specific skill gap and become recruiter-ready. Each task must be concrete, time-boxed, and produce visible artifacts (project, repo, post, certificate) that strengthen the resume.`,
            user: `Build a 48-hour roadmap for: "${goal}"`,
            tool: {
              name: "submit_roadmap",
              description: "Submit 48h micro-roadmap",
              parameters: {
                type: "object",
                properties: {
                  intro: { type: "string", description: "1-2 sentence summary of the plan" },
                  tasks: {
                    type: "array",
                    minItems: 8,
                    maxItems: 12,
                    items: {
                      type: "object",
                      properties: {
                        hour_block: { type: "integer", minimum: 0, maximum: 48, description: "Approximate hour into the 48h plan" },
                        title: { type: "string", description: "Short imperative task title" },
                        description: { type: "string", description: "Concrete steps + expected output (1-2 sentences)" },
                      },
                      required: ["hour_block", "title", "description"],
                    },
                  },
                },
                required: ["intro", "tasks"],
              },
            },
          });
          return Response.json(result);
        } catch (e: any) {
          console.error("generate-roadmap error:", e);
          return Response.json({ error: e.message ?? "Failed" }, { status: 500 });
        }
      },
    },
  },
});
