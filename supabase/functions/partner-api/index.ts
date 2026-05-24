// MaceyRunners Partner API
// Public REST surface for third-party integrations.
// Auth: Bearer <api_key>  (SHA-256 hashed, looked up by prefix)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, idempotency-key",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

// Documented per-key rate limit (soft cap; platform also enforces upstream limits)
const RATE_LIMIT_PER_MIN = 120;
const rateHeaders = {
  "X-RateLimit-Limit": String(RATE_LIMIT_PER_MIN),
  "X-RateLimit-Window": "60",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Pricing constants (mirror NewOrderDialog.tsx)
const BASE_FEE = 300;
const PER_KM_RATE = 150;
const MIN_PRICES: Record<string, number> = { delivery: 700, errand: 1000 };
const MAX_FEE = 5000;
const SERVICE_FEE = 100;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(code: string, message: string, status = 400, details?: unknown) {
  return json({ error: { code, message, details } }, status);
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

async function geocode(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=gy&limit=1`,
      { headers: { "User-Agent": "MaceyRunners-Partner-API/1.0" } }
    );
    const data = await res.json();
    if (data?.length) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch (_) { /* ignore */ }
  return null;
}

function computePrice(orderType: "delivery" | "errand", km: number) {
  const min = MIN_PRICES[orderType] ?? 700;
  const fare = Math.round(BASE_FEE + km * PER_KM_RATE);
  const clamped = Math.max(min, Math.min(MAX_FEE, fare));
  return { delivery_fee: clamped, service_fee: SERVICE_FEE, total: clamped + SERVICE_FEE };
}

interface AuthedKey {
  id: string;
  scopes: string[];
}

async function authenticate(req: Request, supabase: ReturnType<typeof createClient>): Promise<AuthedKey | Response> {
  const header = req.headers.get("authorization") || "";
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) return err("unauthorized", "Missing Bearer token", 401);
  const token = m[1].trim();
  const hash = await sha256Hex(token);
  const { data, error } = await supabase
    .from("partner_api_keys")
    .select("id, scopes, is_active, revoked_at")
    .eq("key_hash", hash)
    .maybeSingle();
  if (error || !data) return err("unauthorized", "Invalid API key", 401);
  if (!data.is_active || data.revoked_at) return err("unauthorized", "API key revoked", 401);
  // fire-and-forget last_used update
  supabase.from("partner_api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id).then(() => {});
  return { id: data.id as string, scopes: (data.scopes as string[]) ?? [] };
}

function requireScope(key: AuthedKey, scope: string): Response | null {
  if (!key.scopes.includes(scope)) return err("forbidden", `Missing scope: ${scope}`, 403);
  return null;
}

interface Coord { lat: number; lon: number }

async function resolveLocation(input: any): Promise<{ address: string; coord: Coord | null } | null> {
  if (!input) return null;
  if (typeof input === "string") {
    const c = await geocode(input);
    return { address: input, coord: c };
  }
  if (input.lat != null && input.lon != null) {
    return { address: input.address ?? `${input.lat},${input.lon}`, coord: { lat: input.lat, lon: input.lon } };
  }
  if (input.address) {
    const c = await geocode(input.address);
    return { address: input.address, coord: c };
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const url = new URL(req.url);
  // path after the function name
  const path = url.pathname.replace(/^.*\/partner-api/, "") || "/";

  // Public
  if (req.method === "GET" && (path === "/" || path === "/health")) {
    return json({ name: "MaceyRunners Partner API", version: "1.0.0", status: "ok" });
  }

  // Authenticate
  const auth = await authenticate(req, supabase);
  if (auth instanceof Response) return auth;

  try {
    // POST /quote
    if (req.method === "POST" && path === "/quote") {
      const scopeErr = requireScope(auth, "quote"); if (scopeErr) return scopeErr;
      const body = await req.json().catch(() => null);
      if (!body) return err("invalid_request", "JSON body required");
      const orderType = body.order_type === "errand" ? "errand" : "delivery";
      const pickup = await resolveLocation(body.pickup);
      const dropoff = await resolveLocation(body.dropoff);
      if (!pickup || !dropoff) return err("invalid_request", "pickup and dropoff are required");
      if (!pickup.coord || !dropoff.coord) {
        const p = computePrice(orderType, 0);
        return json({ ...p, distance_km: null, warning: "Could not geocode one or both addresses; minimum fare applied" });
      }
      const km = haversineKm(pickup.coord, dropoff.coord);
      const p = computePrice(orderType, km);
      return json({ ...p, distance_km: Math.round(km * 10) / 10, currency: "GYD" });
    }

    // POST /deliveries
    if (req.method === "POST" && path === "/deliveries") {
      const scopeErr = requireScope(auth, "create_delivery"); if (scopeErr) return scopeErr;
      const body = await req.json().catch(() => null);
      if (!body) return err("invalid_request", "JSON body required");
      const orderType = body.order_type === "errand" ? "errand" : "delivery";
      const pickup = await resolveLocation(body.pickup);
      const dropoff = await resolveLocation(body.dropoff);
      if (!pickup || !dropoff) return err("invalid_request", "pickup and dropoff are required");
      if (!body.customer?.name || !body.customer?.phone) return err("invalid_request", "customer.name and customer.phone are required");

      let price = body.price;
      if (typeof price !== "number") {
        const km = pickup.coord && dropoff.coord ? haversineKm(pickup.coord, dropoff.coord) : 0;
        price = computePrice(orderType, km).total;
      }

      // Need a customer_id for orders (FK to auth). Create or reuse a placeholder partner customer.
      // Strategy: store the partner customer info in description; use the api key creator as customer_id if present, else service-bot.
      const { data: keyRow } = await supabase
        .from("partner_api_keys").select("created_by").eq("id", auth.id).single();
      const customerId = keyRow?.created_by;
      if (!customerId) return err("server_error", "Partner key has no associated owner user", 500);

      const description = [
        `[Partner Order]`,
        `Customer: ${body.customer.name} (${body.customer.phone})`,
        body.notes ? `Notes: ${body.notes}` : "",
        body.external_id ? `External ID: ${body.external_id}` : "",
      ].filter(Boolean).join("\n");

      const { data: order, error: insErr } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId,
          order_type: orderType,
          pickup_address: pickup.address,
          dropoff_address: dropoff.address,
          price,
          description,
          payment_method: body.payment_method === "mmg" ? "mmg" : "cash",
          payment_status: "pending",
          status: "pending",
          partner_api_key_id: auth.id,
        } as any)
        .select("id, status, order_type, price, pickup_address, dropoff_address, created_at")
        .single();
      if (insErr) return err("server_error", insErr.message, 500);
      return json({ delivery: order }, 201);
    }

    // GET /deliveries/:id
    const getMatch = path.match(/^\/deliveries\/([0-9a-f-]+)$/i);
    if (req.method === "GET" && getMatch) {
      const scopeErr = requireScope(auth, "read_delivery"); if (scopeErr) return scopeErr;
      const id = getMatch[1];
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, order_type, price, pickup_address, dropoff_address, driver_id, created_at, updated_at, partner_api_key_id")
        .eq("id", id)
        .eq("partner_api_key_id", auth.id)
        .maybeSingle();
      if (error) return err("server_error", error.message, 500);
      if (!data) return err("not_found", "Delivery not found", 404);
      return json({ delivery: data });
    }

    // POST /deliveries/:id/cancel
    const cancelMatch = path.match(/^\/deliveries\/([0-9a-f-]+)\/cancel$/i);
    if (req.method === "POST" && cancelMatch) {
      const scopeErr = requireScope(auth, "cancel_delivery"); if (scopeErr) return scopeErr;
      const id = cancelMatch[1];
      const { data: existing, error: selErr } = await supabase
        .from("orders").select("status, partner_api_key_id").eq("id", id).maybeSingle();
      if (selErr) return err("server_error", selErr.message, 500);
      if (!existing || existing.partner_api_key_id !== auth.id) return err("not_found", "Delivery not found", 404);
      if (!["pending","accepted"].includes(existing.status)) {
        return err("conflict", `Cannot cancel from status ${existing.status}`, 409);
      }
      const { error: updErr } = await supabase
        .from("orders").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", id);
      if (updErr) return err("server_error", updErr.message, 500);
      return json({ delivery: { id, status: "cancelled" } });
    }

    return err("not_found", `No route for ${req.method} ${path}`, 404);
  } catch (e) {
    return err("server_error", (e as Error).message, 500);
  }
});
