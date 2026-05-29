// Generates daily or weekly summary of orders & revenue.
// GET ?period=daily|weekly  -> returns JSON (admin auth via Supabase JWT)
// POST { period, send_email } -> generates + optionally emails all admins (internal/cron)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const INTERNAL_SECRET = Deno.env.get("INTERNAL_WEBHOOK_SECRET")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const fmt = (n: number) => `$${Number(n || 0).toLocaleString()} GYD`;

async function buildReport(period: "daily" | "weekly") {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const now = new Date();
  const start = new Date(now);
  if (period === "daily") start.setHours(0, 0, 0, 0);
  else start.setDate(start.getDate() - 7);

  const { data: orders, error } = await admin
    .from("orders")
    .select("id,price,status,order_type,payment_method,required_vehicle,created_at,updated_at")
    .gte("created_at", start.toISOString());
  if (error) throw error;

  const all = orders || [];
  const delivered = all.filter((o) => o.status === "delivered");
  const cancelled = all.filter((o) => o.status === "cancelled");
  const revenue = delivered.reduce((s, o) => s + (o.price || 0), 0);
  const platformFee = delivered.length * 100;
  const byType = {
    delivery: delivered.filter((o) => o.order_type === "delivery").length,
    errand: delivered.filter((o) => o.order_type === "errand").length,
  };
  const byVehicle = {
    bike: all.filter((o) => o.required_vehicle === "bike").length,
    car: all.filter((o) => o.required_vehicle === "car").length,
  };
  const byPayment = {
    cash: delivered.filter((o) => o.payment_method === "cash").length,
    mmg: delivered.filter((o) => o.payment_method === "mmg").length,
  };

  return {
    period,
    range: { start: start.toISOString(), end: now.toISOString() },
    totals: {
      orders_created: all.length,
      delivered: delivered.length,
      cancelled: cancelled.length,
      revenue,
      platform_fees: platformFee,
      avg_order_value: delivered.length ? Math.round(revenue / delivered.length) : 0,
    },
    breakdown: { by_type: byType, by_vehicle: byVehicle, by_payment: byPayment },
  };
}

function reportToHtml(r: any) {
  const periodLabel = r.period === "daily" ? "Daily" : "Weekly";
  const date = new Date(r.range.start).toLocaleDateString("en-GB", { dateStyle: "medium" });
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #fff; color: #111;">
    <div style="background: #1e3a8a; color: #fff; padding: 24px; border-radius: 12px 12px 0 0;">
      <h1 style="margin: 0; font-size: 22px;">MaceyRunners — ${periodLabel} Summary</h1>
      <p style="margin: 4px 0 0; opacity: .85; font-size: 13px;">${date}</p>
    </div>
    <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 12px 12px;">
      <h2 style="margin: 0 0 8px; font-size: 16px;">Revenue</h2>
      <p style="font-size: 28px; font-weight: 700; color: #f97316; margin: 0;">${fmt(r.totals.revenue)}</p>
      <p style="color:#666; font-size: 12px; margin: 4px 0 16px;">From ${r.totals.delivered} delivered orders · Avg ${fmt(r.totals.avg_order_value)}</p>

      <table style="width:100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding:8px;border-bottom:1px solid #eee;">Orders created</td><td style="text-align:right;padding:8px;border-bottom:1px solid #eee;"><b>${r.totals.orders_created}</b></td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;">Delivered</td><td style="text-align:right;padding:8px;border-bottom:1px solid #eee;"><b>${r.totals.delivered}</b></td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;">Cancelled</td><td style="text-align:right;padding:8px;border-bottom:1px solid #eee;"><b>${r.totals.cancelled}</b></td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;">Platform service fees</td><td style="text-align:right;padding:8px;border-bottom:1px solid #eee;"><b>${fmt(r.totals.platform_fees)}</b></td></tr>
        <tr><td style="padding:8px;">Deliveries / Errands</td><td style="text-align:right;padding:8px;"><b>${r.breakdown.by_type.delivery} / ${r.breakdown.by_type.errand}</b></td></tr>
        <tr><td style="padding:8px;">Bike / Car routes</td><td style="text-align:right;padding:8px;"><b>${r.breakdown.by_vehicle.bike} / ${r.breakdown.by_vehicle.car}</b></td></tr>
        <tr><td style="padding:8px;">Cash / MMG</td><td style="text-align:right;padding:8px;"><b>${r.breakdown.by_payment.cash} / ${r.breakdown.by_payment.mmg}</b></td></tr>
      </table>

      <p style="color:#999; font-size: 11px; margin-top: 24px;">Download a PDF version anytime from Admin Dashboard → Reports.</p>
    </div>
  </div>`;
}

async function emailAdmins(report: any) {
  if (!RESEND_API_KEY) return { sent: 0, skipped: "RESEND_API_KEY not set" };
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: roles } = await admin.from("user_roles").select("user_id").eq("role", "admin");
  const ids = (roles || []).map((r: any) => r.user_id);
  if (!ids.length) return { sent: 0 };

  const emails: string[] = [];
  for (const id of ids) {
    const { data } = await admin.auth.admin.getUserById(id);
    if (data?.user?.email) emails.push(data.user.email);
  }
  if (!emails.length) return { sent: 0 };

  const subject = `MaceyRunners ${report.period === "daily" ? "Daily" : "Weekly"} Summary — ${fmt(report.totals.revenue)} (${report.totals.delivered} orders)`;
  const html = reportToHtml(report);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "MaceyRunners Reports <reports@notify.maceyrunners.com>",
      to: emails,
      subject,
      html,
    }),
  });
  return { sent: emails.length, ok: res.ok, status: res.status };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const internalSecret = req.headers.get("x-internal-secret");
    const isInternal = internalSecret === INTERNAL_SECRET;

    let period: "daily" | "weekly" = "daily";
    let sendEmail = false;

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      period = body.period === "weekly" ? "weekly" : "daily";
      sendEmail = !!body.send_email;
    } else {
      period = url.searchParams.get("period") === "weekly" ? "weekly" : "daily";
    }

    // For non-internal callers, require admin JWT
    if (!isInternal) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
      const { data: role } = await admin.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (!role) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const report = await buildReport(period);
    let email: any = null;
    if (sendEmail) email = await emailAdmins(report);

    return new Response(JSON.stringify({ report, email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
