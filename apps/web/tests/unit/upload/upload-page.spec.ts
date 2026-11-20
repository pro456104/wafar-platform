// The Upload Catalog page's own orchestration: the eleven presentations, the
// live regions, the focus targets, the session poll, and the ended-session tie
// (FR-001-FR-008, FR-048-FR-051; AC-002, AC-003, AC-010, AC-029). The two
// composables are mocked so every branch is reached directly; both have their
// own runtime suites.
import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sessionData: null as unknown,
  refetch: vi.fn(),
  quotaState: null as unknown,
  quota: null as unknown,
  exhausted: null as unknown,
  invalidate: vi.fn(),
  refresh: vi.fn(),
  uploadState: null as unknown,
  uploadPhase: null as unknown,
  uploadPercent: null as unknown,
  uploadFileName: null as unknown,
  uploadByteSize: null as unknown,
  uploadCatalog: null as unknown,
  uploadDuplicate: null as unknown,
  uploadErrorCode: null as unknown,
  uploadRetryAfter: null as unknown,
  uploadEnded: null as unknown,
  uploadMultiFile: null as unknown,
  uploadLimitRefused: null as unknown,
  formatName: vi.fn(() => 'PDF'),
  select: vi.fn(),
  announceMultiFile: vi.fn(),
  cancel: vi.fn(),
  retry: vi.fn(),
  reset: vi.fn(),
  markEnded: vi.fn(),
  uploadHandlers: null as null | {
    onOutcome: () => void;
    announce: (channel: 'polite' | 'assertive', text: string) => void;
    focus: (target: string | null) => void;
  },
  accountKey: '',
}));

vi.mock('../../../app/composables/auth/useSession', async () => {
  const { ref } = await import('vue');
  mocks.sessionData = ref({
    authenticated: true,
    user: { fullName: 'سالم' },
  });
  return {
    useSession: () => ({
      data: mocks.sessionData,
      refetch: mocks.refetch,
    }),
  };
});

vi.mock('../../../app/composables/upload/useQuota', async () => {
  const { ref } = await import('vue');
  mocks.quotaState = ref('ready');
  mocks.quota = ref({
    monthly: { used: 3, limit: 50 },
    active: { used: 1, limit: 300 },
  });
  mocks.exhausted = ref<string[]>([]);
  return {
    useQuota: (accountKey: string) => {
      mocks.accountKey = accountKey;
      return {
        state: mocks.quotaState,
        quota: mocks.quota,
        exhausted: mocks.exhausted,
        invalidate: mocks.invalidate,
        refresh: mocks.refresh,
      };
    },
  };
});

vi.mock('../../../app/composables/upload/useUpload', async () => {
  const { ref } = await import('vue');
  mocks.uploadState = ref('choosing');
  mocks.uploadPhase = ref('transfer');
  mocks.uploadPercent = ref(0);
  mocks.uploadFileName = ref('');
  mocks.uploadByteSize = ref(0);
  mocks.uploadCatalog = ref(null);
  mocks.uploadDuplicate = ref(null);
  mocks.uploadErrorCode = ref(null);
  mocks.uploadRetryAfter = ref(undefined);
  mocks.uploadEnded = ref(null);
  mocks.uploadMultiFile = ref(false);
  mocks.uploadLimitRefused = ref(false);
  return {
    useUpload: (handlers: NonNullable<typeof mocks.uploadHandlers>) => {
      mocks.uploadHandlers = handlers;
      return {
        state: mocks.uploadState,
        phase: mocks.uploadPhase,
        percent: mocks.uploadPercent,
        fileName: mocks.uploadFileName,
        byteSize: mocks.uploadByteSize,
        catalog: mocks.uploadCatalog,
        duplicate: mocks.uploadDuplicate,
        errorCode: mocks.uploadErrorCode,
        retryAfterSeconds: mocks.uploadRetryAfter,
        ended: mocks.uploadEnded,
        multiFileVisible: mocks.uploadMultiFile,
        limitRefused: mocks.uploadLimitRefused,
        formatName: mocks.formatName,
        select: mocks.select,
        announceMultiFile: mocks.announceMultiFile,
        cancel: mocks.cancel,
        retry: mocks.retry,
        reset: mocks.reset,
        markEnded: mocks.markEnded,
      };
    },
  };
});

