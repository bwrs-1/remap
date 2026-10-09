import { IKeymap } from '../../../services/hid/Hid';
import { countPending, countPendingOnLayer } from './pendingChanges';

const km = { code: 4 } as unknown as IKeymap;

describe('pending changes', () => {
  test('counts changed keys and encoders on all layers', () => {
    expect(
      countPending(
        [{ '0,0': km, '0,1': km }, {}, { '1,2': km }],
        [{ 0: { clockwise: km } }, {}]
      )
    ).toBe(4);
  });

  test('nothing pending', () => {
    expect(countPending([], [])).toBe(0);
    expect(countPending([{}, {}], [{}, {}])).toBe(0);
  });

  test('counts one layer', () => {
    const remaps: { [pos: string]: IKeymap }[] = [
      { '0,0': km },
      { '0,0': km, '0,1': km },
    ];
    expect(countPendingOnLayer(remaps, 1)).toBe(2);
    expect(countPendingOnLayer(remaps, 5)).toBe(0);
  });
});
