const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Authorize: require service-role key (internal trigger calls) or valid user JWT
    const authHeader = req.headers.get('Authorization');
    let isAuthorized = false;
    const internalWebhookSecret = Deno.env.get('INTERNAL_WEBHOOK_SECRET');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      // Accept service role key, internal webhook secret, or valid user JWT
      if (token === serviceRoleKey || (internalWebhookSecret && token === internalWebhookSecret)) {
        isAuthorized = true;
      } else {
        const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data, error } = await supabaseAuth.auth.getUser();
        if (!error && data?.user) isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Email service unavailable' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();
    const { type, order_id, invoice_id, user_id, title, message } = body;

    // Helper to send email via Resend
    async function sendEmail(to: string, subject: string, html: string) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'MaceyRunners <noreply@maceyrunners.com>',
          to: [to],
          subject,
          html,
          headers: {
            'List-Unsubscribe': '<mailto:support@maceyrunners.org?subject=Unsubscribe>',
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Resend error:', data);
      }
      return data;
    }

    // Common email template wrapper with physical address + unsubscribe
    function emailTemplate(content: string) {
      return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 0;">
          <div style="background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 24px 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏃 MaceyRunners</h1>
          </div>
          <div style="padding: 32px; background: white;">
            ${content}
          </div>
          <div style="padding: 16px 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px;">MaceyRunners — Delivering with Purpose 🏃</p>
            <p style="margin: 0 0 8px;">464 East Ruimveldt, Georgetown, Guyana</p>
            <p style="margin: 0 0 8px;">© ${new Date().getFullYear()} MaceyRunners. All rights reserved.</p>
            <p style="margin: 0;">
              <a href="mailto:support@maceyrunners.org?subject=Unsubscribe&body=Please%20unsubscribe%20me%20from%20emails." style="color: #64748b; text-decoration: underline; font-size: 11px;">Unsubscribe</a>
            </p>
          </div>
        </div>
      `;
    }

    // ---- ORDER STATUS UPDATE EMAIL ----
    if (type === 'order_update' && order_id) {
      const { data: order } = await supabase.from('orders').select('*').eq('id', order_id).single();
      if (!order) {
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: customerAuth } = await supabase.auth.admin.getUserById(order.customer_id);
      const customerEmail = customerAuth?.user?.email;

      const { data: adminRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'admin');
      const adminEmails: string[] = [];
      if (adminRoles) {
        for (const ar of adminRoles) {
          const { data: au } = await supabase.auth.admin.getUserById(ar.user_id);
          if (au?.user?.email) adminEmails.push(au.user.email);
        }
      }

      let driverEmail: string | null = null;
      if (order.driver_id) {
        const { data: driverAuth } = await supabase.auth.admin.getUserById(order.driver_id);
        driverEmail = driverAuth?.user?.email || null;
      }

      const statusLabel = order.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
      const orderNum = order.order_number ? `#${order.order_number}` : order.id.slice(0, 8);

      const orderEmailHtml = emailTemplate(`
        <h2 style="color: #1e3a5f; margin-top: 0;">Order Update ${orderNum}</h2>
        <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Status:</strong> <span style="color: #2563eb; font-weight: 600;">${statusLabel}</span></p>
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Type:</strong> ${order.order_type}</p>
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Amount:</strong> $${order.price.toLocaleString()} GYD</p>
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Pickup:</strong> ${order.pickup_address}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Dropoff:</strong> ${order.dropoff_address}</p>
        </div>
        <p style="color: #64748b; font-size: 13px;">You can track your order in the MaceyRunners app.</p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="https://macey-run-dash.lovable.app/dashboard" style="background: #2563eb; color: white; padding: 12px 32px; border-radius: 24px; text-decoration: none; font-weight: bold; display: inline-block;">Track Order</a>
        </div>
      `);

      if (customerEmail) await sendEmail(customerEmail, `Order ${orderNum} - ${statusLabel}`, orderEmailHtml);
      if (driverEmail) await sendEmail(driverEmail, `Order ${orderNum} - ${statusLabel}`, orderEmailHtml);
      for (const ae of adminEmails) {
        await sendEmail(ae, `[Admin] Order ${orderNum} - ${statusLabel}`, orderEmailHtml);
      }

      return new Response(JSON.stringify({ sent: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- NEW ORDER NOTIFICATION EMAIL ----
    if (type === 'new_order' && order_id) {
      const { data: order } = await supabase.from('orders').select('*').eq('id', order_id).single();
      if (!order) {
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const orderNum = order.order_number ? `#${order.order_number}` : order.id.slice(0, 8);

      const { data: adminRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'admin');
      const adminEmails: string[] = [];
      if (adminRoles) {
        for (const ar of adminRoles) {
          const { data: au } = await supabase.auth.admin.getUserById(ar.user_id);
          if (au?.user?.email) adminEmails.push(au.user.email);
        }
      }

      const { data: drivers } = await supabase.from('drivers').select('user_id').eq('is_online', true).eq('is_approved', true);
      const driverEmails: string[] = [];
      if (drivers) {
        for (const d of drivers) {
          const { data: du } = await supabase.auth.admin.getUserById(d.user_id);
          if (du?.user?.email) driverEmails.push(du.user.email);
        }
      }

      const newOrderHtml = emailTemplate(`
        <h2 style="color: #1e3a5f; margin-top: 0;">🚀 New Order ${orderNum}!</h2>
        <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Type:</strong> ${order.order_type}</p>
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Amount:</strong> $${order.price.toLocaleString()} GYD</p>
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Pickup:</strong> ${order.pickup_address}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Dropoff:</strong> ${order.dropoff_address}</p>
          ${order.description ? `<p style="margin: 8px 0 0; font-size: 13px; color: #64748b;">Note: ${escapeHtml(order.description)}</p>` : ''}
        </div>
        <p style="color: #64748b; font-size: 13px;">Open the MaceyRunners app to accept this order.</p>
      `);

      for (const ae of adminEmails) {
        await sendEmail(ae, `[New Order] ${orderNum} - $${order.price.toLocaleString()} GYD`, newOrderHtml);
      }
      for (const de of driverEmails) {
        await sendEmail(de, `New Order Available! ${orderNum} - $${order.price.toLocaleString()} GYD`, newOrderHtml);
      }

      return new Response(JSON.stringify({ sent: true, admins: adminEmails.length, drivers: driverEmails.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- INVOICE EMAIL ----
    if (type === 'invoice' && (invoice_id || order_id)) {
      let invoice;
      if (invoice_id) {
        const { data } = await supabase.from('invoices').select('*').eq('id', invoice_id).single();
        invoice = data;
      } else {
        const { data } = await supabase.from('invoices').select('*').eq('order_id', order_id).single();
        invoice = data;
      }

      if (!invoice) {
        return new Response(JSON.stringify({ error: 'Invoice not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: order } = await supabase.from('orders').select('*').eq('id', invoice.order_id).single();
      const { data: customerAuth } = await supabase.auth.admin.getUserById(invoice.customer_id);
      const { data: profile } = await supabase.from('profiles').select('full_name, phone, default_address').eq('user_id', invoice.customer_id).single();

      const customerEmail = customerAuth?.user?.email;
      if (!customerEmail) {
        return new Response(JSON.stringify({ error: 'Customer email not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get order items
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', invoice.order_id);

      const invoiceNum = `INV-${String(invoice.invoice_number).padStart(4, '0')}`;
      const orderNum = order?.order_number ? `#${order.order_number}` : '';
      const customerName = profile?.full_name || 'Customer';
      const customerPhone = profile?.phone || '';
      const customerAddress = order?.dropoff_address || profile?.default_address || '';

      // Calculate fee breakdown
      const SERVICE_FEE = 100;
      let itemsTotal = 0;
      if (items && items.length > 0) {
        itemsTotal = items.reduce((sum: number, i: any) => sum + i.unit_price * i.quantity, 0);
      }
      const deliveryFee = items && items.length > 0 ? Math.max(0, invoice.total_amount - itemsTotal - SERVICE_FEE) : 0;

      let itemsHtml = '';
      if (items && items.length > 0) {
        itemsHtml = `
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0;">
                <th style="text-align: left; padding: 8px; font-size: 13px; color: #64748b;">Item</th>
                <th style="text-align: center; padding: 8px; font-size: 13px; color: #64748b;">Qty</th>
                <th style="text-align: right; padding: 8px; font-size: 13px; color: #64748b;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((i: any) => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px; font-size: 14px;">${i.product_name}</td>
                  <td style="padding: 8px; text-align: center; font-size: 14px;">${i.quantity}</td>
                  <td style="padding: 8px; text-align: right; font-size: 14px;">$${(i.unit_price * i.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }

      const invoiceHtml = emailTemplate(`
        <h2 style="color: #1e3a5f; margin-top: 0;">Invoice ${invoiceNum}</h2>
        <table style="width: 100%; margin-bottom: 16px;">
          <tr>
            <td style="vertical-align: top;">
              <p style="margin: 0; font-size: 13px; color: #64748b;">Bill To:</p>
              <p style="margin: 4px 0 0; font-size: 14px; font-weight: 600;">${customerName}</p>
              ${customerPhone ? `<p style="margin: 2px 0 0; font-size: 13px; color: #64748b;">📞 ${customerPhone}</p>` : ''}
              ${customerAddress ? `<p style="margin: 2px 0 0; font-size: 13px; color: #64748b;">📍 ${customerAddress}</p>` : ''}
            </td>
            <td style="vertical-align: top; text-align: right;">
              <p style="margin: 0; font-size: 13px; color: #64748b;">Invoice ${invoiceNum}</p>
              <p style="margin: 4px 0 0; font-size: 13px; color: #64748b;">Order ${orderNum}</p>
              <p style="margin: 4px 0 0; font-size: 13px; color: #64748b;">${new Date(invoice.created_at).toLocaleDateString()}</p>
            </td>
          </tr>
        </table>

        ${order ? `
          <div style="background: #f1f5f9; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 4px; font-size: 14px;"><strong>Service:</strong> ${order.order_type}</p>
            <p style="margin: 0 0 4px; font-size: 14px;"><strong>Pickup:</strong> ${order.pickup_address}</p>
            <p style="margin: 0 0 4px; font-size: 14px;"><strong>Dropoff:</strong> ${order.dropoff_address}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Payment:</strong> ${order.payment_method}</p>
          </div>
        ` : ''}

        ${itemsHtml}

        <div style="border-top: 2px solid #1e3a5f; padding-top: 16px; margin-top: 16px;">
          ${items && items.length > 0 ? `
            <table style="width: 100%;">
              <tr><td style="font-size: 14px; color: #64748b; padding: 4px 0;">Items Subtotal</td><td style="font-size: 14px; text-align: right; padding: 4px 0;">$${itemsTotal.toLocaleString()} GYD</td></tr>
              <tr><td style="font-size: 14px; color: #64748b; padding: 4px 0;">Delivery Fee</td><td style="font-size: 14px; text-align: right; padding: 4px 0;">$${deliveryFee.toLocaleString()} GYD</td></tr>
              <tr><td style="font-size: 14px; color: #64748b; padding: 4px 0;">Service Fee</td><td style="font-size: 14px; text-align: right; padding: 4px 0;">$${SERVICE_FEE.toLocaleString()} GYD</td></tr>
            </table>
          ` : `
            <table style="width: 100%;">
              <tr><td style="font-size: 14px; color: #64748b; padding: 4px 0;">Subtotal</td><td style="font-size: 14px; text-align: right; padding: 4px 0;">$${invoice.amount.toLocaleString()} GYD</td></tr>
            </table>
          `}
          <table style="width: 100%;">
            <tr><td style="font-size: 14px; color: #64748b; padding: 4px 0;">Tax</td><td style="font-size: 14px; text-align: right; padding: 4px 0;">$${invoice.tax_amount.toLocaleString()} GYD</td></tr>
          </table>
          <table style="width: 100%; border-top: 1px solid #e2e8f0;">
            <tr>
              <td style="font-size: 18px; font-weight: 700; color: #1e3a5f; padding-top: 8px;">Total</td>
              <td style="font-size: 18px; font-weight: 700; color: #2563eb; text-align: right; padding-top: 8px;">$${invoice.total_amount.toLocaleString()} GYD</td>
            </tr>
          </table>
        </div>

        <p style="color: #64748b; font-size: 12px; margin-top: 24px; text-align: center;">Thank you for using MaceyRunners! 🏃</p>
      `);

      await sendEmail(customerEmail, `Invoice ${invoiceNum} - MaceyRunners`, invoiceHtml);

      return new Response(JSON.stringify({ sent: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- NEW SIGNUP EMAIL TO ADMINS ----
    if (type === 'new_signup') {
      const { user_email, user_name } = body;
      
      const { data: adminRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'admin');
      const adminEmails: string[] = [];
      if (adminRoles) {
        for (const ar of adminRoles) {
          const { data: au } = await supabase.auth.admin.getUserById(ar.user_id);
          if (au?.user?.email) adminEmails.push(au.user.email);
        }
      }

      const signupHtml = emailTemplate(`
        <h2 style="color: #1e3a5f; margin-top: 0;">👤 New Account Created</h2>
        <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Name:</strong> ${escapeHtml(user_name) || 'Not provided'}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Email:</strong> ${escapeHtml(user_email) || 'Unknown'}</p>
        </div>
        <p style="color: #64748b; font-size: 13px;">A new customer has signed up on MaceyRunners. Check the admin dashboard for more details.</p>
      `);

      for (const ae of adminEmails) {
        await sendEmail(ae, `[New Signup] ${user_name || user_email}`, signupHtml);
      }

      return new Response(JSON.stringify({ sent: true, admins: adminEmails.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- DRIVER ASSIGNED EMAIL ----
    if (type === 'driver_assigned' && order_id) {
      const { data: order } = await supabase.from('orders').select('*').eq('id', order_id).single();
      if (!order) {
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const driverId = body.driver_id || order.driver_id;
      if (!driverId) {
        return new Response(JSON.stringify({ error: 'No driver' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: driverAuth } = await supabase.auth.admin.getUserById(driverId);
      const driverEmail = driverAuth?.user?.email;
      if (!driverEmail) {
        return new Response(JSON.stringify({ error: 'Driver email not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const orderNum = order.order_number ? `#${order.order_number}` : order.id.slice(0, 8);

      const assignedHtml = emailTemplate(`
        <h2 style="color: #1e3a5f; margin-top: 0;">🚀 Order Assigned to You!</h2>
        <p style="font-size: 15px; color: #334155;">You have been assigned order <strong>${orderNum}</strong>. Please check your dashboard.</p>
        <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Type:</strong> ${order.order_type}</p>
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Amount:</strong> $${order.price.toLocaleString()} GYD</p>
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Pickup:</strong> ${order.pickup_address}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Dropoff:</strong> ${order.dropoff_address}</p>
          ${order.description ? `<p style="margin: 8px 0 0; font-size: 13px; color: #64748b;">Note: ${escapeHtml(order.description)}</p>` : ''}
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <a href="https://macey-run-dash.lovable.app/driver" style="background: #2563eb; color: white; padding: 12px 32px; border-radius: 24px; text-decoration: none; font-weight: bold; display: inline-block;">Open Dashboard</a>
        </div>
      `);

      await sendEmail(driverEmail, `Order ${orderNum} Assigned to You — $${order.price.toLocaleString()} GYD`, assignedHtml);

      return new Response(JSON.stringify({ sent: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown email type' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Email error:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
