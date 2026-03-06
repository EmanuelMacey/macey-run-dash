import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DAILY_TIPS = [
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

// Helper to delay execution
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    // --- Admin authorization check ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if caller is the service role (internal trigger call)
    const token = authHeader.replace('Bearer ', '');
    const isServiceRole = token === serviceRoleKey;

    if (!isServiceRole) {
      // Validate as a user JWT and check admin role
      const supabaseAuth = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
      if (claimsError || !claimsData?.claims?.sub) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
      const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', claimsData.claims.sub)
        .eq('role', 'admin')
        .single();

      if (!roleData) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    // --- End auth check ---

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { type, title, message, target } = body;

    // Get target user IDs
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

    let notifTitle = title;
    let notifMessage = message;

    if (type === 'daily_tip') {
      const tip = DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
      notifTitle = tip.title;
      notifMessage = tip.message;
    }

    // Insert in-app notifications
    const notifications = userIds.map((userId: string) => ({
      user_id: userId,
      title: notifTitle,
      message: notifMessage,
      type: 'promotion',
    }));

    let sent = 0;
    for (let i = 0; i < notifications.length; i += 100) {
      const batch = notifications.slice(i, i + 100);
      const { error } = await supabase.from('notifications').insert(batch);
      if (error) {
        console.error('Batch insert error:', error);
      } else {
        sent += batch.length;
      }
    }

    // Send emails via Resend with rate limiting (max 2/sec)
    let emailsSent = 0;
    if (RESEND_API_KEY) {
      const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const userMap = new Map<string, string>();
      if (usersData?.users) {
        for (const u of usersData.users) {
          if (u.email) userMap.set(u.id, u.email);
        }
      }

      const emailHtml = buildEmailHtml(notifTitle, notifMessage);

      // Send emails sequentially with delay to avoid rate limiting (2 per second)
      for (let i = 0; i < userIds.length; i++) {
        const email = userMap.get(userIds[i]);
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

          if (res.ok) {
            emailsSent++;
          } else {
            const errData = await res.json();
            console.error('Resend error for', email, errData);
          }
        } catch (err) {
          console.error('Email send error for', email, err);
        }

        // Rate limit: wait 600ms between sends (< 2 per second)
        if (i < userIds.length - 1) {
          await delay(600);
        }
      }
    } else {
      console.warn('RESEND_API_KEY not configured — skipping emails');
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
