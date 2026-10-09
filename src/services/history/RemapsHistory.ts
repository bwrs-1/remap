import { IKeymap } from '../hid/Hid';

// Undo / redo of the pending (not yet flashed) keymap changes.
// The history only records snapshots of state.app.remaps; restoring one
// dispatches AppActions.remapsSetKeys, which is recorded as "applied".

export type Remaps = { [pos: string]: IKeymap }[];

const MAX_HISTORY = 100;

const clone = (r: Remaps): Remaps => r.map((layer) => ({ ...(layer || {}) }));

export class RemapsHistory {
  private past: Remaps[] = [];
  private future: Remaps[] = [];
  private current: Remaps | null = null;
  private restoring = false;

  // Call with every new remaps value from the store.
  observe(remaps: Remaps) {
    if (this.current === remaps) return;
    if (this.restoring) {
      this.restoring = false;
      this.current = remaps;
      return;
    }
    if (this.current !== null) {
      this.past.push(clone(this.current));
      if (this.past.length > MAX_HISTORY) this.past.shift();
      this.future = [];
    }
    this.current = remaps;
  }

  canUndo() {
    return this.past.length > 0;
  }

  canRedo() {
    return this.future.length > 0;
  }

  // Returns the snapshot to restore, or null.
  undo(): Remaps | null {
    if (!this.canUndo() || this.current === null) return null;
    this.future.push(clone(this.current));
    this.restoring = true;
    return this.past.pop()!;
  }

  redo(): Remaps | null {
    if (!this.canRedo() || this.current === null) return null;
    this.past.push(clone(this.current));
    this.restoring = true;
    return this.future.pop()!;
  }

  // Forget everything (e.g. after flashing or switching keyboards).
  reset(remaps: Remaps | null = null) {
    this.past = [];
    this.future = [];
    this.current = remaps;
    this.restoring = false;
  }
}
