// AI provider: AMD Developer Cloud (MI300X vLLM) PRIMARY → Groq Cloud FALLBACK
const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

type ProviderResult =
  | { ok: true; data: any }
  | { ok: false; status: number; text: string; shouldFallback: boolean };

async function tryProvider(
  url: string,
  apiKey: string,
  model: string,
  body: any
): Promise<ProviderResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...body, model }),
    });

    if (!res.ok) {
      const text = await res.text();
      // 429 and 401 → do NOT fallback, surface immediately
      const shouldFallback = res.status >= 500 && res.status <= 504;
      return { ok: false, status: res.status, text, shouldFallback };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (err: any) {
    // Network error → fallback
    console.warn("[AI] Network error, will fallback:", err?.message ?? err);
    return { ok: false, status: 0, text: err?.message ?? "Network error", shouldFallback: true };
  }
}

function parseToolResult(message: any, toolName: string): any {
  const toolCall = message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    return typeof toolCall.function.arguments === "string"
      ? JSON.parse(toolCall.function.arguments)
      : toolCall.function.arguments;
  }
  // Fallback: parse JSON from text content
  const raw = message?.content ?? "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) return JSON.parse(jsonMatch[0]);
  throw new Error(`No tool call in response for tool: ${toolName}`);
}

export async function callAI(opts: {
  system: string;
  user: string;
  tool?: { name: string; description: string; parameters: any };
  model?: string;
}) {
  const amdUrl = process.env.AMD_API_URL;
  const amdKey = process.env.AMD_API_KEY;
  const amdModel = process.env.AMD_MODEL ?? "llama-3.3-70b";

  const body: any = {
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

  // ── Try AMD first if configured ──
  if (amdUrl && amdKey) {
    const result = await tryProvider(amdUrl, amdKey, opts.model ?? amdModel, body);

    if (result.ok) {
      const message = result.data.choices?.[0]?.message;
      if (opts.tool) return parseToolResult(message, opts.tool.name);
      return message?.content ?? "";
    }

    // Hard errors — do not fallback
    if (result.status === 429) throw new Error("Rate limit exceeded — please try again in a moment.");
    if (result.status === 401) throw new Error("AMD API: Invalid API key. Check AMD_API_KEY.");

    if (result.shouldFallback) {
      console.warn(`[AI] AMD Cloud error ${result.status}, falling back to Groq:`, result.text.slice(0, 200));
    } else {
      throw new Error(`AMD API error ${result.status}: ${result.text.slice(0, 300)}`);
    }
  }

  // ── Groq fallback ──
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error("GROQ_API_KEY missing from environment");

  const groqResult = await tryProvider(GROQ_API, groqKey, opts.model ?? GROQ_MODEL, body);

  if (!groqResult.ok) {
    if (groqResult.status === 429) throw new Error("Rate limit exceeded — please try again in a moment.");
    if (groqResult.status === 401) throw new Error("Groq API: Invalid API key. Check GROQ_API_KEY.");
    throw new Error(`Groq API error ${groqResult.status}: ${groqResult.text.slice(0, 300)}`);
  }

  const message = groqResult.data.choices?.[0]?.message;
  if (opts.tool) return parseToolResult(message, opts.tool.name);
  return message?.content ?? "";
}
