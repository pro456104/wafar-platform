// The wait surface: the attempt-bound refusal restates `retryAfterSeconds`
// through the shared duration surface with no page-side clock, and offers no
// retry for a cause a retry cannot change (FR-049, FR-061, AC-029; T078).
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import UploadError from '../../../app/components/upload/UploadError.vue';
import WfNumeral from '@wafar/ui/app/components/WfNumeral.vue';

const globals = { components: { WfNumeral } };

describe('the attempt-bound wait', () => {
  it('restates one second, two seconds, three to ten, and eleven to nine hundred', () => {
    for (const [seconds, expected] of [
      [1, 'ثانية واحدة'],
      [2, 'ثانيتين'],
      [5, '5 ثوان'],
      [60, '60 ثانية'],
      [900, '900 ثانية'],
    ] as const) {
      const wrapper = mount(UploadError, {
        global: globals,
        props: { code: 'UPLOAD_TOO_MANY_ATTEMPTS', retryAfterSeconds: seconds },
      });
      expect(wrapper.text()).toContain(expected);
    }
  });

  it('offers the same-file retry for the bound', () => {
    const wrapper = mount(UploadError, {
      global: globals,
      props: { code: 'UPLOAD_TOO_MANY_ATTEMPTS', retryAfterSeconds: 60 },
    });
    expect(wrapper.text()).toContain('إعادة المحاولة');
    expect(wrapper.text()).toContain('اختيار ملف آخر');
  });

  it('offers no retry for a cause a retry cannot change', () => {
    for (const code of [
      'UPLOAD_INFECTED',
      'UPLOAD_CORRUPT',
      'UPLOAD_CONTENT_MISMATCH',
      'UPLOAD_PASSWORD_PROTECTED',
      'UPLOAD_SANITIZATION_FAILED',
      'UPLOAD_EXPANSION_CAP',
      'UPLOAD_INCOMPLETE',
      'UPLOAD_INVALID_NAME',
      'UPLOAD_UNSUPPORTED_FORMAT',
      'UPLOAD_TOO_LARGE',
      'UPLOAD_EMPTY',
    ]) {
      const wrapper = mount(UploadError, { global: globals, props: { code } });
      expect(wrapper.text()).not.toContain('إعادة المحاولة');
      expect(wrapper.text()).toContain('اختيار ملف آخر');
    }
  });

  it('offers the retry for the three retryable server codes and R1’s INTERNAL_ERROR', () => {
    for (const code of [
      'UPLOAD_SCAN_UNAVAILABLE',
      'UPLOAD_STORAGE_UNAVAILABLE',
      'INTERNAL_ERROR',
    ]) {
      const wrapper = mount(UploadError, { global: globals, props: { code } });
      expect(wrapper.text()).toContain('إعادة المحاولة');
    }
  });

  it('offers no retry for R1’s three non-retryable rows', () => {
    for (const code of ['NOT_FOUND', 'CSRF_FAILED', 'PAYLOAD_TOO_LARGE']) {
      const wrapper = mount(UploadError, { global: globals, props: { code } });
      expect(wrapper.text()).not.toContain('إعادة المحاولة');
    }
  });
});
