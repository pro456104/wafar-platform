// Unit test the city list: every one of the 22 governorates present with at
// least one entry, the entry count equal to the SOURCE note's, unique non-empty
// Arabic names, and the recorded digest (FR-005, AC-005).
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import cities from '../libyan-cities.json' with { type: 'json' };
import prefixes from '../libyan-mobile-prefixes.json' with { type: 'json' };
import { normalizeArabic } from '../../normalize/arabic.ts';

const GOVERNORATES = [
  'البطنان',
  'درنة',
  'الجبل الأخضر',
  'المرج',
  'بنغازي',
  'الواحات',
  'الكفرة',
  'سرت',
  'الجفرة',
  'مصراتة',
  'المرقب',
  'طرابلس',
  'الجفارة',
  'الزاوية',
  'النقاط الخمس',
  'الجبل الغربي',
  'نالوت',
  'غات',
  'وادي الشاطئ',
  'سبها',
  'وادي الحياة',
  'مرزق',
];

describe('the Libyan city list', () => {
  it('covers all 22 governorates and records the count', () => {
    const present = new Set(cities.entries.map((entry) => entry.governorate));
    expect(present.size).toBe(22);
    expect(cities.governorateCount).toBe(22);
    for (const governorate of GOVERNORATES) {
      expect(present.has(governorate)).toBe(true);
    }
  });

  it('gives every governorate at least one city or area entry', () => {
    for (const governorate of GOVERNORATES) {
      const entries = cities.entries.filter((entry) => entry.governorate === governorate);
      expect(entries.length, governorate).toBeGreaterThan(0);
    }
  });

  it('records the entry count the SOURCE note states', () => {
    expect(cities.entryCount).toBe(cities.entries.length);
  });

  it('holds unique, non-empty, Arabic names with no Latin alternate', () => {
    const names = cities.entries.map((entry) => entry.name);
    expect(new Set(names).size).toBe(names.length);
    for (const name of names) {
      expect(name.trim().length).toBeGreaterThan(0);
      expect(/[\u0600-\u06FF]/.test(name)).toBe(true);
      expect(/[A-Za-z]/.test(name)).toBe(false);
    }
  });

  it('matches names diacritic-insensitively and stores the exact name', () => {
    expect(normalizeArabic('بَنغازي')).toBe(normalizeArabic('بنغازي'));
    expect(cities.entries.some((entry) => entry.name === 'بنغازي')).toBe(true);
  });

  it('carries the digest of its own entries', () => {
    const digest = createHash('sha256')
      .update(JSON.stringify(cities.entries))
      .digest('hex');
    expect(cities.sha256).toBe(digest);
  });

  it('carries a digest of the mobile prefix set', () => {
    const digest = createHash('sha256')
      .update(JSON.stringify(prefixes.prefixes))
      .digest('hex');
    expect(prefixes.sha256).toBe(digest);
  });
});
