// Supabase Edge Function: RevenueCat webhook → public.unlocks.
// The ONLY writer of the paid status. Configure in RevenueCat:
//   Project → Integrations → Webhooks → URL:
//     https://<project-ref>.supabase.co/functions/v1/revenuecat-webhook
//   Authorization header: the value of the REVENUECAT_WEBHOOK_AUTH secret.
// Deploy with "Verify JWT" OFF (RevenueCat can't send a Supabase JWT).
import { createClient } from 'npm:@supabase/supabase-js@2';

import { changesFor, secretMatches, type RcEvent } from './logic.ts';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!secretMatches(req.headers.get('Authorization'), Deno.env.get('REVENUECAT_WEBHOOK_AUTH'))) {
    return new Response('Unauthorized', { status: 401 });
  }

  let event: RcEvent;
  try {
    event = (await req.json()).event;
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const changes = changesFor(event);
  for (const c of changes) {
    const { error } = await admin.from('unlocks').upsert({
      user_id: c.userId,
      product_id: c.productId,
      active: c.active,
      store: c.store,
      environment: c.environment,
      last_event_id: c.eventId,
      updated_at: new Date().toISOString(),
    });
    // A user id that no longer exists (deleted account) is not an error worth retrying.
    if (error && !/foreign key/i.test(error.message)) {
      console.error('unlocks upsert failed', error.message);
      return new Response('Database error', { status: 500 }); // RevenueCat retries
    }
  }
  return Response.json({ ok: true, changes: changes.length });
});
