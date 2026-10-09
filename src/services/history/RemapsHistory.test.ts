import { RemapsHistory, Remaps } from './RemapsHistory';
import { IKeymap } from '../hid/Hid';

const km = (code: number) => ({ code }) as unknown as IKeymap;

describe('RemapsHistory', () => {
  test('undo / redo walk through the observed snapshots', () => {
    const h = new RemapsHistory();
    const s0: Remaps = [{}];
    const s1: Remaps = [{ '0,0': km(4) }];
    const s2: Remaps = [{ '0,0': km(4), '0,1': km(5) }];
    h.observe(s0);
    h.observe(s1);
    h.observe(s2);
    expect(h.canUndo()).toBe(true);

    const u1 = h.undo()!;
    expect(Object.keys(u1[0])).toEqual(['0,0']);
    h.observe(u1); // the store echoes the restored value
    const u2 = h.undo()!;
    expect(u2[0]).toEqual({});
    h.observe(u2);
    expect(h.canUndo()).toBe(false);

    const r1 = h.redo()!;
    expect(Object.keys(r1[0])).toEqual(['0,0']);
    h.observe(r1);
    expect(h.canRedo()).toBe(true);
  });

  test('a new change after undo clears the redo stack', () => {
    const h = new RemapsHistory();
    h.observe([{}]);
    h.observe([{ a: km(1) }]);
    h.observe(h.undo()!);
    expect(h.canRedo()).toBe(true);
    h.observe([{ b: km(2) }]);
    expect(h.canRedo()).toBe(false);
  });

  test('reset forgets the history', () => {
    const h = new RemapsHistory();
    h.observe([{}]);
    h.observe([{ a: km(1) }]);
    h.reset();
    expect(h.canUndo()).toBe(false);
  });
});
