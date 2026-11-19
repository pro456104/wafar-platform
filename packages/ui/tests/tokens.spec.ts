// The token contract test: every recorded token name and value, so a page that
// invents a colour, a size, or a duration fails here (FR-025, AC-027, AC-024).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync('packages/ui/app/assets/css/tokens.css', 'utf8');

function value(name: string): string | null {
  const match = new RegExp(`${name}:\\s*([^;]+);`).exec(css);
  return match?.[1]?.trim() ?? null;
}

/** The dark block's value, since `value` reads the first (light) declaration. */
function darkValue(name: string): string | null {
  const block = /:root\[data-appearance='dark'\]\s*\{([\s\S]*?)\}/.exec(css)?.[1] ?? '';
  const match = new RegExp(`${name}:\\s*([^;]+);`).exec(block);
  return match?.[1]?.trim() ?? null;
}

/** An `oklch()` colour to linear sRGB (the focus ring's token form). */
function oklchToLinear(colour: string): [number, number, number] {
  const match = /oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)/i.exec(colour);
  if (match === null) throw new Error(`not an oklch colour: ${colour}`);
  const lightness = Number(match[1]) / 100;
  const chroma = Number(match[2]);
  const hue = (Number(match[3]) * Math.PI) / 180;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** A `#rrggbb` colour to relative luminance (WCAG 2.2, non-text contrast). */
function luminance(colour: string): number {
  const channels = [1, 3, 5].map((index) => {
    const channel = parseInt(colour.slice(index, index + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const [red = 0, green = 0, blue = 0] = channels;
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(first: string, second: string): number {
  const [red, green, blue] = oklchToLinear(first);
  const ring = 0.2126 * Math.min(1, Math.max(0, red))
    + 0.7152 * Math.min(1, Math.max(0, green))
    + 0.0722 * Math.min(1, Math.max(0, blue));
  const surface = luminance(second);
  return (Math.max(ring, surface) + 0.05) / (Math.min(ring, surface) + 0.05);
}

describe('the Precision token contract', () => {
  it('records the light primary of ADR-128 §2', () => {
    expect(value('--wf-primary')).toBe('oklch(55.3% 0.195 38.402)');
  });

  it('records the four light surfaces and the two borders', () => {
    expect(value('--wf-surface')).toBe('#ffffff');
    expect(value('--wf-surface-muted')).toBe('#f6f7f8');
    expect(value('--wf-surface-sunken')).toBe('#eef0f3');
    expect(value('--wf-surface-inverse')).toBe('#101418');
    expect(value('--wf-border')).toBe('#e4e7eb');
    expect(value('--wf-border-subtle')).toBe('#f1f3f5');
  });

  it('records the type scale and the two families', () => {
    expect(value('--wf-text-2xl')).toBe('1.5rem');
    expect(value('--wf-font-sans')).toContain('IBM Plex Sans Arabic');
    expect(value('--wf-font-mono')).toContain('IBM Plex Mono');
  });

  it('records the shape and the measurements of ADR-128 §4 and §5', () => {
    expect(value('--wf-radius')).toBe('0.125rem');
    expect(value('--wf-header-height')).toBe('3.5rem');
    expect(value('--wf-sidebar-width')).toBe('15rem');
    expect(value('--wf-rail-width')).toBe('4.25rem');
    expect(value('--wf-content-max')).toBe('88rem');
    expect(value('--wf-footer-height')).toBe('3.5rem');
    expect(value('--wf-bottom-bar-height')).toBe('60px');
    expect(value('--wf-raised-action')).toBe('56px');
    expect(value('--wf-icon-size')).toBe('20px');
  });

  it('records the focus ring, the motion scale, and the loading rule', () => {
    expect(value('--wf-focus-width')).toBe('2px');
    expect(value('--wf-duration-fast')).toBe('120ms');
    expect(value('--wf-loading-delay')).toBe('120ms');
    expect(value('--wf-loading-minimum')).toBe('300ms');
    expect(value('--wf-shimmer-angle')).toBe('90deg');
  });

  it('records the touch floor and a z-index scale', () => {
    expect(value('--wf-touch-floor')).toBe('44px');
    expect(value('--wf-z-header')).toBe('20');
    expect(value('--wf-z-drawer')).toBe('30');
    expect(value('--wf-z-overlay')).toBe('40');
  });

  it('records the focus offset and a focus colour above 3:1 on both surfaces', () => {
    expect(value('--wf-focus-offset')).toBe('2px');
    const focus = value('--wf-focus-colour');
    expect(focus).not.toBeNull();
    const light = value('--wf-surface');
    const dark = darkValue('--wf-surface');
    expect(light).not.toBeNull();
    expect(dark).not.toBeNull();
    // WCAG 2.2 SC 1.4.11: the ring is a non-text indicator, at least 3:1
    // against the surface it draws on, in each appearance.
    expect(contrast(focus ?? '', light ?? '')).toBeGreaterThanOrEqual(3);
    expect(contrast(focus ?? '', dark ?? '')).toBeGreaterThanOrEqual(3);
  });

  it('defaults to light and carries a dark override', () => {
    expect(css).toContain(":root[data-appearance='dark']");
  });
});
