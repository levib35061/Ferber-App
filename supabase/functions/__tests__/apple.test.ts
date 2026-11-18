import {
  appleConfig,
  clientSecretClaims,
  looksLikeCode,
  refreshTokenFrom,
  revokeRequestBody,
  tokenRequestBody,
} from '../_shared/apple';

const KEY = '-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49\n-----END PRIVATE KEY-----';
const env = (vars: Record<string, string>) => (n: string) => vars[n];

describe('appleConfig', () => {
  it('is null until every secret is set', () => {
    expect(appleConfig(env({}))).toBeNull();
    expect(appleConfig(env({ APPLE_TEAM_ID: 'T', APPLE_KEY_ID: 'K' }))).toBeNull();
    expect(appleConfig(env({ APPLE_TEAM_ID: 'T', APPLE_KEY_ID: 'K', APPLE_PRIVATE_KEY: 'not a key' }))).toBeNull();
  });
  it('reads the key, fixing escaped line breaks, and defaults the bundle id', () => {
    const c = appleConfig(env({ APPLE_TEAM_ID: ' TEAM ', APPLE_KEY_ID: 'KEY', APPLE_PRIVATE_KEY: KEY.replace(/\n/g, '\\n') }));
    expect(c).toEqual({ teamId: 'TEAM', keyId: 'KEY', privateKey: KEY, clientId: 'com.levibrown.checkin' });
  });
});

describe('Apple requests', () => {
  const c = { teamId: 'TEAM', keyId: 'KEY', privateKey: KEY, clientId: 'com.levibrown.checkin' };
  it('builds the client-secret claims Apple expects', () => {
    const { header, payload } = clientSecretClaims(c, 1000);
    expect(header).toEqual({ alg: 'ES256', kid: 'KEY' });
    expect(payload).toEqual({ iss: 'TEAM', iat: 1000, exp: 1300, aud: 'https://appleid.apple.com', sub: 'com.levibrown.checkin' });
  });
  it('builds the token exchange and revoke bodies', () => {
    expect(Object.fromEntries(tokenRequestBody(c, 'SECRET', 'CODE123'))).toEqual({
      client_id: 'com.levibrown.checkin',
      client_secret: 'SECRET',
      code: 'CODE123',
      grant_type: 'authorization_code',
    });
    expect(Object.fromEntries(revokeRequestBody(c, 'SECRET', 'RT'))).toEqual({
      client_id: 'com.levibrown.checkin',
      client_secret: 'SECRET',
      token: 'RT',
      token_type_hint: 'refresh_token',
    });
  });
  it('reads the refresh token and rejects junk codes', () => {
    expect(refreshTokenFrom({ refresh_token: 'r.abc' })).toBe('r.abc');
    expect(refreshTokenFrom({ error: 'invalid_grant' })).toBeNull();
    expect(refreshTokenFrom(null)).toBeNull();
    expect(looksLikeCode('c0a1b2.0.mrrv.Xyz-123_abc')).toBe(true);
    expect(looksLikeCode('short')).toBe(false);
    expect(looksLikeCode('has spaces in it')).toBe(false);
    expect(looksLikeCode(42)).toBe(false);
  });
});
