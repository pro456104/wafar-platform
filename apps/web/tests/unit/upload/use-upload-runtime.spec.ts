// The page's state machine and part transport, exercised at runtime: the
// accepted and duplicate outcomes, the refusal paths, the cancel and departure,
// the stall and completion bounds, the same-file retry, and the session-end
// carry-through (FR-006, FR-048-FR-050, FR-061; AC-003, AC-009, AC-010, AC-050).
// The source-text suites beside this one state the rules; this suite runs them.
import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import {
  completionTimeoutMs,
  stallBoundMs,
  useUpload,
} from '../../../app/composables/upload/useUpload';

type UploadComposable = ReturnType<typeof useUpload>;

interface Observed {
  outcomes: number;
  focus: string[];
  announcements: { channel: string; text: string }[];
}

interface FetchCall {
  url: string;
  method: string;
  body: unknown;
  keepalive: boolean;
  csrf: string | undefined;
  signal: AbortSignal | undefined;
}

/** One controllable XMLHttpRequest: the test drives its events by hand. */
class FakeXHR {
  static instances: FakeXHR[] = [];
  static reset(): void {
    FakeXHR.instances = [];
  }
  upload = {
    listener: null as ((event: { lengthComputable: boolean; loaded: number; total: number }) => void) | null,
    addEventListener: (
      _type: string,
      listener: (event: { lengthComputable: boolean; loaded: number; total: number }) => void,
    ): void => {
      this.upload.listener = listener;
    },
  };
  listeners: Record<string, () => void> = {};
  status = 0;
  aborted = false;
  sent = false;
  method = '';
  url = '';
  body: unknown = null;
  responseHeaders: Record<string, string> = {};
  open(method: string, url: string): void {
    this.method = method;
    this.url = url;
  }
  setRequestHeader(_name: string, _value: string): void {}
  addEventListener(type: string, listener: () => void): void {
    this.listeners[type] = listener;
  }
  send(body: unknown): void {
    this.body = body;
    this.sent = true;
    FakeXHR.instances.push(this);
  }
  abort(): void {
    this.aborted = true;
    this.listeners['abort']?.();
  }
  getResponseHeader(name: string): string | null {
    return this.responseHeaders[name.toLowerCase()] ?? null;
  }
  respond(status: number, etag: string | null): void {
    this.status = status;
    if (etag !== null) this.responseHeaders['etag'] = etag;
    this.listeners['load']?.();
  }
  progress(loaded: number, total: number): void {
    this.upload.listener?.({ lengthComputable: true, loaded, total });
  }
}

function json(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

const acceptedCatalog = {
  id: 'c1',
  fileName: 'كتالوج.pdf',
  byteSize: 2048,
  contentType: 'application/pdf',
  status: 'uploaded',
  uploadedAt: '2026-11-19T10:00:00.000Z',
};

const duplicateOriginal = {
  id: 'c0',
  fileName: 'الأصل.pdf',
  uploadedAt: '2026-11-01T09:00:00.000Z',
  status: 'completed',
};

interface Routes {
  start?: (call: FetchCall) => Response | Promise<Response>;
  complete?: (call: FetchCall) => Response | Promise<Response>;
  abort?: (call: FetchCall) => Response | Promise<Response>;
}

const calls: FetchCall[] = [];

function stubFetch(routes: Routes = {}): void {
  calls.length = 0;
  vi.stubGlobal('fetch', async (input: string | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method ?? 'GET';
    const call: FetchCall = {
      url,
      method,
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : null,
      keepalive: init?.keepalive === true,
      csrf: (init?.headers as Record<string, string> | undefined)?.['x-wafar-csrf'],
      signal: init?.signal ?? undefined,
    };
    calls.push(call);
    if (url.endsWith('/api/v1/auth/csrf')) {
      return json(200, { csrfToken: 'held', formStamp: 'stamp' });
    }
    if (url.endsWith('/complete')) {
      return routes.complete?.(call) ?? json(201, { outcome: 'accepted', catalog: acceptedCatalog });
    }
    if (url.endsWith('/api/v1/uploads') && method === 'POST') {
      return (
        routes.start?.(call) ??
        json(201, {
          uploadId: 'u1',
          partSize: 8 * 1024 * 1024,
          expiresAt: new Date(Date.now() + 900_000).toISOString(),
          parts: [
            { partNumber: 1, url: 'http://127.0.0.1:8333/wafar/intake/u1/original?partNumber=1', byteSize: 2048 },
          ],
        })
      );
    }
    if (method === 'DELETE') {
      return routes.abort?.(call) ?? json(204, null);
    }
    return json(404, { error: { code: 'NOT_FOUND', retryable: false } });
  });
}

function mountUpload(): { upload: UploadComposable; observed: Observed; wrapper: VueWrapper } {
  const observed: Observed = { outcomes: 0, focus: [], announcements: [] };
  let upload!: UploadComposable;
  const wrapper = mount(
    defineComponent({
      setup() {
        upload = useUpload({
          onOutcome: () => {
            observed.outcomes += 1;
          },
          announce: (channel, text) => observed.announcements.push({ channel, text }),
          focus: (target) => {
            if (target !== null) observed.focus.push(target);
          },
        });
        return () => h('div');
      },
    }),
  );
  return { upload, observed, wrapper };
}

function pdfFile(size = 2048): File {
  return new File([new Uint8Array(size)], 'كتالوج.pdf', { type: 'application/pdf' });
}

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

async function waitForXhr(count = 1): Promise<FakeXHR[]> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (FakeXHR.instances.length >= count) return FakeXHR.instances;
    await flush();
  }
  throw new Error(`expected ${count} part request(s), saw ${FakeXHR.instances.length}`);
}

