require("dotenv").config(); // MUST be first line

const express = require("express");

const app = express();
app.use(express.json({ limit: "2mb" })); // grading text can be large; bump if needed

const PORT = process.env.PORT || 8787;

// Shared secret to prevent random internet users from using your GPU
const SECRET = process.env.LLM_GATEWAY_SECRET;
if (!SECRET) {
  console.error("LLM_GATEWAY_SECRET is not set. Refusing to start.");
  process.exit(1);
}

// Ollama local settings
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1:8b";

function trim(s) {
  return (s || "").toString().trim();
}

async function ollamaGenerateJson({ system, user }) {
  const prompt = `
SYSTEM:
${trim(system)}

USER:
${trim(user)}

IMPORTANT:
Return ONLY valid JSON. No markdown. No extra text.
`.trim();

  const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.2,
      },
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`Ollama error: ${resp.status} ${txt}`);
  }

  const data = await resp.json();
  const raw = trim(data.response);

  // Try parse
  try {
    return JSON.parse(raw);
  } catch {
    // Attempt a JSON “repair” pass using Ollama itself
    const repairPrompt = `
You output invalid JSON. Fix it.
Return ONLY valid JSON.

INVALID:
${raw}
`.trim();

    const resp2 = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: repairPrompt,
        stream: false,
        options: { temperature: 0.0 },
      }),
    });

    if (!resp2.ok) {
      const txt2 = await resp2.text().catch(() => "");
      throw new Error(`Ollama repair error: ${resp2.status} ${txt2}`);
    }

    const data2 = await resp2.json();
    const raw2 = trim(data2.response);

    return JSON.parse(raw2);
  }
}

// Auth middleware
app.use((req, res, next) => {
  const header = req.header("X-LLM-SECRET");
  if (!header || header !== SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// Health
app.get("/health", (req, res) => {
  res.json({ ok: true, model: OLLAMA_MODEL });
});

// Main endpoint Render calls
app.post("/v1/json", async (req, res) => {
  try {
    const { system, user } = req.body || {};
    if (!system || !user) {
      return res.status(400).json({ error: "Missing system/user" });
    }

    const out = await ollamaGenerateJson({ system, user });
    res.json(out);
  } catch (err) {
    console.error("Gateway error:", err);
    res.status(500).json({ error: "LLM generation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`LLM Gateway running on port ${PORT}`);
  console.log(`Using Ollama model: ${OLLAMA_MODEL}`);
});