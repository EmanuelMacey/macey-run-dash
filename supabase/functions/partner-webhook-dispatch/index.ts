// Partner webhook dispatcher
// Processes pending partner_webhook_deliveries with HMAC-SHA256 signed payloads.
// Invoke via cron or manually. Auth: requires service-role or INTERNAL_WEBHOOK_SECRET.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const INTERNAL_SECRET = Deno.env.get("INTERNAL_WEBHOOK_SECRET") || "";

async function hmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const BACKOFF_MIN = [1, 5, 15, 60, 240]; // minutes
const MAX_ATTEMPTS = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const provided = req.headers.get("x-internal-secret") || req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!INTERNAL_SECRET || provided !== INTERNAL_SECRET) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: jobs, error } = await supabase
    .from("partner_webhook_deliveries")
    .select("id, webhook_id, payload, attempts")
    .eq("status", "pending")
    .lte("next_retry_at", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });

  const results: any[] = [];
  for (const job of jobs ?? []) {
    const { data: hook } = await supabase
      .from("partner_webhooks").select("url, secret, is_active").eq("id", job.webhook_id).single();
    if (!hook || !hook.is_active) {
      await supabase.from("partner_webhook_deliveries").update({ status: "skipped", last_error: "Webhook inactive" }).eq("id", job.id);
      continue;
    }
    const body = JSON.stringify(job.payload);
    const ts = Math.floor(Date.now() / 1000);
    const sig = await hmacHex(hook.secret, `${ts}.${body}`);
    try {
      const res = await fetch(hook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-MaceyRunners-Signature": `t=${ts},v1=${sig}`,
          "X-MaceyRunners-Event": (job.payload as any).event ?? "unknown",
        },
        body,
      });
      if (res.ok) {
        await supabase.from("partner_webhook_deliveries")
          .update({ status: "delivered", delivered_at: new Date().toISOString(), attempts: job.attempts + 1 })
          .eq("id", job.id);
        results.push({ id: job.id, ok: true });
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (e) {
      const nextAttempt = job.attempts + 1;
      const failedFinal = nextAttempt >= MAX_ATTEMPTS;
      const delay = BACKOFF_MIN[Math.min(nextAttempt, BACKOFF_MIN.length - 1)];
      await supabase.from("partner_webhook_deliveries").update({
        status: failedFinal ? "failed" : "pending",
        attempts: nextAttempt,
        last_error: (e as Error).message,
        next_retry_at: failedFinal ? null : new Date(Date.now() + delay * 60_000).toISOString(),
      }).eq("id", job.id);
      results.push({ id: job.id, ok: false, error: (e as Error).message });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
