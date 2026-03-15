// server/services/ai/providers/remoteLlama.js

function trim(s) {
  return (s || "").toString().trim();
}

async function callRemoteLlamaJson({ system, user, schemaName }) {
  const baseUrl = process.env.REMOTE_LLM_URL;
  const secret = process.env.REMOTE_LLM_SECRET;

  if (!baseUrl) throw new Error("REMOTE_LLM_URL is not set");
  if (!secret) throw new Error("REMOTE_LLM_SECRET is not set");

  const resp = await fetch(`${baseUrl.replace(/\/+$/, "")}/v1/json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-LLM-SECRET": secret,
    },
    body: JSON.stringify({
      system: trim(system),
      user: trim(user),
      schemaName: schemaName || "response",
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`Remote LLaMA error: ${resp.status} ${txt}`);
  }

  return resp.json();
}

module.exports = { callRemoteLlamaJson };