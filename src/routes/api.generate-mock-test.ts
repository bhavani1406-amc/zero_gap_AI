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

          const system = `You are an expert technical interviewer for Indian engineering students. Output ONLY via the provided tool. No prose.`;

          // --- Section 1: 10 MCQs (10 min) ---
          const mcqResult = await callAI({
            system,
            user: `Generate exactly 10 multiple choice questions for a ${domain} interview test targeting freshers in ${city}. Mix of easy and medium difficulty. Each question has 4 options (ids 0-3), one correct answer, and a brief explanation.`,
            tool: {
              name: "submit_mcq",
              description: "Submit 10 MCQ questions",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        text: { type: "string" },
                        options: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: { id: { type: "number" }, text: { type: "string" } },
                            required: ["id", "text"],
                          },
                        },
                        correct: { type: "number", description: "The correct option id (0-3)" },
                        explanation: { type: "string" },
                        marks: { type: "number" },
                      },
                      required: ["id", "text", "options", "correct", "explanation", "marks"],
                    },
                  },
                },
                required: ["questions"],
              },
            },
          });

          // --- Section 2: 2 Coding Questions ---
          const codingResult = await callAI({
            system,
            user: `Generate exactly 2 coding problems for a ${domain} interview. One easy (implement a function), one medium (algorithm/data structure). Include problem statement, example input/output, constraints, and a sample solution in Python or Java.`,
            tool: {
              name: "submit_coding",
              description: "Submit 2 coding problems",
              parameters: {
                type: "object",
                properties: {
                  problems: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        title: { type: "string" },
                        difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
                        statement: { type: "string" },
                        example_input: { type: "string" },
                        example_output: { type: "string" },
                        constraints: { type: "string" },
                        solution: { type: "string" },
                        marks: { type: "number" },
                      },
                      required: ["id", "title", "difficulty", "statement", "example_input", "example_output", "constraints", "solution", "marks"],
                    },
                  },
                },
                required: ["problems"],
              },
            },
          });

          // --- Section 3: DSA Section (45 min, 5 questions) ---
          const dsaResult = await callAI({
            system,
            user: `Generate exactly 5 DSA (Data Structures & Algorithms) multiple choice questions for a ${domain} interview in ${city}. Cover arrays, linked lists, trees, graphs, or dynamic programming. Each has 4 options, one correct answer, explanation, and marks.`,
            tool: {
              name: "submit_dsa",
              description: "Submit 5 DSA questions",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        text: { type: "string" },
                        topic: { type: "string" },
                        options: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: { id: { type: "number" }, text: { type: "string" } },
                            required: ["id", "text"],
                          },
                        },
                        correct: { type: "number" },
                        explanation: { type: "string" },
                        marks: { type: "number" },
                      },
                      required: ["id", "text", "topic", "options", "correct", "explanation", "marks"],
                    },
                  },
                },
                required: ["questions"],
              },
            },
          });

          const result = {
            testId: `test_${Date.now()}`,
            domain,
            city,
            sections: {
              mcq: {
                title: "Multiple Choice Questions",
                duration: 600, // 10 min
                questions: (mcqResult.questions ?? []).map((q: any) => ({
                  ...q,
                  type: "single",
                  correct: [q.correct],
                })),
              },
              coding: {
                title: "Coding Challenges",
                duration: 0, // unproctored
                problems: codingResult.problems ?? [],
              },
              dsa: {
                title: "Data Structures & Algorithms",
                duration: 2700, // 45 min
                questions: (dsaResult.questions ?? []).map((q: any) => ({
                  ...q,
                  type: "single",
                  correct: [q.correct],
                })),
              },
            },
            totalMarks:
              (mcqResult.questions ?? []).reduce((s: number, q: any) => s + (q.marks ?? 3), 0) +
              (codingResult.problems ?? []).reduce((s: number, p: any) => s + (p.marks ?? 10), 0) +
              (dsaResult.questions ?? []).reduce((s: number, q: any) => s + (q.marks ?? 5), 0),
          };

          return Response.json(result);
        } catch (e: any) {
          console.error("generate-mock-test error:", e);
          return Response.json({ error: e.message ?? "Failed to generate test" }, { status: 500 });
        }
      },
    },
  },
});
