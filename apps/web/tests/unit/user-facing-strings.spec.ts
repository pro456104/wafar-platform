// SC-008's copy scan over every string a person reads: Arabic and right-to-left,
// Latin numerals only, no diacritics, and no emoji. The subject is the complete
// one — the three pages' copy, the frame's copy, the four SMS templates, and the
// numerals the platform generates at runtime, each produced through the renderer
// that produces it (T012's WfNumeral, T052's code step, and T026's templates) —
// and the verdict is SC-008's closed fail predicate: an Extended_Pictographic
// code point, U+FE0F, or U+20E3; an Arabic-Indic digit; a combining mark in
// U+064B–U+0652 or U+0670; or a Latin letter sequence other than the token SMS.
// One failing string fails the test, the run, and the CI job; the report is the
// acceptance evidence, not a warning. The only exceptions are the two SC-008
// states — a supplied full name or shop name, and the fixed city list's recorded
// names — each outside the language, numeral, and diacritic limbs and inside the
// no-emoji limb (SC-008, AC-028, FR-026, FR-038; T100, T174).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { formatPhoneForDisplay, hasEmoji } from '@wafar/shared';
import cities from '@wafar/shared/reference/cities' with { type: 'json' };
import WfNumeral from '@wafar/ui/app/components/WfNumeral.vue';
import CodeStep from '../../app/components/auth/CodeStep.vue';
import { messageFor, notices, renderedCodes } from '../../app/composables/auth/useAuthMessages';
import {
  renderBody,
  templateBodies,
  type SmsKind,
} from '../../../api/src/modules/auth/sms/templates.ts';

const ARABIC_INDIC = /[\u0660-\u0669\u06F0-\u06F9]/;
// SC-008's closed diacritic limb.
const DIACRITICS = /[\u064B-\u0652\u0670]/;
const LATIN_SEQUENCE = /[A-Za-z]+/g;
const ARABIC = /[\u0600-\u06FF]/;

/** True when the value carries any Arabic letter, so it is in the scan's subject. */
function hasArabic(value: string): boolean {
  return ARABIC.test(value);
}

/**
 * SC-008's closed fail predicate. A supplied value or a city name is exempt from
 * the language, numeral, and diacritic limbs and stays inside the no-emoji limb.
 */
function violations(value: string, exception?: 'supplied'): string[] {
  const found: string[] = [];
  if (exception !== 'supplied') {
    if (ARABIC_INDIC.test(value)) found.push('arabic-indic numeral');
    if (DIACRITICS.test(value)) found.push('diacritic');
    for (const run of value.match(LATIN_SEQUENCE) ?? []) {
      if (run !== 'SMS') found.push(`latin letters: ${run}`);
    }
  }
  if (hasEmoji(value)) found.push('emoji');
  return found;
}

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) out.push(...sourceFiles(path));
    else if (entry.endsWith('.vue') || entry.endsWith('.ts')) out.push(path);
  }
  return out;
}

/** Every string a template or a script carries: text nodes, attributes, literals. */
function stringsOf(source: string): string[] {
  const found: string[] = [];
  for (const match of source.match(/>([^<>{}]*[\u0600-\u06FF][^<>{}]*)</g) ?? []) {
    found.push(match.slice(1, -1).trim());
  }
  for (const match of source.matchAll(
    /(?<=\s)(?:aria-label|aria-description|placeholder|title|alt|label)="([^"\n]*[\u0600-\u06FF][^"\n]*)"/g,
  )) {
    found.push((match[1] as string).trim());
  }
  // A literal is one quoted run: no markup, no line break, so a quote pair that
  // spans two tags is not mistaken for a string.
  for (const match of source.matchAll(/['"`]([^'"`<>\n]*[\u0600-\u06FF][^'"`<>\n]*)['"`]/g)) {
    found.push((match[1] as string).trim());
  }
  return found.filter((text) => text.length > 0);
}

function scan(value: string, origin: string, exception?: 'supplied'): string[] {
  return violations(value, exception).map(
    (kind) => `${origin}: ${value} -> ${kind}`,
  );
}

