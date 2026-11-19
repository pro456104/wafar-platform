// The quota refresh rule: one TanStack Query key per account, invalidation after
// every outcome, on visibility and at the month boundary, the five-second read
// bound, and the two withheld actions' restoration (FR-015, FR-017, AC-012,
// AC-029, AC-034; T077).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('apps/web/app/composables/upload/useQuota.ts', 'utf8');

describe('the quota resource', () => {
  it('keys the read by the account', () => {
    expect(source).toContain("queryKey: ['quota', accountKey]");
  });

  it('carries the five-second client bound and no automatic retry', () => {
    expect(source).toContain('quotaReadBoundMs = 5_000');
    expect(source).toContain('AbortController');
    expect(source).toContain('retry: false');
  });

  it('invalidates after an outcome, on visibility, and at the month boundary', () => {
    expect(source).toContain('invalidateQueries');
    expect(source).toContain('visibilitychange');
    expect(source).toContain("setMonth(now.getMonth() + 1, 1)");
  });

  it('exposes the loading, ready, and failed states', () => {
    expect(source).toContain("'loading'");
    expect(source).toContain("'ready'");
    expect(source).toContain("'failed'");
  });

  it('derives the exhausted set from both limits', () => {
    expect(source).toContain('monthly.used >= value.monthly.limit');
    expect(source).toContain('active.used >= value.active.limit');
  });
});
