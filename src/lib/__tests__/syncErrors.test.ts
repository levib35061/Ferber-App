import { isSignInProblem } from '../syncErrors';

describe('isSignInProblem', () => {
  it('spots a lost sign-in or a non-member account', () => {
    const signedOut = Object.assign(new Error('Sign in first'), { name: 'NeedsSignInError' });
    expect(isSignInProblem(signedOut)).toBe(true);
    expect(isSignInProblem(new Error('new row violates row-level security policy for table "events"'))).toBe(true);
    expect(isSignInProblem(new Error('JWT expired'))).toBe(true);
  });
  it('treats network trouble as "offline, will retry"', () => {
    expect(isSignInProblem(new Error('Network request failed'))).toBe(false);
    expect(isSignInProblem(new Error('FetchError: request timed out'))).toBe(false);
  });
});
