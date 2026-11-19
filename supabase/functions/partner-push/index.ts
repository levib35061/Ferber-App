// Supabase Edge Function: nudge the partner's phone(s) after a tap or a duty
// hand-off. Called by the app (signed-in user's JWT) right after it uploads.
// Body: { eventIds?: string[] } or { nightId: string } (duty changed).
// Deploy with "Verify JWT" ON.
import { createClient } from 'npm:@supabase/supabase-js@2';

import { deadTokens, messagesFor, type ExpoMessage, type Recipient } from './logic.ts';

const url = Deno.env.get('SUPABASE_URL')!;
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  // Who is calling?
  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: who } = await admin.auth.getUser(jwt);
  const actorId = who.user?.id;
  if (!actorId) return new Response('Unauthorized', { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { eventIds?: string[]; nightId?: string };

  // Work out the family, the taps and/or the duty change, from the database (never trust the body).
  let familyId: string | null = null;
  let events: { type: string; at: number }[] = [];
  let onDutyUserId: string | null | undefined;

  if (body.eventIds?.length) {
    const { data } = await admin
      .from('events')
      .select('family_id, type, at, created_by, deleted_at')
      .in('id', body.eventIds.slice(0, 200));
    // Undone taps count too (the partner's phone must cancel its alert), but only live ones are announced.
    const mine = (data ?? []).filter((e) => e.created_by === actorId);
    familyId = mine[0]?.family_id ?? null;
    events = mine
      .filter((e) => e.family_id === familyId && !e.deleted_at)
      .map((e) => ({ type: e.type, at: Number(e.at) }));
  } else if (body.nightId) {
    const { data } = await admin.from('nights').select('family_id, on_duty').eq('id', body.nightId).maybeSingle();
    familyId = data?.family_id ?? null;
    onDutyUserId = data?.on_duty ?? null;
  }
  if (!familyId) return Response.json({ ok: true, sent: 0 });

  // The caller must belong to that family.
  const { data: members } = await admin.from('family_members').select('user_id, display_name').eq('family_id', familyId);
  const memberIds = (members ?? []).map((m) => m.user_id as string);
  if (!memberIds.includes(actorId)) return new Response('Forbidden', { status: 403 });

  const others = memberIds.filter((id) => id !== actorId);
  if (!others.length) return Response.json({ ok: true, sent: 0 });

  const { data: tokens } = await admin.from('push_tokens').select('token, user_id').in('user_id', others);
  const recipients: Recipient[] = others.map((userId) => ({
    userId,
    tokens: (tokens ?? []).filter((t) => t.user_id === userId).map((t) => t.token as string),
  }));
  // A family can hold an extra unnamed baby row (e.g. made while joining): prefer the named one.
  const { data: baby } = await admin
    .from('babies')
    .select('name')
    .eq('family_id', familyId)
    .neq('name', '')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const actorName = (members ?? []).find((m) => m.user_id === actorId)?.display_name ?? null;

  const messages: ExpoMessage[] = messagesFor({
    actorId,
    actorName,
    babyName: baby?.name ?? null,
    recipients,
    events,
    onDutyUserId,
    now: Date.now(),
  });
  if (!messages.length) return Response.json({ ok: true, sent: 0 });

  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(messages),
  });
  const result = await res.json().catch(() => ({ data: [] }));
  const dead = deadTokens(messages, result.data ?? []);
  if (dead.length) await admin.from('push_tokens').delete().in('token', dead);

  return Response.json({ ok: res.ok, sent: messages.length, removed: dead.length });
});
