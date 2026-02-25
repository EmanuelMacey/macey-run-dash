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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { type, title, message, target } = body;

    // Get target user IDs
    let userIds: string[] = [];

    if (target === 'all' || !target) {
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'customer');
      userIds = (roles || []).map(r => r.user_id);
    } else if (target === 'inactive') {
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'customer');
      const allCustomerIds = (roles || []).map(r => r.user_id);
      
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('customer_id')
        .gte('created_at', sevenDaysAgo);
      
      const activeIds = new Set((recentOrders || []).map(o => o.customer_id));
      userIds = allCustomerIds.filter(id => !activeIds.has(id));
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

    // Insert notifications for all target users
    const notifications = userIds.map(userId => ({
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

    // Send emails to users
    let emailsSent = 0;
    // Get user emails in batches
    for (let i = 0; i < userIds.length; i += 50) {
      const batch = userIds.slice(i, i + 50);
      const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      
      if (users?.users) {
        const emailBatch = users.users
          .filter(u => batch.includes(u.id) && u.email)
          .map(u => u.email!);
        
        // Send email via send-order-email function
        for (const email of emailBatch) {
          try {
            await supabase.functions.invoke('send-order-email', {
              body: {
                to: email,
                subject: notifTitle,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #2563eb, #f97316); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 24px;">MaceyRunners</h1>
                    </div>
                    <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
                      <h2 style="color: #1e293b; margin-top: 0;">${notifTitle}</h2>
                      <p style="color: #475569; font-size: 16px; line-height: 1.6;">${notifMessage}</p>
                      <div style="text-align: center; margin-top: 24px;">
                        <a href="https://macey-run-dash.lovable.app/dashboard" style="background: #2563eb; color: white; padding: 12px 32px; border-radius: 24px; text-decoration: none; font-weight: bold;">Open MaceyRunners</a>
                      </div>
                    </div>
                    <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 16px;">MaceyRunners — Delivering with Purpose 🏃</p>
                  </div>
                `,
              },
            });
            emailsSent++;
          } catch (emailErr) {
            console.error('Email send error:', emailErr);
          }
        }
      }
    }

    return new Response(JSON.stringify({ sent, emails_sent: emailsSent, total_users: userIds.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Promotional notification error:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
