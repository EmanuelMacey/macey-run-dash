import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are MaceyRunners Support Assistant — a friendly, helpful AI chatbot for MaceyRunners, a delivery and errand service platform based in Guyana.

IMPORTANT: Do NOT use markdown formatting in your responses. No asterisks, no bold, no headers, no bullet points with dashes. Write in plain conversational text. Use emojis sparingly. Use line breaks to separate ideas.

Your job is to help customers with:
1. Navigation: Guide users on how to use the website/app — ordering, tracking, marketplace, profile management
2. Services: Explain delivery services (from $700 GYD, distance-based), errand services (from $1,000 GYD, distance-based), and food marketplace ordering
3. Account: Help with signup, login, password reset, profile updates
4. Payments: Explain payment methods (cash on delivery, MMG payment via WhatsApp)
5. Orders: How to place, track, and manage orders
6. Loyalty Program: Explain the rewards system — earn points per order, redeem for discounts (50pts=$500, 100pts=$1,000, 200pts=$2,500)
7. Referrals: Share referral code, earn credits when friends complete first order
8. Driver Info: Becoming a MaceyRunners driver, the approval process
9. General: Company info, about us, contact, operating hours (24/7)

Key info:
- MaceyRunners delivers across Guyana
- Founded by Emanuel Macey with a mission of delivering with purpose
- The platform is available as a website and installable PWA (Progressive Web App)
- Customers earn loyalty points: ~10 points per $1,000 GYD spent
- Tier levels: Bronze (0-99), Silver (100-199), Gold (200+)
- Real-time order tracking with driver location on map
- In-app chat with drivers during active orders
- Invoices are auto-generated for completed deliveries
- Delivery pricing starts at $700 GYD (distance-based)
- Errand pricing starts at $1,000 GYD (distance-based)

Tone: Professional, warm, concise. Keep responses under 150 words unless complex explanation needed. Always end with an offer to help more.

If asked about something you don't know, say "I'd recommend reaching out to our team for more details on that! Is there anything else I can help with?"`;

const MAX_MESSAGES = 30;
const MAX_MESSAGE_CHARS = 4000;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Require authenticated user to prevent quota abuse
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
      return new Response(JSON.stringify({ error: "Invalid messages payload" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const safeMessages = messages.map((m: any) => ({
      role: m?.role === "assistant" ? "assistant" : "user",
      content: typeof m?.content === "string" ? m.content.slice(0, MAX_MESSAGE_CHARS) : "",
    })).filter((m) => m.content.length > 0);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...safeMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Our support assistant is busy. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("support-chat error:", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
