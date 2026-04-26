import { createFileRoute } from "@tanstack/react-router";
import { callAI } from "@/lib/ai.server";

export const Route = createFileRoute("/api/generate-mock-test")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { domain, city } = await request.json();
          if (!domain || !city) {
            return Response.json({ error: "domain and city required" }, { status: 400 });
          }

          const seed = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
          const system = `You are an expert technical interviewer crafting a mock test for Indian engineering students. Output ONLY valid JSON via the provided tool. No prose.`;

          const user = `Generate exactly 30 unique multiple choice questions for a professional tech interview mock test.

Domain: ${domain}
Target companies in: ${city}
Level: Fresher to 2 years experience
Unique seed (do not include in output): ${seed}

Requirements:
- Questions must reflect what REAL recruiters ask for ${domain} roles in ${city}
- Difficulty mix: 10 Easy (3 marks each), 15 Medium (3 marks each), 5 Hard (4 marks each)
- Total marks = 100
- Types: roughly 21 single-correct ("single") and 9 multiple-correct ("multiple")
- Topic mix: ~40% conceptual theory, ~35% code/practical, ~25% scenario-based
- Each question must have exactly 4 options
- "correct" is an array of option ids (0-3); for "single" type it has length 1
- Provide a 2-3 sentence "explanation" for each
- Randomize order; do not include the seed in the response`;

          const tool = {
            name: "submit_mock_test",
            description: "Submit a generated 30-question mock test.",
            parameters: {
              type: "object",
              properties: {
                testId: { type: "string" },
                domain: { type: "string" },
                city: { type: "string" },
                totalMarks: { type: "number" },
                duration: { type: "number" },
                questions: {
                  type: "array",
                  minItems: 30,
                  maxItems: 30,
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      text: { type: "string" },
                      type: { type: "string", enum: ["single", "multiple"] },
                      marks: { type: "number" },
                      options: {
                        type: "array",
                        minItems: 4,
                        maxItems: 4,
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "number" },
                            text: { type: "string" },
                          },
                          required: ["id", "text"],
                        },
                      },
                      correct: {
                        type: "array",
                        items: { type: "number" },
                        minItems: 1,
                      },
                      explanation: { type: "string" },
                    },
                    required: ["id", "text", "type", "marks", "options", "correct", "explanation"],
                  },
                },
              },
              required: ["testId", "domain", "city", "totalMarks", "duration", "questions"],
            },
          };

          const result = await callAI({ system, user, tool });

          // Sanity defaults
          if (!result.testId) result.testId = `test_${Date.now()}`;
          if (!result.duration) result.duration = 2700;
          if (!result.totalMarks) result.totalMarks = 100;

          return Response.json(result);
        } catch (e: any) {
          console.error("generate-mock-test error:", e);
          return Response.json({ error: e.message ?? "Failed to generate test" }, { status: 500 });
        }
      },
    },
  },
});
