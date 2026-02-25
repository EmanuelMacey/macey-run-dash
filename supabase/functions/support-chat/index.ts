import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
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
          ...messages,
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
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
