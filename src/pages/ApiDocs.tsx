import { Link } from "react-router-dom";
import { ArrowLeft, Code2, Key, Webhook, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-api`;

const Code = ({ children }: { children: React.ReactNode }) => (
  <pre className="bg-muted text-foreground rounded-lg p-4 overflow-x-auto text-xs font-mono border border-border">
    <code>{children}</code>
  </pre>
);

const Section = ({ title, icon: Icon, children }: any) => (
  <section className="space-y-3">
    <h2 className="font-display text-2xl font-bold flex items-center gap-2">
      <Icon className="h-5 w-5 text-primary" /> {title}
    </h2>
    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
  </section>
);

const Endpoint = ({ method, path, desc }: { method: string; path: string; desc: string }) => (
  <div className="border border-border rounded-xl p-4 bg-card">
    <div className="flex items-center gap-2 mb-1">
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
        method === "GET" ? "bg-blue-500/10 text-blue-600" :
        method === "POST" ? "bg-green-500/10 text-green-600" :
        "bg-orange-500/10 text-orange-600"
      }`}>{method}</span>
      <code className="text-sm font-mono text-foreground">{path}</code>
    </div>
    <p className="text-xs text-muted-foreground">{desc}</p>
  </div>
);

export default function ApiDocs() {
  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="font-display font-bold text-lg">MaceyRunners Partner API</h1>
          <span className="text-xs text-muted-foreground">v1.0</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        <div className="space-y-3">
          <h1 className="font-display text-4xl font-bold">Partner API Reference</h1>
          <p className="text-muted-foreground">
            Integrate MaceyRunners delivery and errand services into your own platform.
            All requests use HTTPS, JSON, and prices are in <strong>GYD</strong>.
          </p>
          <Code>Base URL: {BASE}</Code>
        </div>

        <Section title="Authentication" icon={Key}>
          <p>
            Every request (except <code className="text-primary">GET /health</code>) must include a
            Bearer token in the <code className="text-primary">Authorization</code> header.
            Keys are issued from the Admin Dashboard → API Keys tab and shown <strong>once</strong> at creation.
          </p>
          <Code>{`Authorization: Bearer mr_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}</Code>
          <p>Keys carry scopes: <code>quote</code>, <code>create_delivery</code>, <code>read_delivery</code>, <code>cancel_delivery</code>.</p>
        </Section>

        <Section title="Endpoints" icon={Code2}>
          <Endpoint method="GET" path="/health" desc="Public health check. No auth required." />
          <Endpoint method="POST" path="/quote" desc="Get a fare quote based on pickup and dropoff." />
          <Endpoint method="POST" path="/deliveries" desc="Create a new delivery or errand order." />
          <Endpoint method="GET" path="/deliveries/{id}" desc="Fetch status and details of a delivery you created." />
          <Endpoint method="POST" path="/deliveries/{id}/cancel" desc="Cancel a delivery (only pending or accepted)." />
        </Section>

        <Section title="POST /quote" icon={Code2}>
          <p>Addresses may be free-form text (geocoded via OSM) <em>or</em> explicit GPS coordinates.</p>
          <p className="font-semibold text-foreground">Request</p>
          <Code>{`{
  "order_type": "delivery",        // "delivery" | "errand"
  "pickup":  { "address": "Agricola, EBD" },
  "dropoff": { "lat": 6.8013, "lon": -58.1551, "address": "Giftland Mall" }
}`}</Code>
          <p className="font-semibold text-foreground">Response 200</p>
          <Code>{`{
  "delivery_fee": 1200,
  "service_fee": 100,
  "total": 1300,
  "distance_km": 6.0,
  "currency": "GYD"
}`}</Code>
        </Section>

        <Section title="POST /deliveries" icon={Code2}>
          <p className="font-semibold text-foreground">Request</p>
          <Code>{`{
  "order_type": "delivery",
  "pickup":  { "address": "Stabroek Market" },
  "dropoff": { "address": "464 East Ruimveldt" },
  "customer": { "name": "Jane Doe", "phone": "+5926001234" },
  "payment_method": "cash",        // "cash" | "mmg"
  "external_id": "INV-2026-001",   // optional, your reference
  "notes": "Leave at gate"
}`}</Code>
          <p className="font-semibold text-foreground">Response 201</p>
          <Code>{`{
  "delivery": {
    "id": "8a1f...-uuid",
    "status": "pending",
    "order_type": "delivery",
    "price": 1300,
    "pickup_address": "...",
    "dropoff_address": "...",
    "created_at": "2026-05-22T..."
  }
}`}</Code>
        </Section>

        <Section title="Webhooks" icon={Webhook}>
          <p>
            Configure a webhook URL per API key in the Admin Dashboard. Events are signed with
            HMAC-SHA256 using your webhook secret and sent with these headers:
          </p>
          <Code>{`X-MaceyRunners-Signature: t=1716422400,v1=<hex hmac>
X-MaceyRunners-Event: order.accepted`}</Code>
          <p className="font-semibold text-foreground">Verification (Node.js)</p>
          <Code>{`const crypto = require("crypto");
const [tPart, sigPart] = req.header("X-MaceyRunners-Signature").split(",");
const t = tPart.split("=")[1];
const sig = sigPart.split("=")[1];
const expected = crypto.createHmac("sha256", SECRET)
  .update(t + "." + rawBody).digest("hex");
if (expected !== sig) return res.status(401).end();`}</Code>
          <p className="font-semibold text-foreground">Events emitted</p>
          <ul className="list-disc list-inside space-y-1">
            <li><code>order.created</code></li>
            <li><code>order.accepted</code></li>
            <li><code>order.picked_up</code></li>
            <li><code>order.on_the_way</code></li>
            <li><code>order.delivered</code></li>
            <li><code>order.cancelled</code></li>
          </ul>
          <p>
            Retries: 5 attempts with exponential backoff (1m, 5m, 15m, 1h, 4h).
            A 2xx response marks the delivery as <code>delivered</code>.
          </p>
        </Section>

        <Section title="Error Codes" icon={Shield}>
          <Code>{`{ "error": { "code": "invalid_request", "message": "pickup and dropoff are required" } }`}</Code>
          <ul className="list-disc list-inside space-y-1">
            <li><code>400 invalid_request</code> — body validation failed</li>
            <li><code>401 unauthorized</code> — missing / invalid / revoked API key</li>
            <li><code>403 forbidden</code> — key missing required scope</li>
            <li><code>404 not_found</code> — route or resource not found</li>
            <li><code>409 conflict</code> — illegal state transition (e.g. cancel a delivered order)</li>
            <li><code>500 server_error</code> — unexpected; safe to retry idempotent reads</li>
          </ul>
          <p>Recommended client retry: exponential backoff on 5xx and network errors, max 3 attempts.</p>
        </Section>

        <Section title="Pricing Reference" icon={Code2}>
          <Code>{`Fare = clamp(300 + distance_km × 150, MIN, 5000) + 100 service_fee
MIN delivery = 700 GYD
MIN errand   = 1000 GYD
Currency     = GYD`}</Code>
        </Section>

        <div className="pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground mb-3">Need an API key?</p>
          <Button asChild><Link to="/admin">Open Admin Dashboard</Link></Button>
        </div>
      </main>
    </div>
  );
}
