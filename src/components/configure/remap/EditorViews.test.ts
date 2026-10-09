import {
  getEditorView,
  openEditorView,
  subscribeEditorView,
} from './EditorViews';

describe('editor view', () => {
  test('opens a screen and tells the listeners', () => {
    let calls = 0;
    const unsubscribe = subscribeEditorView(() => calls++);
    openEditorView('leds');
    expect(getEditorView()).toBe('leds');
    expect(calls).toBe(1);
    unsubscribe();
    openEditorView('keymap');
    expect(calls).toBe(1);
    expect(getEditorView()).toBe('keymap');
  });

  test('ignores unknown screens', () => {
    openEditorView('keymap');
    openEditorView('other' as never);
    expect(getEditorView()).toBe('keymap');
  });
});