let wrapper: VueWrapper | null = null;

afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
  vi.unstubAllGlobals();
  vi.useRealTimers();
  FakeXHR.reset();
});

describe('the accepted transfer', () => {
  it('runs selecting, uploading, screening, then success with the catalog view', async () => {
    stubFetch();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload, observed } = mounted;

    const pending = upload.select(pdfFile());
    await waitForXhr();
    expect(upload.state.value).toBe('uploading');
    expect(upload.phase.value).toBe('transfer');
    expect(observed.focus).toContain('card');

    FakeXHR.instances[0]!.respond(200, '"etag-1"');
    await pending;

    expect(upload.state.value).toBe('success');
    expect(upload.catalog.value).toEqual({
      id: 'c1',
      fileName: 'كتالوج.pdf',
      byteSize: 2048,
      contentType: 'application/pdf',
      uploadedAt: '2026-11-19T10:00:00.000Z',
    });
    expect(observed.focus).toContain('success');
    expect(observed.outcomes).toBe(1);
    const texts = observed.announcements.map((entry) => entry.text);
    expect(texts).toContain('بدأ رفع كتالوج.pdf');
    expect(texts).toContain('يجري فحص الملف');
    expect(texts.some((text) => text.includes('تم حفظ كتالوج.pdf في ملفاتي'))).toBe(true);
    const complete = calls.find((call) => call.url.endsWith('/complete'));
    expect(complete?.body).toEqual({ parts: [{ partNumber: 1, etag: '"etag-1"' }] });
  });

  it('reads the percentage from the part request’s own progress event', async () => {
    stubFetch();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload } = mounted;

    const pending = upload.select(pdfFile());
    const [xhr] = await waitForXhr();
    xhr!.progress(512, 2048);
    expect(upload.percent.value).toBe(25);
    xhr!.progress(2048, 2048);
    expect(upload.percent.value).toBe(100);
    xhr!.respond(200, '"etag-1"');
    await pending;
  });

  it('falls back to a synthetic etag when the storage answers none', async () => {
    stubFetch();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload } = mounted;

    const pending = upload.select(pdfFile());
    const [xhr] = await waitForXhr();
    xhr!.respond(200, null);
    await pending;

    const complete = calls.find((call) => call.url.endsWith('/complete'));
    expect(complete?.body).toEqual({ parts: [{ partNumber: 1, etag: '"part-1"' }] });
    expect(upload.state.value).toBe('success');
  });
});

describe('the duplicate outcome', () => {
  it('carries the four-field original and announces its name and date', async () => {
    stubFetch({ complete: () => json(200, { outcome: 'duplicate', original: duplicateOriginal }) });
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload, observed } = mounted;

    const pending = upload.select(pdfFile());
    const [xhr] = await waitForXhr();
    xhr!.respond(200, '"etag-1"');
    await pending;

    expect(upload.state.value).toBe('duplicate');
    expect(upload.duplicate.value).toEqual(duplicateOriginal);
    expect(observed.focus).toContain('duplicate');
    expect(observed.outcomes).toBe(1);
    const texts = observed.announcements.map((entry) => entry.text);
    expect(texts.some((text) => text.includes('الأصل.pdf') && text.includes('2026-11-01'))).toBe(true);
  });
});

