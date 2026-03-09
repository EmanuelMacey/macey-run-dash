import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple token: base64url-encode the user_id + HMAC signature
function encodeToken(userId: string, secret: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(userId);
  // Simple HMAC-like: just append a hash for verification
  const key = encoder.encode(secret);
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data[i] + (key[i % key.length] || 0)) | 0;
  }
  const payload = btoa(JSON.stringify({ uid: userId, h: hash }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return payload;
}

function decodeToken(token: string, secret: string): string | null {
  try {
    const padded = token.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padded);
    const { uid, h } = JSON.parse(json);
    
    // Verify hash
    const encoder = new TextEncoder();
    const data = encoder.encode(uid);
    const key = encoder.encode(secret);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash + data[i] + (key[i % key.length] || 0)) | 0;
    }
    if (hash !== h) return null;
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
  const userId = decodeToken(token, secret);

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

function renderPage(title: string, message: string, success: boolean): string {
  const icon = success ? '✅' : '⚠️';
  const color = success ? '#16a34a' : '#dc2626';
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
    a.btn { display: inline-block; margin-top: 16px; padding: 10px 24px; background: #1e3a5f; color: white; text-decoration: none; border-radius: 24px; font-weight: 600; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <span class="status">${success ? 'Unsubscribed' : 'Error'}</span>
    <br>
    <a class="btn" href="https://macey-run-dash.lovable.app/">Go to MaceyRunners</a>
  </div>
</body>
</html>`;
}
