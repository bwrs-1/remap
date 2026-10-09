// Design tokens of the editor: the one place where its colors, fonts and
// radii are defined. They reach the page as CSS custom properties
// (--mx-<name>, see MxTokenStyles), which the SCSS variables ($cfg-* in
// _variables.scss) point to, and the MUI theme reads the same values.
//
// The values are those of the current editor; the redesigned UI changes
// them here only.
export const MX_TOKENS = {
  // Surfaces
  surface: '#f7f7f8', // editor canvas
  panel: '#f2f2f3', // side bar
  header: '#ffffff',
  card: '#ffffff',
  field: '#ececee', // segmented controls, pills, muted fills
  border: '#e2e2e4',
  // Text
  text: '#121214',
  'text-2': '#6b6c70',
  // Primary action
  ink: '#333438',
  'ink-strong': '#121214',
  'on-ink': '#ffffff',
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
} as const;

export type MxTokenName = keyof typeof MX_TOKENS;

export function mxVarName(name: MxTokenName): string {
  return `--mx-${name}`;
}

// `var(--mx-<name>)`, for inline styles.
export function mxVar(name: MxTokenName): string {
  return `var(${mxVarName(name)})`;
}

// { '--mx-surface': '#f7f7f8', ... } for the :root rule.
export function mxCssVariables(): Record<string, string> {
  const vars: Record<string, string> = {};
  (Object.keys(MX_TOKENS) as MxTokenName[]).forEach((name) => {
    vars[mxVarName(name)] = MX_TOKENS[name];
  });
  return vars;
}
