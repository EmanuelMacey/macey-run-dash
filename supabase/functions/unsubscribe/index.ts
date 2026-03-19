import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// HMAC-SHA256 based token: base64url( JSON({ uid, sig }) )
async function encodeToken(userId: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(userId));
  const sigHex = Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const payload = btoa(JSON.stringify({ uid: userId, sig: sigHex }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return payload;
}

async function decodeToken(token: string, secret: string): Promise<string | null> {
  try {
    const padded = token.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padded);
    const { uid, sig } = JSON.parse(json);
    if (!uid || !sig) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    // Convert hex sig back to Uint8Array
    const sigBytes = new Uint8Array(sig.match(/.{2}/g).map((b: string) => parseInt(b, 16)));
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(uid));
    if (!valid) return null;
    return uid;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const action = url.searchParams.get('action') || 'unsubscribe'; // 'unsubscribe' or 'resubscribe'

  if (!token) {
    return new Response(renderPage('Missing token', 'The link is invalid.', 'error', ''), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const secret = Deno.env.get('INTERNAL_WEBHOOK_SECRET') || 'fallback-key';
  const userId = await decodeToken(token, secret);

  if (!userId) {
    return new Response(renderPage('Invalid Link', 'This link is invalid or has expired.', 'error', ''), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const optIn = action === 'resubscribe';

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error } = await supabase
      .from('email_preferences')
      .upsert(
        { user_id: userId, promotional_emails: optIn, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('Preference update error:', error);
      return new Response(renderPage('Error', 'Something went wrong. Please try again later.', 'error', ''), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const baseUrl = url.origin + url.pathname;

    if (optIn) {
      return new Response(renderPage(
        'Re-subscribed Successfully! 🎉',
        "You're back on the list! You'll receive our latest deals and updates.",
        'resubscribed',
        `${baseUrl}?token=${token}&action=unsubscribe`
      ), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    } else {
      return new Response(renderPage(
        'Unsubscribed Successfully',
        "You've been unsubscribed from promotional emails. Changed your mind?",
        'unsubscribed',
        `${baseUrl}?token=${token}&action=resubscribe`
      ), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
  } catch (e) {
    console.error('Preference update error:', e);
    return new Response(renderPage('Error', 'Something went wrong. Please try again later.', 'error', ''), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
});

// Export for use by email builder
export { encodeToken };

function renderPage(title: string, message: string, state: 'unsubscribed' | 'resubscribed' | 'error', toggleUrl: string): string {
  const icon = state === 'error' ? '⚠️' : state === 'resubscribed' ? '🎉' : '✅';
  const color = state === 'error' ? '#dc2626' : state === 'resubscribed' ? '#2563eb' : '#16a34a';
  const badge = state === 'error' ? 'Error' : state === 'resubscribed' ? 'Subscribed' : 'Unsubscribed';
  const toggleBtn = state === 'unsubscribed'
    ? `<a class="toggle-btn" href="${toggleUrl}">Re-subscribe</a>`
    : state === 'resubscribed'
    ? `<a class="toggle-btn outline" href="${toggleUrl}">Unsubscribe again</a>`
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — MaceyRunners</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f1f5f9; margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: white; border-radius: 16px; padding: 48px 32px; max-width: 420px; width: 90%; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { color: #1e3a5f; font-size: 22px; margin: 0 0 12px; }
    p { color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
    .status { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; color: white; background: ${color}; }
    .toggle-btn { display: inline-block; margin-top: 20px; padding: 10px 24px; background: #1e3a5f; color: white; text-decoration: none; border-radius: 24px; font-weight: 600; font-size: 14px; transition: opacity .2s; }
    .toggle-btn:hover { opacity: .85; }
    .toggle-btn.outline { background: transparent; color: #64748b; border: 1px solid #cbd5e1; }
    .toggle-btn.outline:hover { background: #f8fafc; }
    a.home { display: inline-block; margin-top: 12px; padding: 10px 24px; color: #1e3a5f; text-decoration: none; font-size: 14px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <span class="status">${badge}</span>
    <br>
    ${toggleBtn}
    <br>
    <a class="home" href="https://macey-run-dash.lovable.app/">Go to MaceyRunners</a>
  </div>
</body>
</html>`;
}
