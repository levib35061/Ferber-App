/**
 * "Who's on duty tonight": with family sharing, only the on-duty person's
 * phone schedules check-in alerts and buzzes. The other phones stay quiet
 * but still show everything. A family can be two parents, or more people
 * (a grandparent, a sitter); each phone can set a name so the others can
 * see who's on duty and hand off to them.
 */
export type Duty = 'solo' | 'unset' | 'me' | 'partner';

/**
 * @param onDuty   user id stored on tonight's night row (or null)
 * @param myId     this phone's user id (null if not known yet)
 * @param shared   true when the family has more than one member
 */
export function dutyFor(onDuty: string | null | undefined, myId: string | null, shared: boolean): Duty {
  if (!shared) return 'solo';
  if (!onDuty) return 'unset';
  if (myId && onDuty === myId) return 'me';
  return myId ? 'partner' : 'unset';
}

/**
 * Alerts stay on unless someone else is on duty. They're also on for whoever
 * tapped the step that started the running wait (they're clearly awake), so a
 * wait never depends only on a silent push reaching the on-duty phone.
 */
export function alertsOnThisPhone(duty: Duty, startedTheWait = false): boolean {
  return duty !== 'partner' || startedTheWait;
}

/** What this phone knows about its family (SyncStatus has these fields). */
export interface FamilyView {
  userId: string | null;
  familyId: string | null;
  memberCount: number;
  memberIds: string[];
}

/** Sharing with at least one other person. */
export function isShared(f: FamilyView): boolean {
  return f.familyId != null && f.memberCount > 1;
}

/**
 * Tonight's duty as seen by this phone. Someone who left the family can't stay on
 * duty: their id is treated as "nobody on duty", so the remaining phones ring.
 */
export function dutyHere(onDuty: string | null | undefined, f: FamilyView): Duty {
  const gone = !!onDuty && f.memberIds.length > 0 && !f.memberIds.includes(onDuty);
  return dutyFor(gone ? null : onDuty, f.userId, isShared(f));
}

/**
 * Does this phone schedule tonight's check-in alerts (and show the Live Activity)?
 * The one place that decides; used by the screen, the background push task and the
 * lock-screen card. Map: docs/STATE_MACHINES.md.
 */
export function alertsHere(
  onDuty: string | null | undefined,
  f: FamilyView,
  events: Parameters<typeof waitStartedBy>[0],
  state: Parameters<typeof waitStartedBy>[1],
): boolean {
  const startedTheWait = f.userId != null && waitStartedBy(events, state) === f.userId;
  return alertsOnThisPhone(dutyHere(onDuty, f), startedTheWait);
}

/** Who tapped the step that started the wait that's running now (null if none or unknown). */
export function waitStartedBy(
  events: { at: number; createdBy?: string | null; deletedAt?: number | null }[],
  state: { kind: string; waitStartedAt?: number },
): string | null {
  if ((state.kind !== 'waiting' && state.kind !== 'due') || state.waitStartedAt == null) return null;
  const e = [...events].reverse().find((x) => !x.deletedAt && x.at === state.waitStartedAt);
  return e?.createdBy ?? null;
}

/** The other member of a two-parent family. */
export function partnerId(memberIds: string[], myId: string | null): string | null {
  return memberIds.find((id) => id !== myId) ?? null;
}

/** A family member as this phone sees them. */
export interface Member {
  id: string;
  /** What they chose to be called ("Levi", "Grandma"), or null */
  name: string | null;
}

/** How to refer to another member: their name, or a stand-in that fits the family size. */
export function memberName(member: Member | undefined, familySize: number): string {
  const n = member?.name?.trim();
  if (n) return n;
  return familySize > 2 ? 'Someone else' : 'Your partner';
}

/** The duty bar's line. */
export function dutyLine(duty: Duty, onDuty: string | null | undefined, members: Member[]): string {
  if (duty === 'me') return "You're on duty tonight";
  if (duty === 'partner') {
    return `${memberName(
      members.find((m) => m.id === onDuty),
      members.length,
    )} is on duty · alerts off here`;
  }
  return "Who's on duty tonight?";
}

/** Who this phone can hand the night to: everyone else, named ones first. */
export function handOffTargets(members: Member[], myId: string | null): Member[] {
  return members
    .filter((m) => m.id !== myId)
    .sort((a, b) => Number(!a.name?.trim()) - Number(!b.name?.trim()) || (a.name ?? '').localeCompare(b.name ?? ''));
}
