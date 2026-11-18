// Supabase Edge Function: after Sign in with Apple, the app sends Apple's
// one-time authorization code here. We exchange it for a refresh token and
// keep it (table apple_tokens, server-only) so the account can be revoked with
// Apple when it's deleted. Until the Apple key secrets are set, this is a no-op.
// Deploy with "Verify JWT" ON.
import { createClient } from 'npm:@supabase/supabase-js@2';

import { APPLE_TOKEN_URL, appleConfig, looksLikeCode, refreshTokenFrom, tokenRequestBody } from '../_shared/apple.ts';
import { appleClientSecret } from '../_shared/appleSign.ts';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: who } = await admin.auth.getUser(jwt);
  const userId = who.user?.id;
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { code } = (await req.json().catch(() => ({}))) as { code?: unknown };
  if (!looksLikeCode(code)) return new Response('Bad request', { status: 400 });

  const config = appleConfig((n) => Deno.env.get(n));
  if (!config) return Response.json({ ok: true, stored: false, reason: 'apple key not configured' });

  const res = await fetch(APPLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenRequestBody(config, await appleClientSecret(config), code),
  });
  const refreshToken = refreshTokenFrom(await res.json().catch(() => null));
  if (!res.ok || !refreshToken) {
    console.error('apple token exchange failed', res.status);
    return Response.json({ ok: false, stored: false }, { status: 502 });
  }
  const { error } = await admin
    .from('apple_tokens')
    .upsert({ user_id: userId, refresh_token: refreshToken, updated_at: new Date().toISOString() });
  if (error) {
    console.error('apple_tokens upsert failed', error.message);
    return Response.json({ ok: false, stored: false }, { status: 500 });
  }
  return Response.json({ ok: true, stored: true });
});
