import { breakpointForWidth } from '@/hooks/useResponsive';

describe('breakpointForWidth', () => {
  it('returns xs for narrow widths', () => {
    expect(breakpointForWidth(320)).toBe('xs');
  });

  it('returns md around tablet widths', () => {
    expect(breakpointForWidth(800)).toBe('md');
  });

  it('returns xxl for very wide layouts', () => {
    expect(breakpointForWidth(1600)).toBe('xxl');
  });
});
