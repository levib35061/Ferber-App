// Supabase Edge Function: "Delete my account and data". Revokes the user's
// Sign in with Apple token with Apple (Apple requires this), then deletes the
// account and its data (public.delete_user_account). The partner keeps shared
// nights; the last one out deletes the family.
// Deploy with "Verify JWT" ON.
import { createClient } from 'npm:@supabase/supabase-js@2';

import { APPLE_REVOKE_URL, appleConfig, revokeRequestBody } from '../_shared/apple.ts';
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

  // 1. Revoke with Apple, if this account ever signed in with Apple and the key is set.
  let revoked = false;
  const { data: row } = await admin.from('apple_tokens').select('refresh_token').eq('user_id', userId).maybeSingle();
  const config = appleConfig((n) => Deno.env.get(n));
  if (row?.refresh_token && config) {
    const res = await fetch(APPLE_REVOKE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: revokeRequestBody(config, await appleClientSecret(config), row.refresh_token),
    });
    revoked = res.ok;
    // Deletion goes ahead either way: the person asked for their data to be gone.
    if (!res.ok) console.error('apple revoke failed', res.status);
  }

  // 2. Delete the account and its data (apple_tokens goes with it).
  const { error } = await admin.rpc('delete_user_account', { uid: userId });
  if (error) {
    console.error('delete_user_account failed', error.message);
    return Response.json({ ok: false, error: "Couldn't delete the account. Please try again." }, { status: 500 });
  }
  return Response.json({ ok: true, revoked });
});
