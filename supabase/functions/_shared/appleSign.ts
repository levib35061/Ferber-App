// Deno only: signs Apple's client-secret JWT with the .p8 key.
import { SignJWT, importPKCS8 } from 'npm:jose@5';

import { clientSecretClaims, type AppleConfig } from './apple.ts';

export async function appleClientSecret(config: AppleConfig): Promise<string> {
  const { header, payload } = clientSecretClaims(config, Math.floor(Date.now() / 1000));
  const key = await importPKCS8(config.privateKey, 'ES256');
  return await new SignJWT(payload).setProtectedHeader(header).sign(key);
}
