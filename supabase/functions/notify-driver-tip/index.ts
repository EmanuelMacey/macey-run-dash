import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userRes, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userRes?.user) return json({ error: 'Unauthorized' }, 401)
    const callerId = userRes.user.id

    const body = await req.json().catch(() => ({}))
    const orderId = String(body?.orderId || '')
    const tipAmount = Math.floor(Number(body?.tipAmount || 0))
    if (!orderId || !tipAmount || tipAmount <= 0) {
      return json({ error: 'Invalid input' }, 400)
    }

    const admin = createClient(supabaseUrl, serviceKey)

    const { data: order } = await admin
      .from('orders')
      .select('id, order_number, customer_id, driver_id, status, tip_amount')
      .eq('id', orderId)
      .maybeSingle()

    if (!order) return json({ error: 'Order not found' }, 404)
    if (order.customer_id !== callerId) return json({ error: 'Forbidden' }, 403)
    if (order.status !== 'delivered') return json({ error: 'Order not delivered' }, 400)
    if (!order.driver_id) return json({ ok: true, skipped: 'no_driver' })

    const [{ data: driverUser }, { data: driverProfile }, { data: customerProfile }] =
      await Promise.all([
        admin.auth.admin.getUserById(order.driver_id),
        admin.from('profiles').select('full_name').eq('user_id', order.driver_id).maybeSingle(),
        admin.from('profiles').select('full_name').eq('user_id', callerId).maybeSingle(),
      ])

    const driverEmail = driverUser?.user?.email
    if (!driverEmail) return json({ ok: true, skipped: 'no_email' })

    const { error: sendErr } = await admin.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'driver-tip-received',
        recipientEmail: driverEmail,
        idempotencyKey: `driver-tip-${orderId}-${tipAmount}`,
        templateData: {
          driverName: driverProfile?.full_name ?? undefined,
          tipAmount,
          orderNumber: order.order_number ?? orderId.slice(0, 8),
          customerName: customerProfile?.full_name ?? undefined,
        },
      },
    })

    if (sendErr) return json({ error: sendErr.message }, 500)
    return json({ ok: true })
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