vi.stubGlobal('definePageMeta', vi.fn());
const UploadPage = (await import('../../../app/pages/upload.vue')).default;

const stubs = {
  WfEndedSession: {
    props: ['variant', 'signInPath'],
    template:
      '<div class="ended-stub"><h2 class="wf-ended-session__heading" tabindex="-1">{{ variant }}</h2></div>',
  },
  WfQuotaBlock: {
    props: ['state', 'monthly', 'active', 'exhausted', 'numbersHidden'],
    template: '<section id="wf-quota-heading" tabindex="-1" />',
  },
  WfUploadControl: {
    emits: ['select', 'multi-file'],
    template: '<div><button class="select">اختيار</button></div>',
  },
  UploadNotice: { props: ['visible'], template: '<div class="notice" />' },
  WfSelectedFile: {
    props: ['name', 'byteSize', 'format'],
    template: '<div id="wf-selected-file-heading" tabindex="-1" />',
  },
  WfUploadProgress: {
    props: ['phase', 'percent'],
    emits: ['cancel'],
    template: '<div><button class="cancel">إلغاء</button></div>',
  },
  UploadDuplicate: {
    props: ['original', 'withheld'],
    emits: ['upload-another'],
    template: '<div id="upload-duplicate-heading" tabindex="-1" />',
  },
  UploadSuccess: {
    props: ['fileName', 'withheld'],
    emits: ['upload-another'],
    template: '<div id="upload-success-heading" tabindex="-1" />',
  },
  UploadError: {
    props: ['code', 'retryAfterSeconds', 'withheld'],
    emits: ['retry', 'choose-another'],
    template: '<div id="upload-error-heading" tabindex="-1" />',
  },
};

function mountPage() {
  return mount(UploadPage as never, { global: { stubs }, attachTo: document.body });
}

