import { useSyncExternalStore } from 'react';

// Which editor layout is shown while a keyboard is open:
// - 'classic': header, layer side bar and settings tabs below the keyboard.
// - 'shell': the redesigned layout (icon rail, side panel, main area).
// The new layout is the default; the classic one stays reachable (side
// panel button, ?ui=classic) until it is removed. A layout someone chose is
// remembered and wins over the default.
export type UiLayout = 'classic' | 'shell';

const DEFAULT_LAYOUT: UiLayout = 'shell';

const STORAGE_KEY = 'matrix.uiLayout';
// ?ui=new or ?ui=classic picks the layout and remembers it.
const QUERY_KEY = 'ui';

const listeners = new Set<() => void>();
let current: UiLayout | null = null;

function parse(value: string | null | undefined): UiLayout | null {
  if (value === 'shell' || value === 'new') return 'shell';
  if (value === 'classic') return 'classic';
  return null;
}

// The layout a page URL's query asks for (?ui=new / ?ui=classic), if any.
export function uiLayoutFromQuery(search: string): UiLayout | null {
  return parse(new URLSearchParams(search).get(QUERY_KEY));
}

function load(): UiLayout {
  const fromQuery = uiLayoutFromQuery(window.location.search);
  try {
    if (fromQuery) {
      window.localStorage.setItem(STORAGE_KEY, fromQuery);
      return fromQuery;
    }
    return parse(window.localStorage.getItem(STORAGE_KEY)) || DEFAULT_LAYOUT;
  } catch {
    // Storage blocked: what the URL asks for, else the default layout.
    return fromQuery || DEFAULT_LAYOUT;
  }
}

export function getUiLayout(): UiLayout {
  if (current === null) current = load();
  return current;
}

export function setUiLayout(layout: UiLayout): void {
  current = layout;
  try {
    window.localStorage.setItem(STORAGE_KEY, layout);
  } catch {
    // Not remembered; still applied for this session.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useUiLayout(): UiLayout {
  return useSyncExternalStore(subscribe, getUiLayout);
}

// For tests: forget the cached layout so the next read loads it again.
export function resetUiLayoutForTest(): void {
  current = null;
}
