// The quota resource at runtime: the loading, ready, and failed states, the
// exhausted set and the withholding, the five-second read bound, and the three
// invalidation events — the outcome, the visibility, and the month boundary
// (FR-010, FR-015, FR-017; AC-012, AC-027, AC-029, AC-034). The source-text
// suite beside this one states the rules; this suite runs them.
import { mount, type VueWrapper } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { quotaReadBoundMs, useQuota } from '../../../app/composables/upload/useQuota';

type QuotaComposable = ReturnType<typeof useQuota>;

function quotaBody(monthlyUsed: number, activeUsed: number): unknown {
  return {
    monthly: { used: monthlyUsed, limit: 50 },
    active: { used: activeUsed, limit: 300 },
  };
}

let fetchCalls = 0;
let respond: () => Promise<Response>;

function stubQuotaFetch(): void {
  fetchCalls = 0;
  respond = async () =>
    ({ ok: true, status: 200, json: async () => quotaBody(12, 34) }) as unknown as Response;
  vi.stubGlobal('fetch', async (input: string | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();
    if (!url.endsWith('/api/v1/catalogs/quota')) {
      return { ok: false, status: 404, json: async () => ({}) } as unknown as Response;
    }
    fetchCalls += 1;
    const signal = init?.signal;
    if (signal?.aborted === true) throw new Error('aborted');
    const result = respond();
    if (signal === undefined) return result;
    // A real fetch rejects when its signal aborts; the stub mirrors that so
    // the five-second bound is observable.
    return new Promise<Response>((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')));
      result.then(resolve, reject);
    });
  });
}

function mountQuota(): { quota: QuotaComposable; wrapper: VueWrapper } {
  let quota!: QuotaComposable;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const wrapper = mount(
    defineComponent({
      setup() {
        quota = useQuota('تاجر الاختبار');
        return () => h('div');
      },
    }),
    { global: { plugins: [[VueQueryPlugin, { queryClient }]] } },
  );
  return { quota, wrapper };
}

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

async function settled(): Promise<void> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    await flush();
    if (fetchCalls > 0) {
      await flush();
      return;
    }
  }
  throw new Error('the quota read never started');
}

let wrapper: VueWrapper | null = null;

afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('the settled read', () => {
  it('moves from loading to ready with the two pairs', async () => {
    stubQuotaFetch();
    const mounted = mountQuota();
    wrapper = mounted.wrapper;
    const { quota } = mounted;

    expect(quota.state.value).toBe('loading');
    await settled();
    await vi.waitFor(() => expect(quota.state.value).toBe('ready'));

    expect(quota.quota.value).toEqual(quotaBody(12, 34));
    expect(quota.exhausted.value).toEqual([]);
    expect(quota.withholds.value).toBe(false);
  });

  it('names the monthly limit first when both are exhausted', async () => {
    stubQuotaFetch();
    respond = async () =>
      ({ ok: true, status: 200, json: async () => quotaBody(50, 300) }) as unknown as Response;
    const mounted = mountQuota();
    wrapper = mounted.wrapper;
    const { quota } = mounted;

    await settled();
    await vi.waitFor(() => expect(quota.state.value).toBe('ready'));

    expect(quota.exhausted.value).toEqual(['monthly', 'active']);
    expect(quota.withholds.value).toBe(true);
  });

  it('names the active limit alone when only it is exhausted', async () => {
    stubQuotaFetch();
    respond = async () =>
      ({ ok: true, status: 200, json: async () => quotaBody(12, 300) }) as unknown as Response;
    const mounted = mountQuota();
    wrapper = mounted.wrapper;
    const { quota } = mounted;

    await settled();
    await vi.waitFor(() => expect(quota.state.value).toBe('ready'));

    expect(quota.exhausted.value).toEqual(['active']);
    expect(quota.withholds.value).toBe(true);
  });
});

