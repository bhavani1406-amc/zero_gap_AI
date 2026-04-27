import { createFileRoute } from "@tanstack/react-router";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are the ZeroGap AI Confidence Coach — an empathetic, energetic mentor for undergraduate students dealing with internship rejections, self-doubt, and skill anxiety. Your job: (1) Lift their mood and rebuild confidence with genuine warmth (not toxic positivity). (2) Give concrete, actionable upskilling steps tailored to 2026 tech trends. (3) Reframe rejections as data, not failure. Use markdown. Be warm, direct, and motivating. Keep responses focused — 3-6 short paragraphs max.`;

async function streamFrom(
  url: string,
  apiKey: string,
  model: string,
  messages: any[]
): Promise<Response> {
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: true,
      temperature: 0.8,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    }),
  });
  return res;
}

export const Route = createFileRoute("/api/coach-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages } = await request.json();

          const amdUrl = process.env.AMD_API_URL;
          const amdKey = process.env.AMD_API_KEY;
          const amdModel = process.env.AMD_MODEL ?? "llama-3.3-70b";

          // ── Try AMD first if configured ──
          if (amdUrl && amdKey) {
            try {
              const amdRes = await streamFrom(amdUrl, amdKey, amdModel, messages);

              if (amdRes.ok) {
                return new Response(amdRes.body, {
                  headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
                });
              }

              // 429 → surface immediately, no fallback
              if (amdRes.status === 429) {
                return Response.json({ error: "Rate limit — try again shortly." }, { status: 429 });
              }

              // 5xx → log and fall through to Groq
              if (amdRes.status >= 500) {
                const t = await amdRes.text();
                console.warn(`[coach-chat] AMD error ${amdRes.status}, falling back to Groq:`, t.slice(0, 200));
              } else {
                const t = await amdRes.text();
                return Response.json({ error: `AMD API error: ${t.slice(0, 200)}` }, { status: amdRes.status });
              }
            } catch (networkErr: any) {
              console.warn("[coach-chat] AMD network error, falling back to Groq:", networkErr?.message);
            }
          }

          // ── Groq fallback ──
          const groqKey = process.env.GROQ_API_KEY;
          if (!groqKey) return Response.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });

          const groqRes = await streamFrom(GROQ_API, groqKey, GROQ_MODEL, messages);

          if (!groqRes.ok) {
            if (groqRes.status === 429) return Response.json({ error: "Rate limit — try again shortly." }, { status: 429 });
            const t = await groqRes.text();
            return Response.json({ error: `Groq API error: ${t.slice(0, 200)}` }, { status: 500 });
          }

          return new Response(groqRes.body, {
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
