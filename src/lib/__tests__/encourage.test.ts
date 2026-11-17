import { waitingNote } from '../encourage';
import { morningNote } from '../morning';

describe('waitingNote', () => {
  const base = { nightNumber: 1, checkInsDone: 0, waking: false, hour: 19 };
  it('says nothing on a plain first wait of night 1', () => {
    expect(waitingNote(base)).toBeNull();
  });
  it('reassures after a check-in', () => {
    expect(waitingNote({ ...base, checkInsDone: 1 })).toMatch(/after a check-in is normal/);
  });
  it('names the middle-of-the-night waking', () => {
    expect(waitingNote({ ...base, waking: true, hour: 2 })).toMatch(/hardest part/);
    expect(waitingNote({ ...base, waking: true, hour: 22 })).toBeNull();
  });
  it('warns that nights 2 to 4 can be harder', () => {
    expect(waitingNote({ ...base, nightNumber: 3 })).toMatch(/often harder/);
    expect(waitingNote({ ...base, nightNumber: 6 })).toBeNull();
  });
});

describe('morningNote', () => {
  it('sets expectations after night 1', () => {
    expect(morningNote([40])).toMatch(/Nights 2 and 3/);
  });
  it('normalises a harder night', () => {
    expect(morningNote([40, 55])).toMatch(/harder night is normal/);
  });
  it('stays quiet when things improve', () => {
    expect(morningNote([40, 30, 12])).toBeNull();
    expect(morningNote([])).toBeNull();
  });
  it('suggests the pediatrician after two weeks without change', () => {
    expect(morningNote(Array(14).fill(35))).toMatch(/pediatrician/);
    expect(morningNote([40, 38, 35, 30, 25, 20, 15, 12, 10, 8, 6, 5, 4, 3])).toBeNull();
  });
});
