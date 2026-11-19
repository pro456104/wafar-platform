// The reload rule: the held file lives in the page's memory with nothing
// persisted, so a reload returns the page to its choosing state and the attempt
// counter is unchanged (FR-061, AC-050; T105).
import { readFileSync } from 'node:fs';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import UploadNotice from '../../../app/components/upload/UploadNotice.vue';

describe('the held file', () => {
  const source = readFileSync('apps/web/app/composables/upload/useUpload.ts', 'utf8');

  it('lives in the page’s memory with nothing persisted', () => {
    expect(source).toContain('shallowRef<File | null>(null)');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('indexedDB');
  });

  it('returns the page to its choosing state on a reset, requiring a new selection', () => {
    expect(source).toContain("state.value = 'choosing'");
    expect(source).toContain('heldFile.value = null');
  });

  it('keeps no page-side attempt clock: the wait is the response’s value', () => {
    expect(source).not.toContain('attemptWindowStart');
    expect(source).toContain('retryAfterSeconds');
  });
});

describe('the multi-file notice', () => {
  it('leaves the accessibility tree when it is no longer shown', () => {
    const wrapper = mount(UploadNotice, { props: { visible: true } });
    expect(wrapper.text()).toContain('تم بدء الملف الأول');
    // The notice is not a third live region: the page carries exactly two and
    // the polite region carries this message (contracts/ui-contracts.md §7 A7,
    // row 11; FR-020).
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
    expect(wrapper.find('[aria-live]').exists()).toBe(false);
  });

  it('renders nothing when replaced', async () => {
    const wrapper = mount(UploadNotice, { props: { visible: true } });
    await wrapper.setProps({ visible: false });
    expect(wrapper.text()).toBe('');
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
  });
});
