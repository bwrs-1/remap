// Design tokens of the editor: the one place where its colors, fonts and
// radii are defined. They reach the page as CSS custom properties
// (--mx-<name>, see MxTokenStyles), which the SCSS variables ($cfg-* in
// _variables.scss) point to, and the MUI theme reads the same values.
//
// MX_TOKENS are the values of the classic editor. The redesigned layout
// (.mx-shell) overrides them with MX_SHELL_TOKENS, so components shared by
// both layouts take the colors of the layout they are shown in.
export const MX_TOKENS = {
  // Surfaces
  surface: '#f7f7f8', // editor canvas
  panel: '#f2f2f3', // side bar
  header: '#ffffff',
  card: '#ffffff',
  field: '#ececee', // segmented controls, pills, muted fills
  border: '#e2e2e4',
  ground: '#f7f7f8', // behind the panels
  selected: '#ffffff', // selected row, pressed toggle
  key: '#ffffff', // keycaps
  // Text
  text: '#121214',
  'text-2': '#6b6c70',
  // Icon rail
  rail: '#121214',
  'rail-active': '#333438',
  'rail-icon': '#c4c4c8',
  'rail-case': '#ececee',
  // Primary action
  ink: '#333438',
  'ink-strong': '#121214',
  'on-ink': '#ffffff',
  accent: '#333438', // pending changes, selected key
  ok: '#16a34a', // connected
  // Notification (snackbar) backgrounds
  'status-success': '#3f51b5',
  'status-error': '#f44336',
  'status-warning': '#ff9800',
  'status-info': '#8bc34a',
  // Type
  font: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  'font-mono': "'JetBrains Mono', ui-monospace, monospace",
  // Radii
  'radius-s': '6px',
  'radius-m': '8px',
  'radius-l': '12px',
  'radius-xl': '16px',
} as const;

export type MxTokenName = keyof typeof MX_TOKENS;

// The redesigned layout: neutral grey panels and a dark icon rail, with a
// mint accent (see the design canvas, boards 08-10). Grey text is darkened
// to keep 4.5:1 on the panels.
export const MX_SHELL_TOKENS: Partial<Record<MxTokenName, string>> = {
  ground: '#8e8e90',
  surface: '#b6b6b8',
  panel: '#bcbcbe',
  header: '#b6b6b8',
  card: '#c4c4c6',
  field: '#b0b0b2',
  border: 'rgba(0, 0, 0, 0.12)',
  selected: '#d4d6d6',
  key: '#dadadc',
  text: '#121213',
  'text-2': '#474749',
  rail: '#242426',
  'rail-active': '#4b4b4d',
  'rail-icon': '#c8c8cb',
  'rail-case': '#9c9c9e',
  ink: '#242426',
  'ink-strong': '#121213',
  'on-ink': '#ffffff',
  accent: '#acdccc',
  ok: '#1f7a4d',
  'radius-s': '9px',
  'radius-m': '14px',
  'radius-l': '24px',
  'radius-xl': '28px',
};

export function mxVarName(name: MxTokenName): string {
  return `--mx-${name}`;
}

// `var(--mx-<name>)`, for inline styles.
export function mxVar(name: MxTokenName): string {
  return `var(${mxVarName(name)})`;
}

// { '--mx-surface': '#f7f7f8', ... } for the :root rule.
export function mxCssVariables(
  tokens: Partial<Record<MxTokenName, string>> = MX_TOKENS
): Record<string, string> {
  const vars: Record<string, string> = {};
  (Object.keys(tokens) as MxTokenName[]).forEach((name) => {
    vars[mxVarName(name)] = tokens[name]!;
  });
  return vars;
}