describe('the refusal paths', () => {
  it('answers a server refusal at completion with its own code', async () => {
    stubFetch({
      complete: () => json(422, { error: { code: 'UPLOAD_INFECTED', retryable: false } }),
    });
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload, observed } = mounted;

    const pending = upload.select(pdfFile());
    const [xhr] = await waitForXhr();
    xhr!.respond(200, '"etag-1"');
    await pending;

    expect(upload.state.value).toBe('error');
    expect(upload.errorCode.value).toBe('UPLOAD_INFECTED');
    expect(observed.focus).toContain('error');
    expect(observed.announcements.some((entry) => entry.channel === 'assertive' && entry.text === 'تعذر رفع الملف')).toBe(true);
    expect(observed.outcomes).toBe(0);
  });

  it('answers a completion with no response as the page’s own transfer failure', async () => {
    stubFetch({ complete: () => Promise.reject(new Error('network')) });
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload, observed } = mounted;

    const pending = upload.select(pdfFile());
    const [xhr] = await waitForXhr();
    xhr!.respond(200, '"etag-1"');
    await pending;

    expect(upload.state.value).toBe('error');
    expect(upload.errorCode.value).toBeNull();
    expect(observed.announcements.some((entry) => entry.text === 'تعذر إكمال نقل الملف')).toBe(true);
    expect(upload.heldFile.value).not.toBeNull();
  });

  it('answers a start refusal before any part is written', async () => {
    stubFetch({ start: () => json(413, { error: { code: 'UPLOAD_TOO_LARGE', retryable: false } }) });
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload } = mounted;

    await upload.select(pdfFile());

    expect(upload.state.value).toBe('error');
    expect(upload.errorCode.value).toBe('UPLOAD_TOO_LARGE');
    expect(FakeXHR.instances).toHaveLength(0);
  });

  it('answers a start with no response as R1’s retryable INTERNAL_ERROR row', async () => {
    stubFetch({ start: () => Promise.reject(new Error('network')) });
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload } = mounted;

    await upload.select(pdfFile());

    // The start request goes through the one API client, which answers a
    // request that produced no response with R1's INTERNAL_ERROR row; the
    // page's own code-less transfer failure is the part transport's and the
    // completion's (T049, T051).
    expect(upload.state.value).toBe('error');
    expect(upload.errorCode.value).toBe('INTERNAL_ERROR');
  });

  it('restates the attempt bound’s wait from the response', async () => {
    stubFetch({
      start: () =>
        json(429, { error: { code: 'UPLOAD_TOO_MANY_ATTEMPTS', retryable: true, retryAfterSeconds: 42 } }),
    });
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload } = mounted;

    await upload.select(pdfFile());

    expect(upload.state.value).toBe('error');
    expect(upload.errorCode.value).toBe('UPLOAD_TOO_MANY_ATTEMPTS');
    expect(upload.retryAfterSeconds.value).toBe(42);
  });

  for (const [code, variant, message] of [
    ['SESSION_ENDED', 'ended', 'انتهت الجلسة'],
    ['ACCOUNT_BLOCKED', 'blocked', 'الحساب موقوف'],
  ] as const) {
    it(`replaces the page with the ${variant} state on ${code}, with no retry`, async () => {
      stubFetch({ start: () => json(401, { error: { code, retryable: false } }) });
      vi.stubGlobal('XMLHttpRequest', FakeXHR);
      const mounted = mountUpload();
      wrapper = mounted.wrapper;
      const { upload, observed } = mounted;

      await upload.select(pdfFile());

      expect(upload.state.value).toBe('ended');
      expect(upload.ended.value).toBe(variant);
      expect(upload.errorCode.value).toBeNull();
      expect(observed.focus).toContain('ended');
      expect(observed.announcements.some((entry) => entry.channel === 'assertive' && entry.text === message)).toBe(true);
    });
  }

  it('answers a part write that fails before any response as the transfer failure', async () => {
    stubFetch();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload } = mounted;

    const pending = upload.select(pdfFile());
    const [xhr] = await waitForXhr();
    xhr!.listeners['error']?.();
    await pending;

    expect(upload.state.value).toBe('error');
    expect(upload.errorCode.value).toBeNull();
    expect(upload.heldFile.value).not.toBeNull();
  });

  it('answers a non-2xx part write as the transfer failure', async () => {
    stubFetch();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload } = mounted;

    const pending = upload.select(pdfFile());
    const [xhr] = await waitForXhr();
    xhr!.respond(500, null);
    await pending;

    expect(upload.state.value).toBe('error');
    expect(upload.errorCode.value).toBeNull();
  });
});

