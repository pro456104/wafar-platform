// The page's state machine and 8 MB part transport: one XMLHttpRequest per
// part, a stall bound, the bodyless departure beacon, and the same-file retry
// (FR-006, FR-048-FR-050, FR-061; contracts/intake-api.md §1.1, §2.4).
import { onBeforeUnmount, ref, shallowRef } from 'vue';
import type { CatalogFormat, CompleteUploadResponse, RetainedDuplicate, StartUploadResponse } from '@wafar/shared';
import { useApi, type ApiRefusal } from '../auth/useApi';
import { checkFile, formatLabel } from './file-checks.ts';

export type UploadState =
  | 'choosing'
  | 'selected'
  | 'uploading'
  | 'screening'
  | 'success'
  | 'duplicate'
  | 'error'
  | 'ended';

export type FocusTarget =
  | 'card'
  | 'success'
  | 'duplicate'
  | 'error'
  | 'control'
  | 'quota'
  | 'ended'
  | null;

export interface UploadHandlers {
  /** The refreshed quota read after every outcome. */
  onOutcome: () => void;
  announce: (channel: 'polite' | 'assertive', text: string) => void;
  focus: (target: FocusTarget) => void;
}

export const partSize = 8 * 1024 * 1024;
export const stallBoundMs = 30_000;
export const completionTimeoutMs = 120_000;

export interface AcceptedCatalogView {
  id: string;
  fileName: string;
  byteSize: number;
  contentType: string;
  uploadedAt: string;
}