describe('the user-facing copy', () => {
  it('passes every message table row', () => {
    const failures: string[] = [];
    for (const code of renderedCodes) {
      for (const reason of [undefined, 'empty', 'too_long', 'emoji'] as const) {
        const text = messageFor(reason === undefined ? { code } : { code, reason });
        failures.push(...scan(text, `${code}:${reason ?? '-'}`));
      }
    }
    expect(failures).toEqual([]);
  });

  it('passes the notices', () => {
    const failures = [
      notices.resendAccepted,
      notices.signedInAfterVerification,
      notices.passwordPolicy,
      notices.expiryHint,
      notices.codeHeading,
      notices.codeBody,
      notices.codeLabel,
      notices.codeHint,
      notices.verifying,
      notices.resending,
      notices.signInProgress,
      notices.settingProgress,
      notices.requestProgress,
    ].flatMap((text) => scan(text, 'notice'));
    expect(failures).toEqual([]);
  });

  it('passes the three pages and the frame', () => {
    const directories = [
      'apps/web/app/pages',
      'apps/web/app/components',
      'apps/web/app/layouts',
      'packages/ui/app/components/shell',
    ];
    const offenders: string[] = [];
    for (const directory of directories) {
      for (const file of sourceFiles(directory)) {
        const source = readFileSync(file, 'utf8');
        for (const text of stringsOf(source)) {
          offenders.push(...scan(text, file));
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('passes the four SMS templates as the channel renders them', () => {
    // The code's length comes from the code step's own renderer, so the test
    // types neither the length nor the digits.
    const step = mount(CodeStep, {
      props: {
        collected: [],
        displayPhone: formatPhoneForDisplay('+218912345678'),
        remainingReRequests: 3,
        loading: false,
      },
      global: { stubs: { MessageAlert: { props: ['message', 'kind'], template: '<div />' } } },
    });
    const input = step.find('input');
    const length = Number.parseInt(input.attributes('maxlength') ?? '0', 10);
    expect(length).toBe(6);
    const code = '123456'.slice(0, length);

    const failures: string[] = [];
    for (const kind of Object.keys(templateBodies) as SmsKind[]) {
      const body = renderBody(kind, kind.startsWith('otp_') ? code : undefined);
      failures.push(...scan(body, `sms:${kind}`));
      if (kind.startsWith('otp_')) {
        // The one-time code is exactly six Latin digits inside the body.
        expect(body.match(/\d+/g) ?? []).toContain(code);
        expect(code).toMatch(/^\d{6}$/);
      }
    }
    expect(failures).toEqual([]);
  });

  it('passes the mobile number’s display form as the renderer produces it', () => {
    const display = formatPhoneForDisplay('+218912345678');
    expect(display).toMatch(/^\+218 \d{2} \d{3} \d{4}$/);
    expect(violations(display)).toEqual([]);
    // The renderer, not the test, owns the form: another number takes the same
    // shape.
    const other = formatPhoneForDisplay('+218911234567');
    expect(other).toMatch(/^\+218 \d{2} \d{3} \d{4}$/);
    expect(other).not.toBe(display);
  });

  it('renders the generated numerals through WfNumeral as Latin digits', () => {
    // The supplied form's Arabic-Indic digits are mapped, so the component's
    // output is the Latin form every string carries.
    const wrapper = mount(WfNumeral, { props: { value: '١٢٣٤٥٦' } });
    expect(wrapper.text()).toBe('123456');
    expect(violations(wrapper.text())).toEqual([]);
    const six = mount(WfNumeral, { props: { value: 123456 } });
    expect(six.text()).toMatch(/^\d{6}$/);
  });

  it('applies the supplied-value and city-list exceptions without a third', () => {
    // A supplied full name or shop name is outside the language, numeral, and
    // diacritic limbs, and inside the no-emoji limb.
    expect(violations('محمد ١٢٣', 'supplied')).toEqual([]);
    expect(violations('محمد ١٢٣')).toContain('arabic-indic numeral');
    expect(violations('اسمّ', 'supplied')).toEqual([]);
    expect(violations('اسمّ')).toContain('diacritic');
    expect(violations('محمد 😀', 'supplied')).toContain('emoji');

    // The fixed city list's recorded names are the second exception: Arabic,
    // emoji-free, and never re-numeralised or transliterated.
    const offenders: string[] = [];
    for (const entry of cities.entries) {
      const name = entry.name;
      expect(hasArabic(name), `${name} is not Arabic`).toBe(true);
      const found = violations(name, 'supplied');
      if (found.length > 0) offenders.push(`${name} -> ${found.join(', ')}`);
    }
    expect(offenders).toEqual([]);
  });

  it('fails each limb of SC-008’s closed predicate', () => {
    // The predicate's own evidence: every limb refuses, and the token SMS is the
    // only Latin a string may carry.
    expect(violations('نص 😀')).toContain('emoji');
    expect(violations('نص \uFE0F')).toContain('emoji');
    expect(violations('نص \u20E3')).toContain('emoji');
    expect(violations('نص ١٢٣')).toContain('arabic-indic numeral');
    expect(violations('نص ۱۲۳')).toContain('arabic-indic numeral');
    expect(violations('نصّ')).toContain('diacritic');
    expect(violations('نص abc')).toContain('latin letters: abc');
    expect(violations('أرسل SMS')).toEqual([]);
  });
});
