// The limit refusal is the quota-exceeded state, not the error outcome: no
// selected file is retained, the control is withheld, the quota read is
// invalidated, and focus moves to the quota heading (FR-016, FR-017, AC-029,
// AC-033; T167).
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { useUpload } from '../../../app/composables/upload/useUpload';

type UploadComposable = ReturnType<typeof useUpload>;

interface Observed {
  outcomes: number;
  focus: string[];
  announcements: string[];
}

function mountUpload(): { upload: UploadComposable; observed: Observed } {
  const observed: Observed = { outcomes: 0, focus: [], announcements: [] };
  let upload!: UploadComposable;
  mount(
    defineComponent({
      setup() {
        upload = useUpload({
          onOutcome: () => {
            observed.outcomes += 1;
          },
          announce: (_channel, text) => observed.announcements.push(text),
          focus: (target) => {
            if (target !== null) observed.focus.push(target);
          },
        });
        return () => h('div');
      },
    }),
  );
  return { upload, observed };
}

function stubFetch(refusal: { code: string; retryable: boolean }): void {
  vi.stubGlobal(
    'fetch',
    async (input: string | URL): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.endsWith('/api/v1/auth/csrf')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ csrfToken: 'held', formStamp: 'stamp' }),
        } as unknown as Response;
      }
      return {
        ok: false,
        status: 409,
        json: async () => ({ error: refusal }),
      } as unknown as Response;
    },
  );
}

function pdfFile(): File {
  return new File([new Uint8Array(2048)], 'كتالوج.pdf', { type: 'application/pdf' });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('a limit refusal at the start', () => {
  for (const [code, limit] of [
    ['UPLOAD_MONTHLY_LIMIT', 'monthly'],
    ['UPLOAD_ACTIVE_LIMIT', 'active'],
  ] as const) {
    it(`answers ${limit} in the quota-exceeded state and keeps no file`, async () => {
      stubFetch({ code, retryable: false });
      const { upload, observed } = mountUpload();

      await upload.select(pdfFile());

      expect(upload.state.value).toBe('choosing');
      expect(upload.limitRefused.value).toBe(true);
      expect(upload.errorCode.value).toBeNull();
      expect(upload.heldFile.value).toBeNull();
      expect(upload.fileName.value).toBe('');
      expect(upload.duplicate.value).toBeNull();
      expect(upload.catalog.value).toBeNull();
      expect(observed.outcomes).toBe(1);
      expect(observed.focus).toContain('quota');
    });
  }

  it('returns the withholding to false when the page resets', async () => {
    stubFetch({ code: 'UPLOAD_MONTHLY_LIMIT', retryable: false });
    const { upload } = mountUpload();
    await upload.select(pdfFile());
    expect(upload.limitRefused.value).toBe(true);

    upload.reset();

    expect(upload.limitRefused.value).toBe(false);
    expect(upload.state.value).toBe('choosing');
  });
});
