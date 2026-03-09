import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ─── Message pools ───

const GENERAL_TIPS = [
  { title: "💡 Tip of the Day", message: "Did you know? You can schedule deliveries for a specific time. Never miss a pickup again!" },
  { title: "🏃 Daily Motivation", message: "Every delivery brings us closer to our goal of building opportunity and legacy in Guyana. Thank you for being part of the journey!" },
  { title: "⭐ Rewards Reminder", message: "You earn loyalty points with every order! Redeem them for discounts on your next delivery." },
  { title: "🛵 Quick Tip", message: "Need something done? Use our Errand service — starting from just $1,000 GYD based on distance!" },
  { title: "🍔 Food Tip", message: "Browse our marketplace for your favorite restaurants! Order food delivery right from the app." },
  { title: "📱 Did You Know?", message: "Install MaceyRunners as an app on your phone for the best experience! Tap the install button in your browser." },
  { title: "🎁 Earn More Rewards", message: "Refer a friend using your referral code and earn credits when they complete their first order!" },
  { title: "🔔 Stay Connected", message: "Enable notifications to get real-time updates on your deliveries and exclusive promotions!" },
  { title: "💪 MaceyRunners Fact", message: "MaceyRunners is committed to empowering youth through mentorship, sponsorship, and scholarship initiatives." },
  { title: "🚀 Pro Tip", message: "Track your driver in real-time on the map! You'll always know exactly where your delivery is." },
];

const SEASONAL_MESSAGES = [
  // New Year / January
  { months: [1], title: "🎆 New Year, New Deliveries!", message: "Start the year right! Order your first delivery of 2026 and earn double loyalty points this week." },
  { months: [1], title: "🥳 New Year Special", message: "Kick off the new year with 10% off your next order. Use code NEWYEAR2026 at checkout!" },
  // Valentine's / February
  { months: [2], title: "💝 Valentine's Day Special", message: "Surprise your loved one! Send a gift or food delivery with MaceyRunners this Valentine's Day. ❤️" },
  { months: [2], title: "💘 Love is in the Air", message: "Treat someone special! Order flowers, chocolates, or dinner delivered right to their door." },
  // Easter / March-April
  { months: [3, 4], title: "🐣 Easter Treats Await!", message: "Get your Easter goodies delivered — from hot cross buns to chocolate eggs. Order now on MaceyRunners!" },
  // Mother's Day / May
  { months: [5], title: "🌸 Mother's Day Gift Delivery", message: "Show Mom you care! Send her a surprise delivery this Mother's Day with MaceyRunners. 💐" },
  // Mashramani / February-March
  { months: [2, 3], title: "🎭 Happy Mashramani!", message: "Celebrate Mashramani in style! Get your party food and supplies delivered while you enjoy the festivities. 🇬🇾" },
  // Caribbean vibes / Summer
  { months: [6, 7, 8], title: "☀️ Summer Cravings?", message: "Beat the heat with refreshing drinks and food delivered to your door. Cool off with MaceyRunners!" },
  { months: [6, 7, 8], title: "🏖️ Summer Special", message: "Summer is here! Enjoy free delivery on orders over $3,000 GYD this week. 🌴" },
  // Back to School / September
  { months: [9], title: "📚 Back to School!", message: "Need school supplies delivered? Use MaceyRunners' errand service and save time for what matters." },
  // Diwali / October-November
  { months: [10, 11], title: "🪔 Diwali Special", message: "Celebrate the Festival of Lights! Get sweets and gifts delivered to your family and friends. Happy Diwali! ✨" },
  // Christmas / November-December
  { months: [11, 12], title: "🎄 Holiday Delivery Deals!", message: "The holidays are here! Get gifts, food, and last-minute essentials delivered fast with MaceyRunners. 🎁" },
  { months: [12], title: "🎅 Christmas Rush?", message: "Don't stress the Christmas rush — let MaceyRunners handle your deliveries while you enjoy the season!" },
  // Independence Day / May
  { months: [5], title: "🇬🇾 Happy Independence Day!", message: "Celebrate Guyana's independence! Enjoy special promotions all week long on MaceyRunners." },
];

