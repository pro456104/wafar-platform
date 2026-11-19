// The quota resource: TanStack Query owns it, keyed by the account, with the
// five-second client bound, no automatic retry, and the three invalidation
// events the plan fixes (FR-015, FR-017; plan → Verification Notes).
import { computed, onBeforeUnmount } from 'vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import type { QuotaResponse } from '@wafar/shared';

export const quotaReadBoundMs = 5_000;

export function useQuota(accountKey: string) {
  const client = useQueryClient();

  const query = useQuery({
    queryKey: ['quota', accountKey],
    queryFn: async (): Promise<QuotaResponse> => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), quotaReadBoundMs);
      try {
        const response = await fetch('/api/v1/catalogs/quota', {
          credentials: 'same-origin',
          headers: { accept: 'application/json' },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`quota read failed: ${response.status}`);
        return (await response.json()) as QuotaResponse;
      } finally {
        clearTimeout(timer);
      }
    },
    retry: false,
  });

  const quota = computed<QuotaResponse | null>(() => query.data.value ?? null);
  const state = computed<'loading' | 'ready' | 'failed'>(() => {
    if (query.isPending.value) return 'loading';
    if (query.isError.value) return 'failed';
    return 'ready';
  });
  const exhausted = computed<('monthly' | 'active')[]>(() => {
    const value = quota.value;
    if (value === null) return [];
    const reasons: ('monthly' | 'active')[] = [];
    if (value.monthly.used >= value.monthly.limit) reasons.push('monthly');
    if (value.active.used >= value.active.limit) reasons.push('active');
    return reasons;
  });
  const withholds = computed(() => {
    // A verified exhausted state suppresses the choosing state; a failed re-read
    // keeps the exhausted content and the withholding (FR-017).
    if (exhausted.value.length > 0) return true;
    return state.value === 'failed' && query.data.value !== undefined
      ? false
      : false;
  });

  function invalidate(): void {
    void client.invalidateQueries({ queryKey: ['quota', accountKey] });
  }

  function refresh(): void {
    invalidate();
  }

  // On visibility, and at the calendar month's boundary while the page is open.
  let monthTimer: ReturnType<typeof setTimeout> | null = null;
  function scheduleMonthBoundary(): void {
    if (monthTimer !== null) clearTimeout(monthTimer);
    const now = new Date();
    const next = new Date(now.getTime());
    next.setMonth(now.getMonth() + 1, 1);
    next.setHours(0, 0, 5, 0);
    monthTimer = setTimeout(() => {
      invalidate();
      scheduleMonthBoundary();
    }, Math.max(1_000, next.getTime() - now.getTime()));
  }
  scheduleMonthBoundary();

  function onVisibility(): void {
    if (document.visibilityState === 'visible') invalidate();
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibility);
  }
  onBeforeUnmount(() => {
    if (monthTimer !== null) clearTimeout(monthTimer);
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onVisibility);
    }
  });

  return { query, quota, state, exhausted, withholds, invalidate, refresh };
}