export function useUpload(handlers: UploadHandlers) {
  const api = useApi();

  const state = ref<UploadState>('choosing');
  const phase = ref<'transfer' | 'screening'>('transfer');
  const percent = ref(0);
  const heldFile = shallowRef<File | null>(null);
  const fileName = ref('');
  const byteSize = ref(0);
  const format = ref<CatalogFormat>('pdf');
  const catalog = ref<AcceptedCatalogView | null>(null);
  const duplicate = ref<RetainedDuplicate | null>(null);
  const errorCode = ref<string | null>(null);
  const ended = ref<'ended' | 'blocked' | null>(null);
  const retryAfterSeconds = ref<number | undefined>(undefined);
  const multiFileVisible = ref(false);
  // A limit refusal at the start or at acceptance is the quota-exceeded state,
  // not an outcome: the choosing control is withheld immediately while the
  // quota read is re-fetched (FR-016, FR-017, AC-029, AC-033).
  const limitRefused = ref(false);

  let uploadId: string | null = null;
  let partUrls: { partNumber: number; url: string; byteSize: number }[] = [];
  const inFlight = new Set<XMLHttpRequest>();
  let departureArmed = false;

  function formatName(): 'Excel' | 'Word' | 'PDF' {
    return formatLabel(format.value);
  }

  function reset(): void {
    state.value = 'choosing';
    phase.value = 'transfer';
    percent.value = 0;
    heldFile.value = null;
    fileName.value = '';
    byteSize.value = 0;
    catalog.value = null;
    duplicate.value = null;
    errorCode.value = null;
    ended.value = null;
    retryAfterSeconds.value = undefined;
    multiFileVisible.value = false;
    limitRefused.value = false;
    uploadId = null;
    partUrls = [];
    inFlight.clear();
    departureArmed = false;
    handlers.focus('control');
  }

  function fail(code: string | null, options: { retryAfterSeconds?: number } = {}): void {
    errorCode.value = code;
    retryAfterSeconds.value = options.retryAfterSeconds;
    state.value = 'error';
    handlers.focus('error');
    const message =
      code === null
        ? 'تعذر إكمال نقل الملف'
        : 'تعذر رفع الملف';
    handlers.announce('assertive', message);
  }

  function putPart(
    url: string,
    partNumber: number,
    body: Blob,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      inFlight.add(request);
      let stall = 0;

      const settle = (fn: () => void): void => {
        clearTimeout(stall);
        inFlight.delete(request);
        fn();
      };

      // The stall bound rejects before it aborts: an abort alone is the
      // merchant's cancel, and the two must not share an outcome (FR-061).
      const armStall = (): void => {
        clearTimeout(stall);
        stall = window.setTimeout(() => {
          settle(() => reject(new Error('stall')));
          request.abort();
        }, stallBoundMs);
      };
      armStall();

      request.open('PUT', url);
      request.setRequestHeader('content-type', 'application/octet-stream');
      request.upload.addEventListener('progress', (event) => {
        armStall();
        if (event.lengthComputable) {
          const partShare = (partNumber - 1) / Math.max(1, partUrls.length);
          const partProgress = event.loaded / event.total / Math.max(1, partUrls.length);
          percent.value = Math.min(100, Math.round((partShare + partProgress) * 100));
        }
      });
      request.addEventListener('load', () => {
        if (request.status >= 200 && request.status < 300) {
          settle(() => resolve(request.getResponseHeader('etag') ?? `"part-${partNumber}"`));
        } else {
          settle(() => reject(new Error(`part ${request.status}`)));
        }
      });
      request.addEventListener('error', () => settle(() => reject(new Error('transfer'))));
      request.addEventListener('timeout', () => settle(() => reject(new Error('transfer'))));
      request.addEventListener('abort', () => settle(() => reject(new Error('aborted'))));
      request.send(body);
    });
  }

  async function runTransfer(file: File): Promise<void> {
    state.value = 'selected';
    handlers.focus('card');
    handlers.announce('polite', `بدأ رفع ${file.name}`);

    let started: StartUploadResponse;
    try {
      const result = await api.post<StartUploadResponse>('/api/v1/uploads', {
        fileName: file.name,
        byteSize: file.size,
      });
      if (!result.ok) {
        applyRefusal(result.refusal);
        return;
      }
      started = result.data;
    } catch {
      fail(null);
      return;
    }

    uploadId = started.uploadId;
    partUrls = started.parts;
    state.value = 'uploading';
    phase.value = 'transfer';
    percent.value = 0;
    departureArmed = true;

    const etags: { partNumber: number; etag: string }[] = [];
    try {
      for (const part of started.parts) {
        const start = (part.partNumber - 1) * partSize;
        const blob = file.slice(start, start + part.byteSize);
        const etag = await putPart(part.url, part.partNumber, blob);
        etags.push({ partNumber: part.partNumber, etag });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'transfer';
      if (message === 'aborted') {
        // The merchant's cancel or the departure: the page returns to choosing.
        return;
      }
      fail(null);
      return;
    }

    departureArmed = false;
    state.value = 'screening';
    phase.value = 'screening';
    handlers.announce('polite', 'يجري فحص الملف');

    // The completion is bounded at two minutes: a complete request that never
    // answers ends at the bound as the page's own transfer failure, keeps the
    // held file, and never leaves the screening phase waiting (FR-049, AC-009).
    const completion = new AbortController();
    const completionTimer = window.setTimeout(
      () => completion.abort(),
      completionTimeoutMs,
    );
    try {
      const result = await api.post<CompleteUploadResponse>(
        `/api/v1/uploads/${encodeURIComponent(started.uploadId)}/complete`,
        { parts: etags },
        { signal: completion.signal },
      );
      if (!result.ok) {
        // A request that produced no response (a network failure or the bound)
        // is the transfer failure, not a server refusal.
        if (result.status === 0) {
          fail(null);
          return;
        }
        applyRefusal(result.refusal);
        return;
      }
      const body = result.data;
      if (body.outcome === 'accepted') {
        catalog.value = {
          id: body.catalog.id,
          fileName: body.catalog.fileName,
          byteSize: body.catalog.byteSize,
          contentType: body.catalog.contentType,
          uploadedAt: body.catalog.uploadedAt,
        };
        state.value = 'success';
        handlers.focus('success');
        handlers.announce(
          'polite',
          `تم حفظ ${body.catalog.fileName} في ملفاتي. تبدأ المعالجة تلقائيا.`,
        );
      } else {
        duplicate.value = body.original;
        state.value = 'duplicate';
        handlers.focus('duplicate');
        handlers.announce(
          'polite',
          `هذا الملف مطابق للملف ${body.original.fileName} الذي تم رفعه في ${body.original.uploadedAt.slice(0, 10)}.`,
        );
      }
      handlers.onOutcome();
    } catch {
      fail(null);
    } finally {
      clearTimeout(completionTimer);
    }
  }

  function applyRefusal(refusal: ApiRefusal): void {
    if (
      refusal.code === 'SESSION_ENDED' ||
      refusal.code === 'ACCOUNT_BLOCKED'
    ) {
      // The ended-session or blocked state replaces the page's content at once,
      // with no transfer error and no retry (FR-004, FR-049; AC-002, AC-010).
      ended.value = refusal.code === 'ACCOUNT_BLOCKED' ? 'blocked' : 'ended';
      state.value = 'ended';
      handlers.focus('ended');
      handlers.announce(
        'assertive',
        ended.value === 'blocked' ? 'الحساب موقوف' : 'انتهت الجلسة',
      );
      return;
    }
    if (
      refusal.code === 'UPLOAD_MONTHLY_LIMIT' ||
      refusal.code === 'UPLOAD_ACTIVE_LIMIT'
    ) {
      // The limit refusal is the quota-exceeded state rather than an error
      // outcome: no selected file is retained, the control is withheld, and the
      // quota read is re-fetched so the exhausted content and the recorded usage
      // appear (FR-016, FR-017, AC-029, AC-033).
      limitRefused.value = true;
      heldFile.value = null;
      fileName.value = '';
      byteSize.value = 0;
      catalog.value = null;
      duplicate.value = null;
      errorCode.value = null;
      retryAfterSeconds.value = undefined;
      state.value = 'choosing';
      handlers.focus('quota');
      handlers.onOutcome();
      return;
    }
    fail(refusal.code, {
      ...(refusal.retryAfterSeconds === undefined
        ? {}
        : { retryAfterSeconds: refusal.retryAfterSeconds }),
    });
  }

  async function select(file: File): Promise<void> {
    multiFileVisible.value = false;
    limitRefused.value = false;
    const checked = checkFile(file.name, file.size);
    if (!checked.ok) {
      heldFile.value = null;
      fileName.value = file.name;
      byteSize.value = file.size;
      fail(checked.code);
      return;
    }
    heldFile.value = file;
    fileName.value = file.name;
    byteSize.value = file.size;
    format.value = checked.format;
    catalog.value = null;
    duplicate.value = null;
    errorCode.value = null;
    await runTransfer(file);
  }

  async function retry(): Promise<void> {
    const file = heldFile.value;
    if (file === null) {
      reset();
      return;
    }
    errorCode.value = null;
    await runTransfer(file);
  }

  function cancel(): void {
    for (const request of inFlight) request.abort();
    inFlight.clear();
    if (uploadId !== null) {
      void sendAbort(uploadId);
    }
    handlers.announce('polite', 'تم إلغاء الرفع. لم يتم حفظ الملف.');
    reset();
  }

  /**
   * The session watcher's answer: an ended session or a blocked account
   * replaces the progress state at once, with no transfer error and no retry,
   * while a transfer that already completed is carried through (FR-004,
   * FR-050; AC-002, AC-010).
   */
  function markEnded(variant: 'ended' | 'blocked'): void {
    if (state.value === 'success' || state.value === 'duplicate') return;
    if (state.value === 'ended') {
      ended.value = variant;
      return;
    }
    for (const request of inFlight) request.abort();
    inFlight.clear();
    departureArmed = false;
    ended.value = variant;
    state.value = 'ended';
    handlers.focus('ended');
    handlers.announce(
      'assertive',
      variant === 'blocked' ? 'الحساب موقوف' : 'انتهت الجلسة',
    );
  }

  async function sendAbort(target: string): Promise<void> {
    const { heldCsrfToken } = await import('../auth/useApi');
    try {
      await fetch(`/api/v1/uploads/${encodeURIComponent(target)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        keepalive: true,
        headers: {
          'x-wafar-csrf': heldCsrfToken() ?? '',
        },
      });
      handlers.onOutcome();
    } catch {
      // A lost departure is not a product outcome: the backstop is structural.
    }
  }

  function onPageHide(): void {
    if (!departureArmed || uploadId === null) return;
    for (const request of inFlight) request.abort();
    void sendAbort(uploadId);
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', onPageHide);
  }
  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('pagehide', onPageHide);
    }
  });

  return {
    api,
    state,
    phase,
    percent,
    heldFile,
    fileName,
    byteSize,
    format,
    formatName,
    catalog,
    duplicate,
    errorCode,
    ended,
    retryAfterSeconds,
    multiFileVisible,
    limitRefused,
    select,
    retry,
    cancel,
    reset,
    markEnded,
    announceMultiFile(files: File[]): void {
      // The first file in the drop is started, and the notice is set after
      // that selection has cleared it, so the drop's notice stands while the
      // first file is in flight and is replaced by the next selection or
      // reset (contracts/ui-contracts.md §4.7).
      const first = files[0];
      if (first !== undefined) void select(first);
      multiFileVisible.value = true;
      handlers.announce('polite', 'تم بدء الملف الأول. يتم رفع ملف واحد في كل مرة، ولم تبدأ الملفات الأخرى.');
    },
  };
}