const FLASH_SALE_MESSAGES = [
  { title: "⚡ Flash Sale — 2 Hours Only!", message: "Get 15% off your next delivery! Order in the next 2 hours with code FLASH15. Don't miss out!" },
  { title: "🔥 Hot Deal Alert!", message: "Free delivery on your next 2 orders! Place an order now before this deal expires tonight." },
  { title: "💥 Weekend Blitz!", message: "It's the weekend! Enjoy $500 GYD off every order over $2,000 GYD. Use code WEEKEND500." },
  { title: "🏷️ Mega Monday Deal", message: "Start your week with savings! 20% off all errand services today only. Code: MEGA20" },
  { title: "🎯 Lunchtime Special", message: "Hungry? Get $300 GYD off any food delivery between 11 AM – 2 PM today. Code: LUNCH300" },
  { title: "🌙 Night Owl Offer", message: "Late-night cravings? Enjoy free delivery on all orders placed after 8 PM tonight!" },
  { title: "🎲 Lucky Day Deal", message: "Feeling lucky? Every 5th order today gets a surprise discount! Place yours now." },
  { title: "💎 VIP Flash Reward", message: "You've been a loyal customer! Here's a secret code for $1,000 GYD off: VIPLOVE" },
];

const WIN_BACK_MESSAGES = [
  { title: "😢 We Miss You!", message: "It's been a while! Come back and enjoy 20% off your next order. We've got new restaurants waiting for you!" },
  { title: "👋 Long Time No See!", message: "Hey there! We noticed you haven't ordered recently. Here's $500 GYD credit to welcome you back!" },
  { title: "🎁 A Gift For You", message: "We've been saving something special for you — free delivery on your next 3 orders! Come back and try us." },
  { title: "🍕 Your Favorites Are Waiting", message: "Remember those amazing meals? They're still here and better than ever. Order again and save 15%!" },
  { title: "🚀 We've Improved!", message: "Since your last order, we've added new stores, faster delivery, and better tracking. Give us another try!" },
  { title: "💸 Here's Some Credit!", message: "We added $300 GYD to your account as a thank you for being a MaceyRunners customer. Use it before it expires!" },
  { title: "🏃 Come Run With Us Again!", message: "MaceyRunners has grown! More restaurants, more services, more rewards. Place an order today and see what's new." },
];

// ─── Helpers ───

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getSeasonalMessage(): { title: string; message: string } | null {
  const month = new Date().getMonth() + 1;
  const eligible = SEASONAL_MESSAGES.filter(m => m.months.includes(month));
  if (eligible.length === 0) return null;
  const pick = pickRandom(eligible);
  return { title: pick.title, message: pick.message };
}

