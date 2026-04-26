// Groq Cloud API — OpenAI-compatible, very fast free tier
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";

export async function callAI(opts: {
  system: string;
  user: string;
  tool?: { name: string; description: string; parameters: any };
  model?: string;
}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY missing from environment");

  const model = opts.model ?? DEFAULT_MODEL;

  const body: any = {
    model,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
    temperature: 0.7,
  };

  if (opts.tool) {
    body.tools = [{ type: "function", function: opts.tool }];
    body.tool_choice = { type: "function", function: { name: opts.tool.name } };
  }

  const res = await fetch(GROQ_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Groq API HTTP ${res.status}:`, text.slice(0, 500));
    if (res.status === 429) throw new Error("Rate limit exceeded — please try again in a moment.");
    if (res.status === 401) throw new Error("Groq API: Invalid API key. Check GROQ_API_KEY.");
    throw new Error(`Groq API error ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const message = data.choices?.[0]?.message;

  if (opts.tool) {
    const toolCall = message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      return typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    }
    // Fallback: parse JSON from text
    const raw = message?.content ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("No tool call in Groq response");
  }

  return message?.content ?? "";
}
