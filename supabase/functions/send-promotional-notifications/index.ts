import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DAILY_TIPS = [
  { title: "💡 Tip of the Day", message: "Did you know? You can schedule deliveries for a specific time. Never miss a pickup again!" },
  { title: "🏃 Daily Motivation", message: "Every delivery brings us closer to our goal of building opportunity and legacy in Guyana. Thank you for being part of the journey!" },
  { title: "⭐ Rewards Reminder", message: "You earn loyalty points with every order! Redeem them for discounts on your next delivery." },
  { title: "🛵 Quick Tip", message: "Need something done? Use our Errand service — we'll handle shopping, pickups, and more for just $1,500 GYD!" },
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
      // Send to all customers
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'customer');
      userIds = (roles || []).map(r => r.user_id);
    } else if (target === 'inactive') {
      // Send to users who haven't ordered in 7+ days
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
      return new Response(JSON.stringify({ sent: 0, message: 'No users to notify' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let notifTitle = title;
    let notifMessage = message;

    // For daily tip type, pick a random tip
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

    // Insert in batches of 100
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

    return new Response(JSON.stringify({ sent, total_users: userIds.length }), {
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