function buildEmailHtml(title: string, message: string): string {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 0;">
      <div style="background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 24px 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🏃 MaceyRunners</h1>
      </div>
      <div style="padding: 32px; background: white;">
        <h2 style="color: #1e3a5f; margin-top: 0;">${title}</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">${message}</p>
        <div style="text-align: center; margin-top: 24px;">
          <a href="https://macey-run-dash.lovable.app/dashboard" style="background: #2563eb; color: white; padding: 12px 32px; border-radius: 24px; text-decoration: none; font-weight: bold; display: inline-block;">Open MaceyRunners</a>
        </div>
      </div>
      <div style="padding: 16px 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0 0 8px;">MaceyRunners — Delivering with Purpose 🏃</p>
        <p style="margin: 0 0 8px;">464 East Ruimveldt, Georgetown, Guyana</p>
        <p style="margin: 0 0 8px;">© ${new Date().getFullYear()} MaceyRunners. All rights reserved.</p>
        <p style="margin: 0;">
          <a href="https://macey-run-dash.lovable.app/dashboard" style="color: #64748b; text-decoration: underline; font-size: 11px;">Manage notification preferences</a>
          &nbsp;|&nbsp;
          <a href="mailto:support@maceyrunners.org?subject=Unsubscribe&body=Please%20unsubscribe%20me%20from%20promotional%20emails." style="color: #64748b; text-decoration: underline; font-size: 11px;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Personalization: build a message based on order history ───

async function getPersonalizedMessage(
  supabase: any,
  userId: string
): Promise<{ title: string; message: string } | null> {
  // Get user's last 10 orders
  const { data: orders } = await supabase
    .from('orders')
    .select('order_type, price, pickup_address, created_at, status')
    .eq('customer_id', userId)
    .eq('status', 'delivered')
    .order('created_at', { ascending: false })
    .limit(10);

  if (!orders || orders.length === 0) return null;

  const totalSpent = orders.reduce((s: number, o: any) => s + (o.price || 0), 0);
  const orderCount = orders.length;
  const lastOrder = orders[0];
  const daysSinceLast = Math.floor(
    (Date.now() - new Date(lastOrder.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  const favoriteType = orders.filter((o: any) => o.order_type === 'delivery').length >=
    orders.filter((o: any) => o.order_type === 'errand').length
    ? 'delivery'
    : 'errand';

  // Pick a personalized template
  const templates = [
    {
      title: "🏆 You're a Top Customer!",
      message: `You've completed ${orderCount} orders and spent over $${totalSpent.toLocaleString()} GYD with us. As a thank you, enjoy $500 GYD off your next order!`,
    },
    {
      title: `🔄 Time to Reorder?`,
      message: `It's been ${daysSinceLast} days since your last ${favoriteType}. Your favorite spots are ready and waiting — order now and earn double loyalty points!`,
    },
    {
      title: "📊 Your MaceyRunners Stats",
      message: `Did you know? You've placed ${orderCount} orders with us! Keep going and unlock exclusive VIP rewards at 20 orders.`,
    },
    {
      title: favoriteType === 'delivery' ? "🍔 Craving Your Favorites?" : "📦 Need Another Errand?",
      message: favoriteType === 'delivery'
        ? "Your go-to restaurants miss you! Reorder from your favorites with one tap and enjoy free delivery today."
        : "Let us handle your next errand! From groceries to documents — we've got you covered with fast, reliable service.",
    },
    {
      title: "🎯 Personalized For You",
      message: `Based on your order history, we think you'd love our new marketplace stores! Check them out and save 10% on your first order from a new store.`,
    },
  ];

  return pickRandom(templates);
}

// ─── Main handler ───

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    // --- Admin / internal authorization check ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const internalWebhookSecret = Deno.env.get('INTERNAL_WEBHOOK_SECRET');
    const isServiceRole = token === serviceRoleKey;
    const isInternalCall = internalWebhookSecret && token === internalWebhookSecret;

    if (!isServiceRole && !isInternalCall) {
      const supabaseAuth = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
      if (userError || !userData?.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
      const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', userData.user.id)
        .eq('role', 'admin')
        .single();

      if (!roleData) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();
    const { type, title, message, target } = body;

    // ─── Resolve target users ───
    let userIds: string[] = [];

    if (target === 'all' || !target) {
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'customer');
      userIds = (roles || []).map((r: any) => r.user_id);
    } else if (target === 'inactive') {
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'customer');
      const allCustomerIds = (roles || []).map((r: any) => r.user_id);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('customer_id')
        .gte('created_at', sevenDaysAgo);
      const activeIds = new Set((recentOrders || []).map((o: any) => o.customer_id));
      userIds = allCustomerIds.filter((id: string) => !activeIds.has(id));
    }

    if (userIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0, emails_sent: 0, message: 'No users to notify' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── Build per-user notifications ───
    // For personalized / win-back types, we generate per-user messages
    const isPersonalized = type === 'personalized' || (type === 'daily_tip' && target === 'inactive');

    let sent = 0;
    let emailsSent = 0;

    // Get user emails upfront for email sending
    let userEmailMap = new Map<string, string>();
    if (RESEND_API_KEY) {
      const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (usersData?.users) {
        for (const u of usersData.users) {
          if (u.email) userEmailMap.set(u.id, u.email);
        }
      }
    }

    if (isPersonalized) {
      // Per-user personalized messages
      for (const userId of userIds) {
        let notif = await getPersonalizedMessage(supabase, userId);

        if (!notif) {
          // Fallback: win-back for inactive, or seasonal, or general tip
          if (target === 'inactive') {
            notif = pickRandom(WIN_BACK_MESSAGES);
          } else {
            notif = getSeasonalMessage() || pickRandom(GENERAL_TIPS);
          }
        }

        const { error } = await supabase.from('notifications').insert({
          user_id: userId,
          title: notif.title,
          message: notif.message,
          type: 'promotion',
        });
        if (!error) sent++;

        // Send email
        if (RESEND_API_KEY) {
          const email = userEmailMap.get(userId);
          if (email) {
            try {
              const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${RESEND_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'MaceyRunners <noreply@maceyrunners.com>',
                  to: [email],
                  subject: notif.title,
                  html: buildEmailHtml(notif.title, notif.message),
                  headers: {
                    'List-Unsubscribe': '<mailto:support@maceyrunners.org?subject=Unsubscribe>',
                    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                  },
                }),
              });
              if (res.ok) emailsSent++;
              else console.error('Resend error for', email, await res.json());
            } catch (err) {
              console.error('Email send error for', email, err);
            }
            await delay(600);
          }
        }
      }
    } else {
      // ─── Bulk mode: same message for all users ───
      let notifTitle = title;
      let notifMessage = message;

      if (type === 'daily_tip') {
        // Mix sources: 40% seasonal (if available), 30% flash sale, 30% general tip
        const roll = Math.random();
        const seasonal = getSeasonalMessage();
        if (roll < 0.4 && seasonal) {
          notifTitle = seasonal.title;
          notifMessage = seasonal.message;
        } else if (roll < 0.7) {
          const flash = pickRandom(FLASH_SALE_MESSAGES);
          notifTitle = flash.title;
          notifMessage = flash.message;
        } else {
          const tip = pickRandom(GENERAL_TIPS);
          notifTitle = tip.title;
          notifMessage = tip.message;
        }
      } else if (type === 'flash_sale') {
        const flash = pickRandom(FLASH_SALE_MESSAGES);
        notifTitle = flash.title;
        notifMessage = flash.message;
      } else if (type === 'seasonal') {
        const seasonal = getSeasonalMessage();
        if (seasonal) {
          notifTitle = seasonal.title;
          notifMessage = seasonal.message;
        } else {
          notifTitle = title || pickRandom(GENERAL_TIPS).title;
          notifMessage = message || pickRandom(GENERAL_TIPS).message;
        }
      }

      // Batch insert notifications
      const notifications = userIds.map((userId: string) => ({
        user_id: userId,
        title: notifTitle,
        message: notifMessage,
        type: 'promotion',
      }));

      for (let i = 0; i < notifications.length; i += 100) {
        const batch = notifications.slice(i, i + 100);
        const { error } = await supabase.from('notifications').insert(batch);
        if (error) console.error('Batch insert error:', error);
        else sent += batch.length;
      }

      // Send emails
      if (RESEND_API_KEY) {
        const emailHtml = buildEmailHtml(notifTitle, notifMessage);
        for (let i = 0; i < userIds.length; i++) {
          const email = userEmailMap.get(userIds[i]);
          if (!email) continue;
          try {
            const res = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'MaceyRunners <noreply@maceyrunners.com>',
                to: [email],
                subject: notifTitle,
                html: emailHtml,
                headers: {
                  'List-Unsubscribe': '<mailto:support@maceyrunners.org?subject=Unsubscribe>',
                  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                },
              }),
            });
            if (res.ok) emailsSent++;
            else console.error('Resend error for', email, await res.json());
          } catch (err) {
            console.error('Email send error for', email, err);
          }
          if (i < userIds.length - 1) await delay(600);
        }
      }
    }

    return new Response(JSON.stringify({ sent, emails_sent: emailsSent, total_users: userIds.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Promotional notification error:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
