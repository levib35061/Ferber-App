/**
 * Sync failures come in two kinds (see docs/STATE_MACHINES.md, "Sharing, account and sync"):
 * - offline / server hiccup: retry later, it fixes itself ("offline, will retry");
 * - sign-in problem: this phone's account can't act for its family (signed out, or signed
 *   in to an account that isn't a member). Retrying never fixes it; the person must act.
 */
export function isSignInProblem(e: unknown): boolean {
  if (e instanceof Error && e.name === 'NeedsSignInError') return true;
  const m = e instanceof Error ? e.message : String(e);
  return /row-level security|JWT|not signed in|invalid claim|session (missing|not found)/i.test(m);
}