describe('the retry', () => {
  it('re-sends the held file without a new selection', async () => {
    let startCalls = 0;
    stubFetch({
      start: () => {
        startCalls += 1;
        if (startCalls === 1) return json(503, { error: { code: 'UPLOAD_STORAGE_UNAVAILABLE', retryable: true } });
        return json(201, {
          uploadId: 'u2',
          partSize: 8 * 1024 * 1024,
          expiresAt: new Date(Date.now() + 900_000).toISOString(),
          parts: [
            { partNumber: 1, url: 'http://127.0.0.1:8333/wafar/intake/u2/original?partNumber=1', byteSize: 2048 },
          ],
        });
      },
    });
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload } = mounted;
    const file = pdfFile();

    await upload.select(file);
    expect(upload.state.value).toBe('error');
    expect(upload.heldFile.value).toBe(file);

    const pending = upload.retry();
    const [xhr] = await waitForXhr();
    xhr!.respond(200, '"etag-2"');
    await pending;

    expect(startCalls).toBe(2);
    expect(upload.state.value).toBe('success');
    const starts = calls.filter((call) => call.url.endsWith('/api/v1/uploads') && call.method === 'POST');
    expect(starts[1]?.body).toEqual({ fileName: 'كتالوج.pdf', byteSize: 2048 });
  });

  it('returns to choosing when no file is held', async () => {
    stubFetch();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload, observed } = mounted;

    await upload.retry();

    expect(upload.state.value).toBe('choosing');
    expect(observed.focus).toContain('control');
  });
});

describe('the cancel and the departure', () => {
  it('cancel stops the in-flight part, aborts the upload, and returns to choosing', async () => {
    stubFetch();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload, observed } = mounted;

    const pending = upload.select(pdfFile());
    const [xhr] = await waitForXhr();
    upload.cancel();
    await pending;
    await flush();

    expect(xhr!.aborted).toBe(true);
    const abort = calls.find((call) => call.method === 'DELETE');
    expect(abort?.url).toContain('/api/v1/uploads/u1');
    expect(upload.state.value).toBe('choosing');
    expect(upload.heldFile.value).toBeNull();
    expect(observed.announcements.some((entry) => entry.text === 'تم إلغاء الرفع. لم يتم حفظ الملف.')).toBe(true);
  });

  it('pagehide during the transfer sends the bodyless keepalive DELETE', async () => {
    stubFetch();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload } = mounted;

    const pending = upload.select(pdfFile());
    await waitForXhr();
    window.dispatchEvent(new Event('pagehide'));
    await pending;
    await flush();

    const abort = calls.find((call) => call.method === 'DELETE');
    expect(abort?.url).toContain('/api/v1/uploads/u1');
    expect(abort?.keepalive).toBe(true);
    expect(abort?.body).toBeNull();
    expect(abort?.csrf).toBe('held');
  });

  it('pagehide after the transfer completed sends no beacon', async () => {
    stubFetch();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload } = mounted;

    const pending = upload.select(pdfFile());
    const [xhr] = await waitForXhr();
    xhr!.respond(200, '"etag-1"');
    await pending;
    expect(upload.state.value).toBe('success');

    window.dispatchEvent(new Event('pagehide'));
    await flush();
    expect(calls.some((call) => call.method === 'DELETE')).toBe(false);
  });
});

describe('the session watcher’s answer', () => {
  it('markEnded during the transfer aborts the part and replaces the state', async () => {
    stubFetch();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload, observed } = mounted;

    const pending = upload.select(pdfFile());
    const [xhr] = await waitForXhr();
    upload.markEnded('blocked');
    await pending;

    expect(xhr!.aborted).toBe(true);
    expect(upload.state.value).toBe('ended');
    expect(upload.ended.value).toBe('blocked');
    expect(upload.errorCode.value).toBeNull();
    expect(observed.announcements.some((entry) => entry.channel === 'assertive' && entry.text === 'الحساب موقوف')).toBe(true);
  });

  it('a completed transfer is carried through the session’s end', async () => {
    stubFetch();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload } = mounted;

    const pending = upload.select(pdfFile());
    const [xhr] = await waitForXhr();
    xhr!.respond(200, '"etag-1"');
    await pending;
    expect(upload.state.value).toBe('success');

    upload.markEnded('ended');

    expect(upload.state.value).toBe('success');
    expect(upload.catalog.value).not.toBeNull();
  });

  it('a second markEnded while ended only swaps the variant', async () => {
    stubFetch();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload } = mounted;

    upload.markEnded('ended');
    expect(upload.state.value).toBe('ended');
    upload.markEnded('blocked');
    expect(upload.ended.value).toBe('blocked');
  });
});

