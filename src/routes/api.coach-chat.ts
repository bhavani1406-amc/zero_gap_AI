import { createFileRoute } from "@tanstack/react-router";

const MODEL = "llama-3.3-70b-versatile";
const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";

export const Route = createFileRoute("/api/coach-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages } = await request.json();
          const apiKey = process.env.GROQ_API_KEY;
          if (!apiKey)
            return Response.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });

          const res = await fetch(GROQ_API, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: MODEL,
              stream: true,
              messages: [
                {
                  role: "system",
                  content: `You are the ZeroGap AI Confidence Coach — an empathetic, energetic mentor for undergraduate students dealing with internship rejections, self-doubt, and skill anxiety. Your job: (1) Lift their mood and rebuild confidence with genuine warmth (not toxic positivity). (2) Give concrete, actionable upskilling steps tailored to 2026 tech trends. (3) Reframe rejections as data, not failure. Use markdown. Be warm, direct, and motivating. Keep responses focused — 3-6 short paragraphs max.`,
                },
                ...messages,
              ],
              temperature: 0.8,
            }),
          });

          if (!res.ok) {
            if (res.status === 429) return Response.json({ error: "Rate limit — try again shortly." }, { status: 429 });
            const t = await res.text();
            return Response.json({ error: `Groq API error: ${t.slice(0, 200)}` }, { status: 500 });
          }

          // Groq streams OpenAI-compatible SSE — pass through directly
          return new Response(res.body, {
            headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
          });
        } catch (e: any) {
          console.error("coach-chat error:", e);
          return Response.json({ error: e.message ?? "Failed" }, { status: 500 });
        }
      },
    },
  },
});
