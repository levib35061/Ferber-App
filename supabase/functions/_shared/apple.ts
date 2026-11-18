/**
 * Sign in with Apple, server side: turning the app's one-time authorization
 * code into a refresh token, and revoking that token when an account is
 * deleted (Apple requires apps that offer Sign in with Apple to revoke tokens
 * on account deletion). Pure helpers, tested with Jest; the Deno functions do
 * the signing and the network calls.
 *
 * Docs: https://developer.apple.com/documentation/sign_in_with_apple/generate_and_validate_tokens
 *       https://developer.apple.com/documentation/sign_in_with_apple/revoke_tokens
 */

export const APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token';
export const APPLE_REVOKE_URL = 'https://appleid.apple.com/auth/revoke';

export interface AppleConfig {
  teamId: string;
  keyId: string;
  /** Contents of the .p8 key file (PKCS#8 PEM). */
  privateKey: string;
  /** The app's bundle id. */
  clientId: string;
}

/** Reads the Apple settings from the function's secrets, or null until they're all set. */
export function appleConfig(env: (name: string) => string | undefined): AppleConfig | null {
  const teamId = env('APPLE_TEAM_ID')?.trim();
  const keyId = env('APPLE_KEY_ID')?.trim();
  // Secrets often arrive with literal "\n" instead of line breaks.
  const privateKey = env('APPLE_PRIVATE_KEY')?.replace(/\\n/g, '\n').trim();
  const clientId = env('APPLE_CLIENT_ID')?.trim() || 'com.levibrown.checkin';
  if (!teamId || !keyId || !privateKey || !privateKey.includes('PRIVATE KEY')) return null;
  return { teamId, keyId, privateKey, clientId };
}

/** Claims for the short-lived "client secret" JWT Apple wants (signed ES256 with the key). */
export function clientSecretClaims(config: AppleConfig, nowSeconds: number) {
  return {
    header: { alg: 'ES256', kid: config.keyId },
    payload: {
      iss: config.teamId,
      iat: nowSeconds,
      exp: nowSeconds + 5 * 60, // Apple allows up to 6 months; minutes are plenty
      aud: 'https://appleid.apple.com',
      sub: config.clientId,
    },
  };
}

/** Form body that exchanges the app's authorization code for tokens. */
export function tokenRequestBody(config: AppleConfig, clientSecret: string, code: string): URLSearchParams {
  return new URLSearchParams({
    client_id: config.clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
  });
}

/** Form body that revokes a refresh token. */
export function revokeRequestBody(config: AppleConfig, clientSecret: string, refreshToken: string): URLSearchParams {
  return new URLSearchParams({
    client_id: config.clientId,
    client_secret: clientSecret,
    token: refreshToken,
    token_type_hint: 'refresh_token',
  });
}

/** The refresh token from Apple's token response, or null. */
export function refreshTokenFrom(response: unknown): string | null {
  const t = (response as { refresh_token?: unknown } | null)?.refresh_token;
  return typeof t === 'string' && t.length > 0 ? t : null;
}

/** An authorization code is short and opaque; reject obvious junk before calling Apple. */
export function looksLikeCode(code: unknown): code is string {
  return typeof code === 'string' && code.length >= 10 && code.length <= 2048 && /^[\w.\-]+$/.test(code);
}