describe('the failed read', () => {
  it('answers a failed first read with no count the page cannot verify', async () => {
    stubQuotaFetch();
    respond = async () => ({ ok: false, status: 503, json: async () => ({}) }) as unknown as Response;
    const mounted = mountQuota();
    wrapper = mounted.wrapper;
    const { quota } = mounted;

    await settled();
    await vi.waitFor(() => expect(quota.state.value).toBe('failed'));

    expect(quota.quota.value).toBeNull();
    expect(quota.exhausted.value).toEqual([]);
    expect(quota.withholds.value).toBe(false);
  });

  it('keeps the last settled data when a re-read fails', async () => {
    stubQuotaFetch();
    const mounted = mountQuota();
    wrapper = mounted.wrapper;
    const { quota } = mounted;

    await settled();
    await vi.waitFor(() => expect(quota.state.value).toBe('ready'));

    respond = async () => ({ ok: false, status: 503, json: async () => ({}) }) as unknown as Response;
    quota.refresh();
    await vi.waitFor(() => expect(quota.state.value).toBe('failed'));

    expect(quota.quota.value).toEqual(quotaBody(12, 34));
  });
});

describe('the five-second client bound', () => {
  it('ends a read that never answers in the failed state, with no automatic retry', async () => {
    vi.useFakeTimers();
    stubQuotaFetch();
    // A read that hangs until its signal aborts:
    respond = () => new Promise<Response>(() => {});
    const mounted = mountQuota();
    wrapper = mounted.wrapper;
    const { quota } = mounted;

    await vi.advanceTimersByTimeAsync(0);
    expect(quota.state.value).toBe('loading');
    const before = fetchCalls;
    await vi.advanceTimersByTimeAsync(quotaReadBoundMs + 100);
    await vi.waitFor(() => expect(quota.state.value).toBe('failed'));
    expect(fetchCalls).toBe(before);
  });
});

describe('the invalidation events', () => {
  it('refresh re-reads the quota', async () => {
    stubQuotaFetch();
    const mounted = mountQuota();
    wrapper = mounted.wrapper;
    const { quota } = mounted;

    await settled();
    await vi.waitFor(() => expect(quota.state.value).toBe('ready'));
    const before = fetchCalls;
    quota.refresh();
    await vi.waitFor(() => expect(fetchCalls).toBeGreaterThan(before));
  });

  it('a visible page re-reads on the visibility event; a hidden one does not', async () => {
    stubQuotaFetch();
    const mounted = mountQuota();
    wrapper = mounted.wrapper;
    const { quota } = mounted;

    await settled();
    await vi.waitFor(() => expect(quota.state.value).toBe('ready'));

    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    const hidden = fetchCalls;
    document.dispatchEvent(new Event('visibilitychange'));
    await flush();
    expect(fetchCalls).toBe(hidden);

    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.waitFor(() => expect(fetchCalls).toBeGreaterThan(hidden));
    delete (document as unknown as Record<string, unknown>)['visibilityState'];
  });

  it('the calendar month boundary re-reads while the page is open', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-31T23:50:00.000Z'));
    stubQuotaFetch();
    const mounted = mountQuota();
    wrapper = mounted.wrapper;
    const { quota } = mounted;

    await vi.advanceTimersByTimeAsync(0);
    await vi.waitFor(() => expect(quota.state.value).toBe('ready'));
    const before = fetchCalls;

    // The boundary is the next month's first day at 00:00:05 local (TZ=UTC):
    // ten minutes and five seconds from the fixed now.
    await vi.advanceTimersByTimeAsync(10 * 60 * 1_000 + 5_000 + 50);
    await vi.waitFor(() => expect(fetchCalls).toBeGreaterThan(before));
  });

  it('unmount clears the month timer and the visibility listener', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-31T23:50:00.000Z'));
    stubQuotaFetch();
    const mounted = mountQuota();
    const { quota } = mounted;

    await vi.advanceTimersByTimeAsync(0);
    await vi.waitFor(() => expect(quota.state.value).toBe('ready'));
    mounted.wrapper.unmount();
    wrapper = null;

    const before = fetchCalls;
    await vi.advanceTimersByTimeAsync(20 * 60 * 1_000);
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchCalls).toBe(before);
  });
});