function refs() {
  return {
    session: mocks.sessionData as { value: unknown },
    quotaState: mocks.quotaState as { value: string },
    exhausted: mocks.exhausted as { value: string[] },
    uploadState: mocks.uploadState as { value: string },
    ended: mocks.uploadEnded as { value: string | null },
    limitRefused: mocks.uploadLimitRefused as { value: boolean },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  const state = refs();
  state.session.value = { authenticated: true, user: { fullName: 'سالم' } };
  state.quotaState.value = 'ready';
  state.exhausted.value = [];
  state.uploadState.value = 'choosing';
  state.ended.value = null;
  state.limitRefused.value = false;
  (mocks.uploadPhase as { value: string }).value = 'transfer';
  (mocks.uploadPercent as { value: number }).value = 0;
  (mocks.uploadFileName as { value: string }).value = '';
  (mocks.uploadByteSize as { value: number }).value = 0;
  (mocks.uploadCatalog as { value: unknown }).value = null;
  (mocks.uploadDuplicate as { value: unknown }).value = null;
  (mocks.uploadErrorCode as { value: string | null }).value = null;
  (mocks.uploadRetryAfter as { value: number | undefined }).value = undefined;
  (mocks.uploadMultiFile as { value: boolean }).value = false;
  document.body.innerHTML = '';
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('the choosing presentation', () => {
  it('renders the header, the control, and the quota block under the account key', () => {
    const wrapper = mountPage();

    expect(wrapper.find('h1').text()).toBe('رفع كتالوج');
    expect(wrapper.find('[data-upload-control] button').exists()).toBe(true);
    expect(wrapper.find('#wf-quota-heading').exists()).toBe(true);
    expect(wrapper.find('.upload-page__format-line').exists()).toBe(true);
    expect(mocks.accountKey).toBe('سالم');

    wrapper.unmount();
  });

  it('passes the quota readings and the refresh handler to the block', () => {
    const wrapper = mountPage();
    const block = wrapper.findComponent(stubs.WfQuotaBlock);

    expect(block.props('state')).toBe('ready');
    expect(block.props('monthly')).toEqual({ used: 3, limit: 50 });
    expect(block.props('active')).toEqual({ used: 1, limit: 300 });
    expect(block.props('exhausted')).toEqual([]);
    expect(block.props('numbersHidden')).toBe(false);

    block.vm.$emit('refresh');
    expect(mocks.refresh).toHaveBeenCalledTimes(1);

    wrapper.unmount();
  });

  it('hides the numbers when the read failed after a prior success', async () => {
    refs().quotaState.value = 'failed';
    const wrapper = mountPage();
    await nextTick();

    expect(wrapper.findComponent(stubs.WfQuotaBlock).props('numbersHidden')).toBe(true);

    wrapper.unmount();
  });

  it('withholds the control when the quota is exhausted or the limit was refused', async () => {
    const wrapper = mountPage();

    refs().exhausted.value = ['monthly'];
    await nextTick();
    expect(wrapper.find('[data-upload-control]').exists()).toBe(false);

    refs().exhausted.value = [];
    refs().limitRefused.value = true;
    await nextTick();
    expect(wrapper.find('[data-upload-control]').exists()).toBe(false);

    refs().limitRefused.value = false;
    refs().uploadState.value = 'selected';
    await nextTick();
    expect(wrapper.find('[data-upload-control]').exists()).toBe(false);

    wrapper.unmount();
  });

  it('forwards the control events to the machine', async () => {
    const wrapper = mountPage();
    const control = wrapper.findComponent(stubs.WfUploadControl);

    control.vm.$emit('select');
    control.vm.$emit('multi-file');

    expect(mocks.select).toHaveBeenCalledTimes(1);
    expect(mocks.announceMultiFile).toHaveBeenCalledTimes(1);

    wrapper.unmount();
  });

  it('shows the multi-file notice only while the machine says so', async () => {
    const wrapper = mountPage();
    expect(wrapper.findComponent(stubs.UploadNotice).props('visible')).toBe(false);

    (mocks.uploadMultiFile as { value: boolean }).value = true;
    await nextTick();
    expect(wrapper.findComponent(stubs.UploadNotice).props('visible')).toBe(true);

    wrapper.unmount();
  });

  it('invalidates the quota after every outcome', () => {
    const wrapper = mountPage();

    mocks.uploadHandlers?.onOutcome();

    expect(mocks.invalidate).toHaveBeenCalledTimes(1);

    wrapper.unmount();
  });
});

describe('the live regions', () => {
  it('writes the polite announcement after clearing the region', async () => {
    const wrapper = mountPage();
    const region = wrapper.find('[aria-live="polite"]');

    mocks.uploadHandlers?.announce('polite', 'تم اختيار الملف');
    expect(region.text()).toBe('');

    await flushPromises();
    expect(region.text()).toBe('تم اختيار الملف');
    expect(wrapper.find('[aria-live="assertive"]').text()).toBe('');

    wrapper.unmount();
  });

  it('writes the assertive announcement on the other region', async () => {
    const wrapper = mountPage();

    mocks.uploadHandlers?.announce('assertive', 'تعذر رفع الملف');
    await flushPromises();

    expect(wrapper.find('[aria-live="assertive"]').text()).toBe('تعذر رفع الملف');
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('');

    wrapper.unmount();
  });

  it('announces a newly exhausted quota once', async () => {
    const wrapper = mountPage();

    refs().exhausted.value = ['monthly'];
    await nextTick();
    expect(wrapper.find('[aria-live="assertive"]').text()).toBe('بلغت حد الرفع.');

    refs().exhausted.value = ['monthly', 'active'];
    await nextTick();
    expect(wrapper.find('[aria-live="assertive"]').text()).toBe('بلغت حد الرفع.');

    wrapper.unmount();
  });
});

describe('the focus targets', () => {
  it.each([
    ['control', '[data-upload-control] button'],
    ['card', '#wf-selected-file-heading'],
    ['success', '#upload-success-heading'],
    ['duplicate', '#upload-duplicate-heading'],
    ['quota', '#wf-quota-heading'],
    ['error', '#upload-error-heading'],
  ] as const)('moves focus to %s', async (target, selector) => {
    const state = refs();
    if (target === 'card') state.uploadState.value = 'selected';
    if (target === 'success') state.uploadState.value = 'success';
    if (target === 'duplicate') {
      state.uploadState.value = 'duplicate';
      (mocks.uploadDuplicate as { value: unknown }).value = {
        id: 'dup-1',
        fileName: 'ملف.pdf',
        byteSize: 10,
        uploadedAt: '2026-11-19T00:00:00.000Z',
      };
    }
    if (target === 'error') state.uploadState.value = 'error';
    if (target === 'success') {
      (mocks.uploadCatalog as { value: unknown }).value = {
        id: 'cat-1',
        fileName: 'ملف.pdf',
        byteSize: 10,
        contentType: 'application/pdf',
        uploadedAt: '2026-11-19T00:00:00.000Z',
      };
    }
    const wrapper = mountPage();
    await nextTick();

    mocks.uploadHandlers?.focus(target);
    await flushPromises();

    expect(document.activeElement).toBe(document.querySelector(selector));

    wrapper.unmount();
  });

  it('moves focus to the ended heading', async () => {
    refs().ended.value = 'ended';
    const wrapper = mountPage();
    await nextTick();

    mocks.uploadHandlers?.focus('ended');
    await flushPromises();

    expect(document.activeElement).toBe(
      document.querySelector('.wf-ended-session__heading'),
    );

    wrapper.unmount();
  });

  it('leaves focus alone for the null target', async () => {
    const wrapper = mountPage();
    const before = document.activeElement;

    mocks.uploadHandlers?.focus(null);
    await flushPromises();

    expect(document.activeElement).toBe(before);

    wrapper.unmount();
  });
});

describe('the session tie', () => {
  it('marks the machine ended when the resource reports an ended session', async () => {
    const wrapper = mountPage();

    refs().session.value = { authenticated: false, ended: 'SESSION_ENDED' };
    await nextTick();

    expect(mocks.markEnded).toHaveBeenCalledWith('ended');

    refs().ended.value = 'ended';
    await nextTick();
    expect(wrapper.find('.ended-stub').exists()).toBe(true);
    expect(wrapper.find('h1').exists()).toBe(false);

    wrapper.unmount();
  });

  it('marks the machine blocked when the account is blocked', async () => {
    const wrapper = mountPage();

    refs().session.value = { authenticated: false, ended: 'ACCOUNT_BLOCKED' };
    await nextTick();

    expect(mocks.markEnded).toHaveBeenCalledWith('blocked');

    wrapper.unmount();
  });

  it('ignores an unauthenticated session with no reason', async () => {
    const wrapper = mountPage();

    refs().session.value = { authenticated: false };
    await nextTick();

    expect(mocks.markEnded).not.toHaveBeenCalled();
    expect(wrapper.find('.ended-stub').exists()).toBe(false);

    wrapper.unmount();
  });

  it('re-reads the session every 15 seconds while visible and stops on unmount', async () => {
    vi.useFakeTimers();
    const wrapper = mountPage();

    expect(mocks.refetch).not.toHaveBeenCalled();
    vi.advanceTimersByTime(14_999);
    expect(mocks.refetch).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(mocks.refetch).toHaveBeenCalledTimes(1);

    wrapper.unmount();
    vi.advanceTimersByTime(30_000);
    expect(mocks.refetch).toHaveBeenCalledTimes(1);
  });
});

describe('the outcome presentations', () => {
  it('renders the selected card and the progress with the file facts', async () => {
    const state = refs();
    state.uploadState.value = 'selected';
    (mocks.uploadFileName as { value: string }).value = 'قطع.xlsx';
    (mocks.uploadByteSize as { value: number }).value = 4_096;
    const wrapper = mountPage();
    await nextTick();

    const card = wrapper.findComponent(stubs.WfSelectedFile);
    expect(card.props('name')).toBe('قطع.xlsx');
    expect(card.props('byteSize')).toBe(4_096);
    expect(card.props('format')).toBe('PDF');
    expect(mocks.formatName).toHaveBeenCalled();

    const progress = wrapper.findComponent(stubs.WfUploadProgress);
    expect(progress.props('phase')).toBe('transfer');
    expect(progress.props('percent')).toBe(0);

    wrapper.unmount();
  });

  it('shows the transfer then the screening phase and forwards cancel', async () => {
    const state = refs();
    state.uploadState.value = 'uploading';
    (mocks.uploadPhase as { value: string }).value = 'transfer';
    (mocks.uploadPercent as { value: number }).value = 42;
    const wrapper = mountPage();
    await nextTick();

    let progress = wrapper.findComponent(stubs.WfUploadProgress);
    expect(progress.props('phase')).toBe('transfer');
    expect(progress.props('percent')).toBe(42);

    (mocks.uploadPhase as { value: string }).value = 'screening';
    await nextTick();
    progress = wrapper.findComponent(stubs.WfUploadProgress);
    expect(progress.props('phase')).toBe('screening');

    progress.vm.$emit('cancel');
    expect(mocks.cancel).toHaveBeenCalledTimes(1);

    wrapper.unmount();
  });

  it('renders the duplicate with the original file and the withheld flag', async () => {
    const state = refs();
    state.uploadState.value = 'duplicate';
    state.exhausted.value = ['monthly'];
    const original = {
      id: 'dup-1',
      fileName: 'ملف.pdf',
      byteSize: 10,
      uploadedAt: '2026-11-19T00:00:00.000Z',
    };
    (mocks.uploadDuplicate as { value: unknown }).value = original;
    const wrapper = mountPage();
    await nextTick();

    const duplicate = wrapper.findComponent(stubs.UploadDuplicate);
    expect(duplicate.props('original')).toEqual(original);
    expect(duplicate.props('withheld')).toBe(true);

    duplicate.vm.$emit('upload-another');
    expect(mocks.reset).toHaveBeenCalledTimes(1);

    wrapper.unmount();
  });

  it('renders the success with the accepted file and resets on demand', async () => {
    const state = refs();
    state.uploadState.value = 'success';
    (mocks.uploadCatalog as { value: unknown }).value = {
      id: 'cat-1',
      fileName: 'قطع.docx',
      byteSize: 20,
      contentType: 'application/docx',
      uploadedAt: '2026-11-19T00:00:00.000Z',
    };
    const wrapper = mountPage();
    await nextTick();

    const success = wrapper.findComponent(stubs.UploadSuccess);
    expect(success.props('fileName')).toBe('قطع.docx');
    expect(success.props('withheld')).toBe(false);

    success.vm.$emit('upload-another');
    expect(mocks.reset).toHaveBeenCalledTimes(1);

    wrapper.unmount();
  });

  it('renders the error with its code and retry delay and forwards both actions', async () => {
    const state = refs();
    state.uploadState.value = 'error';
    (mocks.uploadErrorCode as { value: string | null }).value = 'RATE_LIMITED';
    (mocks.uploadRetryAfter as { value: number | undefined }).value = 30;
    const wrapper = mountPage();
    await nextTick();

    const error = wrapper.findComponent(stubs.UploadError);
    expect(error.props('code')).toBe('RATE_LIMITED');
    expect(error.props('retryAfterSeconds')).toBe(30);

    error.vm.$emit('retry');
    error.vm.$emit('choose-another');
    expect(mocks.retry).toHaveBeenCalledTimes(1);
    expect(mocks.reset).toHaveBeenCalledTimes(1);

    wrapper.unmount();
  });

  it('shows the ended panel instead of the page for an ended machine', async () => {
    refs().ended.value = 'blocked';
    const wrapper = mountPage();
    await nextTick();

    expect(wrapper.find('.ended-stub').exists()).toBe(true);
    expect(wrapper.text()).toContain('blocked');

    wrapper.unmount();
  });
});





