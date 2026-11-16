import { createHash } from 'crypto';

import { nightIdSeed, uuidFromHex } from '../ids';

const sha1 = (s: string) => createHash('sha1').update(s).digest('hex');

describe('uuidFromHex', () => {
  it('makes a valid version-5 UUID', () => {
    const id = uuidFromHex(sha1('hello'));
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
  it('is the same for the same baby and night, different otherwise', () => {
    const a = uuidFromHex(sha1(nightIdSeed('baby-1', '2026-11-16')));
    expect(uuidFromHex(sha1(nightIdSeed('baby-1', '2026-11-16')))).toBe(a);
    expect(uuidFromHex(sha1(nightIdSeed('baby-1', '2026-11-17')))).not.toBe(a);
    expect(uuidFromHex(sha1(nightIdSeed('baby-2', '2026-11-16')))).not.toBe(a);
  });
  it('rejects short input', () => {
    expect(() => uuidFromHex('abc')).toThrow();
  });
});
