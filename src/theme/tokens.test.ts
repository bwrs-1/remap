import {
  MX_SHELL_TOKENS,
  MX_TOKENS,
  mxCssVariables,
  mxVar,
  mxVarName,
} from './tokens';

describe('tokens', () => {
  test('every token becomes a --mx- custom property', () => {
    const vars = mxCssVariables();
    expect(Object.keys(vars)).toHaveLength(Object.keys(MX_TOKENS).length);
    expect(vars['--mx-surface']).toBe(MX_TOKENS.surface);
    expect(vars['--mx-text-2']).toBe(MX_TOKENS['text-2']);
  });

  test('mxVar references the custom property', () => {
    expect(mxVarName('ink')).toBe('--mx-ink');
    expect(mxVar('ink')).toBe('var(--mx-ink)');
  });

  test('the new layout overrides only known tokens', () => {
    const vars = mxCssVariables(MX_SHELL_TOKENS);
    expect(vars['--mx-accent']).toBe('#acdccc');
    Object.keys(MX_SHELL_TOKENS).forEach((name) =>
      expect(Object.keys(MX_TOKENS)).toContain(name)
    );
  });
});
