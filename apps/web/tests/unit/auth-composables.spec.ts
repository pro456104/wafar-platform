// The API client and the pending-request tie: the bootstrap pair, the retry
// path, the refusal envelope, and the resume read's two endings (FR-038,
// FR-041, FR-044; T280).
import { beforeEach, describe, expect, it, vi } from 'vitest';

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  };
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  sessionStorage.clear();
});

describe('usePendingRequest', () => {
  it('reads the stored tie synchronously', async () => {
    sessionStorage.setItem('wafar.pending.requestId', 'stored-id');
    const { heldPendingRequestId } = await import(
      '../../app/composables/auth/usePendingRequest'
    );
    expect(heldPendingRequestId()).toBe('stored-id');
  });

  it('remembers and forgets the identifier', async () => {
    const { usePendingRequest } = await import('../../app/composables/auth/usePendingRequest');
    const pending = usePendingRequest();
    pending.remember('new-id');
    expect(pending.requestId.value).toBe('new-id');
    expect(sessionStorage.getItem('wafar.pending.requestId')).toBe('new-id');
    pending.forget();
    expect(pending.requestId.value).toBeNull();
    expect(sessionStorage.getItem('wafar.pending.requestId')).toBeNull();
  });

  it('returns none when there is no identifier to resume', async () => {
    const { usePendingRequest } = await import('../../app/composables/auth/usePendingRequest');
    const pending = usePendingRequest();
    await expect(pending.resume(null)).resolves.toEqual({ status: 'none' });
  });

  it('returns the live payload on 200 and stores the identifier', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        requestId: 'req-9',
        purpose: 'sign_up',
        state: 'pending',
        phone: '+218912345678',
        codeExpiresAt: '2026-11-10T10:05:00.000Z',
        expiresAt: '2026-11-10T10:30:00.000Z',
        remainingReRequests: 3,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { usePendingRequest } = await import('../../app/composables/auth/usePendingRequest');
    const pending = usePendingRequest();
    const result = await pending.resume('req-9');
    expect(result.status).toBe('live');
    expect(sessionStorage.getItem('wafar.pending.requestId')).toBe('req-9');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/verifications/req-9',
      expect.objectContaining({ credentials: 'same-origin' }),
    );
  });

  it('forgets the identifier and reports expired on any other status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, false, 410)));
    const { usePendingRequest } = await import('../../app/composables/auth/usePendingRequest');
    const pending = usePendingRequest();
    pending.remember('req-10');
    await expect(pending.resume()).resolves.toEqual({ status: 'expired' });
    expect(sessionStorage.getItem('wafar.pending.requestId')).toBeNull();
  });
});

describe('useApi', () => {
  it('stores the bootstrap pair and serves the stamp from it', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ csrfToken: 'csrf', formStamp: 'stamp' }));
    vi.stubGlobal('fetch', fetchMock);
    const { useApi } = await import('../../app/composables/auth/useApi');
    const api = useApi();
    await expect(api.bootstrap()).resolves.toEqual({ csrfToken: 'csrf', formStamp: 'stamp' });
    await expect(api.stamp()).resolves.toBe('stamp');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('bootstraps first when the stamp is asked for before any pair', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ csrfToken: 'csrf', formStamp: 'stamp' }));
    vi.stubGlobal('fetch', fetchMock);
    const { useApi } = await import('../../app/composables/auth/useApi');
    await expect(useApi().stamp()).resolves.toBe('stamp');
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/auth/csrf', expect.anything());
  });

  it('fails the bootstrap when the render read is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, false, 500)));
    const { useApi } = await import('../../app/composables/auth/useApi');
    await expect(useApi().bootstrap()).rejects.toThrow('bootstrap failed');
  });

  it('posts with the CSRF proof and the pending tie', async () => {
    sessionStorage.setItem('wafar.pending.requestId', 'req-tie');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: 'csrf', formStamp: 'stamp' }))
      .mockResolvedValueOnce(jsonResponse({ outcome: 'created' }, true, 202));
    vi.stubGlobal('fetch', fetchMock);
    const { useApi } = await import('../../app/composables/auth/useApi');
    const api = useApi();
    const result = await api.post<{ outcome: string }>('/api/v1/auth/sign-up', { a: 1 });
    expect(result).toEqual({ ok: true, status: 202, data: { outcome: 'created' } });
    const [, options] = fetchMock.mock.calls[1];
    expect(options.headers['x-wafar-csrf']).toBe('csrf');
    expect(options.headers['x-wafar-pending']).toBe('req-tie');
  });

  it('returns the refusal envelope and refreshes the pair on FORM_TOO_FAST', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: 'csrf', formStamp: 'stamp' }))
      .mockResolvedValueOnce(jsonResponse({ error: { code: 'FORM_TOO_FAST' } }, false, 400))
      .mockResolvedValueOnce(jsonResponse({ csrfToken: 'csrf-2', formStamp: 'stamp-2' }));
    vi.stubGlobal('fetch', fetchMock);
    const { useApi } = await import('../../app/composables/auth/useApi');
    const api = useApi();
    await api.bootstrap();
    const result = await api.post('/api/v1/auth/sign-up', {});
    expect(result).toEqual({
      ok: false,
      status: 400,
      refusal: { code: 'FORM_TOO_FAST' },
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('falls back to the internal error on an unreadable refusal', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: 'csrf', formStamp: 'stamp' }))
      .mockResolvedValueOnce({ ok: false, status: 502, json: vi.fn().mockRejectedValue(new Error('no body')) });
    vi.stubGlobal('fetch', fetchMock);
    const { useApi } = await import('../../app/composables/auth/useApi');
    const api = useApi();
    await api.bootstrap();
    const result = await api.post('/api/v1/auth/sign-in', {});
    expect(result).toEqual({
      ok: false,
      status: 502,
      refusal: { code: 'INTERNAL_ERROR' },
    });
  });

  it('reports the internal error when the request throws', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: 'csrf', formStamp: 'stamp' }))
      .mockRejectedValueOnce(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);
    const { useApi } = await import('../../app/composables/auth/useApi');
    const api = useApi();
    await api.bootstrap();
    const result = await api.post('/api/v1/auth/sign-in', {});
    expect(result).toEqual({
      ok: false,
      status: 0,
      refusal: { code: 'INTERNAL_ERROR' },
    });
  });
});
