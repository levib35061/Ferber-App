/**
 * Partner push: which messages to send to the OTHER parent's phones after a
 * tap or a duty hand-off. Pure (no Deno or network), unit-tested with Jest.
 *
 * Every change sends a silent push (`_contentAvailable`) so a closed app wakes
 * briefly, syncs, and reschedules (or cancels) its own check-in alert. A few
 * moments also show a quiet visible notification (no sound).
 * Expo push format: https://docs.expo.dev/push-notifications/sending-notifications/
 */

export interface PushEvent {
  type: string;
  at: number;
}

export interface Recipient {
  userId: string;
  tokens: string[];
}

export interface ExpoMessage {
  to: string;
  data: { kind: 'sync' };
  _contentAvailable: true;
  priority: 'high';
  title?: string;
  body?: string;
}

export interface PushInput {
  actorId: string;
  babyName: string | null;
  recipients: Recipient[];
  /** Taps just uploaded by the actor */
  events?: PushEvent[];
  /** Who is now on duty, when the actor changed it */
  onDutyUserId?: string | null;
}

/** The visible line for the most recent tap worth announcing, if any. */
export function visibleFor(events: PushEvent[], babyName: string | null): { title: string; body: string } | null {
  const who = babyName?.trim() || 'Baby';
  const latest = [...events].sort((a, b) => b.at - a.at).find((e) => e.type === 'asleep' || e.type === 'up');
  if (!latest) return null;
  if (latest.type === 'asleep') return { title: `${who} is asleep`, body: 'Logged by your partner.' };
  return { title: `${who} is up for the day`, body: "Logged by your partner. Tonight's tracking is done." };
}

export function messagesFor(input: PushInput): ExpoMessage[] {
  const out: ExpoMessage[] = [];
  const tapLine = visibleFor(input.events ?? [], input.babyName);
  for (const r of input.recipients) {
    if (r.userId === input.actorId) continue; // never notify yourself
    let line = tapLine;
    if (input.onDutyUserId !== undefined && input.onDutyUserId === r.userId) {
      line = { title: "You're on duty tonight", body: 'Check-in alerts are on for this phone.' };
    }
    for (const to of r.tokens) {
      const m: ExpoMessage = { to, data: { kind: 'sync' }, _contentAvailable: true, priority: 'high' };
      if (line) {
        m.title = line.title;
        m.body = line.body;
      }
      out.push(m);
    }
  }
  return out;
}

/** Tokens Expo says are dead (app deleted / token rotated), to remove. */
export function deadTokens(messages: ExpoMessage[], tickets: { status: string; details?: { error?: string } }[]): string[] {
  return tickets
    .map((t, i) => (t.status === 'error' && t.details?.error === 'DeviceNotRegistered' ? messages[i]?.to : null))
    .filter((t): t is string => !!t);
}
