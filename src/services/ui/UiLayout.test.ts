import { beforeEach } from 'vitest';
import {
  getUiLayout,
  resetUiLayoutForTest,
  setUiLayout,
  uiLayoutFromQuery,
} from './UiLayout';

describe('UiLayout', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetUiLayoutForTest();
  });

  test('classic by default', () => {
    expect(getUiLayout()).toBe('classic');
  });

  test('remembers the chosen layout', () => {
    setUiLayout('shell');
    expect(getUiLayout()).toBe('shell');
    resetUiLayoutForTest();
    expect(getUiLayout()).toBe('shell');
    setUiLayout('classic');
    resetUiLayoutForTest();
    expect(getUiLayout()).toBe('classic');
  });

  test('ignores unknown stored values', () => {
    window.localStorage.setItem('matrix.uiLayout', 'other');
    expect(getUiLayout()).toBe('classic');
  });

  test('reads ?ui= from the URL', () => {
    expect(uiLayoutFromQuery('?ui=new')).toBe('shell');
    expect(uiLayoutFromQuery('?ui=classic')).toBe('classic');
    expect(uiLayoutFromQuery('?ui=other')).toBeNull();
    expect(uiLayoutFromQuery('')).toBeNull();
  });
});
