import { describe, expect, test } from 'vitest';
import { decodeSplitInfo, isSplitMismatch } from './SplitFirmware';

const reply = (state: number, peerRev: number, own: number, peer: number) =>
  new Uint8Array([
    state,
    peerRev >> 8,
    peerRev & 0xff,
    own >> 8,
    own & 0xff,
    peer >> 8,
    peer & 0xff,
  ]);

describe('decodeSplitInfo', () => {
  test('same revision and build', () => {
    const s = decodeSplitInfo(reply(1, 11, 0x1234, 0x1234), 11);
    expect(s).toEqual({ kind: 'match', revision: 11 });
    expect(isSplitMismatch(s)).toBe(false);
  });
  test('different revision', () => {
    expect(decodeSplitInfo(reply(1, 12, 1, 1), 11)).toEqual({
      kind: 'revisionMismatch',
      revision: 11,
      peerRevision: 12,
    });
  });
  test('same revision, other build', () => {
    const s = decodeSplitInfo(reply(1, 11, 0x1234, 0x9999), 11);
    expect(s.kind).toBe('buildMismatch');
    expect(isSplitMismatch(s)).toBe(true);
  });
  test('other half too old to report', () => {
    expect(decodeSplitInfo(reply(2, 0, 1, 0), 11).kind).toBe('peerOutdated');
  });
  test('other half not connected / not known yet', () => {
    expect(decodeSplitInfo(reply(3, 0, 1, 0), 11).kind).toBe('disconnected');
    expect(decodeSplitInfo(reply(0, 0, 1, 0), 11).kind).toBe('checking');
  });
});