describe('the timed bounds', () => {
  it('a part write with no progress for the stall bound reads as the transfer failure', async () => {
    vi.useFakeTimers();
    stubFetch();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload } = mounted;

    const pending = upload.select(pdfFile());
    await vi.advanceTimersByTimeAsync(0);
    expect(FakeXHR.instances).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(stallBoundMs);
    await pending;

    expect(upload.state.value).toBe('error');
    expect(upload.errorCode.value).toBeNull();
    expect(FakeXHR.instances[0]!.aborted).toBe(true);
    expect(upload.heldFile.value).not.toBeNull();
  });

  it('progress re-arms the stall bound', async () => {
    vi.useFakeTimers();
    stubFetch();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload } = mounted;

    const pending = upload.select(pdfFile());
    await vi.advanceTimersByTimeAsync(0);
    const xhr = FakeXHR.instances[0]!;
    await vi.advanceTimersByTimeAsync(stallBoundMs - 1_000);
    xhr.progress(1024, 2048);
    await vi.advanceTimersByTimeAsync(stallBoundMs - 1_000);
    expect(upload.state.value).toBe('uploading');
    xhr.respond(200, '"etag-1"');
    await vi.advanceTimersByTimeAsync(0);
    await pending;
    expect(upload.state.value).toBe('success');
  });

  it('a completion that never answers ends at the two-minute bound as the transfer failure', async () => {
    vi.useFakeTimers();
    stubFetch({
      complete: (call) =>
        new Promise<Response>((_resolve, reject) => {
          // The bound's AbortController is the only way this request ends.
          call.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    });
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload } = mounted;

    const pending = upload.select(pdfFile());
    await vi.advanceTimersByTimeAsync(0);
    FakeXHR.instances[0]!.respond(200, '"etag-1"');
    await vi.advanceTimersByTimeAsync(0);
    expect(upload.state.value).toBe('screening');

    await vi.advanceTimersByTimeAsync(completionTimeoutMs);
    await pending;

    expect(upload.state.value).toBe('error');
    expect(upload.errorCode.value).toBeNull();
    expect(upload.heldFile.value).not.toBeNull();
  });
});

describe('the file-level refusal', () => {
  it('refuses an unsupported format before any request and holds no file', async () => {
    stubFetch();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload, observed } = mounted;
    const file = new File([new Uint8Array(10)], 'script.exe', {
      type: 'application/octet-stream',
    });

    await upload.select(file);

    expect(upload.state.value).toBe('error');
    expect(upload.errorCode.value).toBe('UPLOAD_UNSUPPORTED_FORMAT');
    expect(upload.heldFile.value).toBeNull();
    expect(upload.fileName.value).toBe('script.exe');
    expect(upload.byteSize.value).toBe(10);
    expect(FakeXHR.instances).toHaveLength(0);
    expect(calls.filter((call) => call.url.endsWith('/api/v1/uploads'))).toHaveLength(0);
    expect(observed.focus).toContain('error');
  });
});

describe('the format label', () => {
  for (const [name, label] of [
    ['كتالوج.xlsx', 'Excel'],
    ['كتالوج.docx', 'Word'],
    ['كتالوج.pdf', 'PDF'],
  ] as const) {
    it(`names ${name}'s format ${label}`, async () => {
      stubFetch();
      vi.stubGlobal('XMLHttpRequest', FakeXHR);
      const mounted = mountUpload();
      wrapper = mounted.wrapper;
      const { upload } = mounted;

      const pending = upload.select(new File([new Uint8Array(16)], name));
      expect(upload.formatName()).toBe(label);
      const [xhr] = await waitForXhr();
      xhr!.respond(200, '"etag-1"');
      await pending;
    });
  }
});

describe('the multi-file drop', () => {
  it('starts the first file alone and shows the notice once', async () => {
    stubFetch();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    const mounted = mountUpload();
    wrapper = mounted.wrapper;
    const { upload, observed } = mounted;

    upload.announceMultiFile([pdfFile(), pdfFile()]);
    const [xhr] = await waitForXhr();
    expect(upload.multiFileVisible.value).toBe(true);
    expect(FakeXHR.instances).toHaveLength(1);
    expect(observed.announcements.some((entry) => entry.text.includes('تم بدء الملف الأول'))).toBe(true);
    xhr!.respond(200, '"etag-1"');
    await flush();
    await flush();

    expect(upload.state.value).toBe('success');
    const starts = calls.filter((call) => call.url.endsWith('/api/v1/uploads') && call.method === 'POST');
    expect(starts).toHaveLength(1);
  });
});