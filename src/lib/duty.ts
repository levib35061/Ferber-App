/**
 * "Who's on duty tonight": with partner sharing, only the on-duty parent's
 * phone schedules check-in alerts and buzzes. The other phone stays quiet
 * but still shows everything.
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

/** Alerts stay on unless the partner is on duty. */
export function alertsOnThisPhone(duty: Duty): boolean {
  return duty !== 'partner';
}

/** The other member of a two-parent family. */
export function partnerId(memberIds: string[], myId: string | null): string | null {
  return memberIds.find((id) => id !== myId) ?? null;
}
