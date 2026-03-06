const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find notifications that need retry
    const { data: retries } = await supabase
      .from('notification_retries')
      .select('*')
      .eq('acknowledged', false)
      .lt('retry_count', 5)
      .lte('next_retry_at', new Date().toISOString());

    if (!retries || retries.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let processed = 0;

    for (const retry of retries) {
      // Get the original notification
      const { data: notif } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', retry.notification_id)
        .single();

      if (!notif) continue;

      // Re-send push notification
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: notif.user_id,
            title: `🔔 ${notif.title}`,
            message: notif.message,
            order_id: notif.order_id,
          }),
        });
      } catch (e) {
        console.error('Retry push failed:', e);
      }

      // Update retry record
      const newCount = retry.retry_count + 1;
      const nextRetry = new Date(Date.now() + 2 * 60 * 1000).toISOString(); // 2 min

      await supabase
        .from('notification_retries')
        .update({
          retry_count: newCount,
          next_retry_at: newCount >= 5 ? null : nextRetry,
          acknowledged: newCount >= 5,
        })
        .eq('id', retry.id);

      processed++;
    }

    return new Response(JSON.stringify({ processed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Retry error:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
