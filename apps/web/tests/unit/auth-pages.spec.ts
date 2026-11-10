// The three bare pages' orchestration: the resume tie, the step transitions,
// and every refusal branch the pages own (FR-034, FR-038, FR-040, FR-041;
// T280). The composables are mocked so each branch is reached directly; the
// step machine itself is the shipped one.
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  bootstrap: vi.fn(),
  post: vi.fn(),
  stamp: vi.fn(),
  resume: vi.fn(),
  remember: vi.fn(),
  forget: vi.fn(),
}));

vi.mock('../../app/composables/auth/useApi', async () => {
  const { ref } = await import('vue');
  return {
    useApi: () => ({
      loading: ref(false),
      bootstrap: mocks.bootstrap,
      post: mocks.post,
      stamp: mocks.stamp,
    }),
    heldCsrfToken: () => null,
  };
});

vi.mock('../../app/composables/auth/usePendingRequest', async () => {
  const { ref } = await import('vue');
  return {
    usePendingRequest: () => ({
      requestId: ref('req-1'),
      remember: mocks.remember,
      forget: mocks.forget,
      resume: mocks.resume,
    }),
    heldPendingRequestId: () => null,
  };
});

import RecoveryPage from '../../app/pages/auth/forgot-password.vue';
import SignInPage from '../../app/pages/auth/sign-in.vue';
import SignUpPage from '../../app/pages/auth/sign-up.vue';

const stubs = {
  NuxtLayout: { template: '<div><slot name="cross-links" /><slot /></div>' },
  NuxtLink: { template: '<a><slot /></a>' },
  MessageAlert: true,
  RecoveryForm: true,
  SignUpForm: true,
  SignInForm: true,
  CodeStep: true,
  NewPasswordStep: true,
};

function mountPage(component: unknown) {
  return mount(component as never, { global: { stubs } });
}

// The page instances expose their script-setup bindings on the component's
// public instance; the tests read and drive exactly the members they assert on,
// so the shape is declared rather than reached through `any`.
interface PageVm {
  message: string;
  status: string;
  codeMessage: string;
  passwordMessage: string;
  outcome: string;
  signedIn: boolean;
  displayPhone: string;
  formStamp: string;
  refusedField: string;
  remainingReRequests: number;
  newPassword: string;
  collected: Array<{ label: string }>;
  step: { step: { value: string } };
  onSubmit(payload: Record<string, string>): Promise<void>;
  onVerify(code: string): Promise<void>;
  onResend(): Promise<void>;
  onChangeNumber(): Promise<void>;
  onReset(): Promise<void>;
  onRequest(payload: Record<string, string>): Promise<void>;
}

function vmOf(wrapper: ReturnType<typeof mountPage>): PageVm {
  return wrapper.vm as unknown as PageVm;
}

const liveSignUp = {
  status: 'live',
  data: {
    requestId: 'req-1',
    purpose: 'sign_up',
    state: 'pending',
    phone: '+218912345678',
    codeExpiresAt: '2026-11-10T10:05:00.000Z',
    expiresAt: '2026-11-10T10:30:00.000Z',
    remainingReRequests: 3,
    payload: { fullName: 'سالم', city: 'طرابلس', shopName: 'محل' },
  },
};

const liveRecovery = {
  status: 'live',
  data: {
    requestId: 'req-1',
    purpose: 'recovery',
    state: 'pending',
    phone: '+218912345678',
    codeExpiresAt: '2026-11-10T10:05:00.000Z',
    expiresAt: '2026-11-10T10:30:00.000Z',
    remainingReRequests: 2,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.bootstrap.mockResolvedValue({ csrfToken: 'csrf', formStamp: 'stamp' });
  mocks.stamp.mockResolvedValue('stamp-2');
  mocks.resume.mockResolvedValue({ status: 'none' });
  mocks.post.mockResolvedValue({ ok: true, status: 202, data: {} });
});

describe('the sign-in page', () => {
  it('states the internal error when the bootstrap fails', async () => {
    mocks.bootstrap.mockRejectedValueOnce(new Error('down'));
    const wrapper = mountPage(SignInPage);
    await flushPromises();
    expect(vmOf(wrapper).message).toBe('حدث خطأ. أعد المحاولة.');
  });

  it('shows the uniform refusal and keeps the form', async () => {
    mocks.post.mockResolvedValueOnce({
      ok: false,
      status: 401,
      refusal: { code: 'AUTH_INVALID_CREDENTIALS' },
    });
    const wrapper = mountPage(SignInPage);
    await flushPromises();
    await vmOf(wrapper).onSubmit({ phone: '912345678', password: 'x' });
    expect(vmOf(wrapper).message).toBe('رقم الهاتف أو كلمة المرور غير صحيحة.');
    expect(vmOf(wrapper).signedIn).toBe(false);
  });

  it('moves to the signed-in state after a success', async () => {
    mocks.post.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { outcome: 'signed_in' },
    });
    const wrapper = mountPage(SignInPage);
    await flushPromises();
    await vmOf(wrapper).onSubmit({ phone: '912345678', password: 'x' });
    expect(vmOf(wrapper).signedIn).toBe(true);
  });
});

describe('the sign-up page', () => {
  it('enters the code step from a live resume with the carried values', async () => {
    mocks.resume.mockResolvedValueOnce(liveSignUp);
    const wrapper = mountPage(SignUpPage);
    await flushPromises();
    expect(vmOf(wrapper).step.step.value).toBe('code');
    expect(vmOf(wrapper).displayPhone).toBe('+218 91 234 5678');
    expect(vmOf(wrapper).collected.map((row: { label: string }) => row.label)).toEqual([
      'الاسم الكامل',
      'المدينة',
      'اسم المحل',
    ]);
  });

  it('enters the code step only through the resume read after a 202', async () => {
    mocks.post.mockResolvedValueOnce({
      ok: true,
      status: 202,
      data: { requestId: 'req-2', phone: '+218912345678' },
    });
    mocks.resume.mockResolvedValueOnce(liveSignUp);
    const wrapper = mountPage(SignUpPage);
    await flushPromises();
    await vmOf(wrapper).onSubmit({ fullName: 'سالم', phone: '912345678', city: 'طرابلس' });
    expect(mocks.remember).toHaveBeenCalledWith('req-2');
    expect(vmOf(wrapper).step.step.value).toBe('code');
  });

  it('stays on the form when the resume read is not live', async () => {
    mocks.post.mockResolvedValueOnce({
      ok: true,
      status: 202,
      data: { requestId: 'req-2', phone: '+218912345678' },
    });
    mocks.resume.mockResolvedValueOnce({ status: 'expired' });
    const wrapper = mountPage(SignUpPage);
    await flushPromises();
    await vmOf(wrapper).onSubmit({ fullName: 'سالم', phone: '912345678', city: 'طرابلس' });
    expect(vmOf(wrapper).step.step.value).toBe('form');
  });

  it('refreshes the stamp and marks the field on FORM_TOO_FAST', async () => {
    mocks.post.mockResolvedValueOnce({
      ok: false,
      status: 400,
      refusal: { code: 'FORM_TOO_FAST', field: 'formStamp' },
    });
    const wrapper = mountPage(SignUpPage);
    await flushPromises();
    await vmOf(wrapper).onSubmit({ fullName: 'سالم', phone: '912345678', city: 'طرابلس' });
    expect(mocks.stamp).toHaveBeenCalled();
    expect(vmOf(wrapper).formStamp).toBe('stamp-2');
    expect(vmOf(wrapper).refusedField).toBe('formStamp');
    expect(vmOf(wrapper).message).toBe('أرسلت النموذج بسرعة أكبر من المعتاد. أعد المحاولة.');
  });

  it('ends the request on OTP_REQUEST_ENDED', async () => {
    mocks.resume.mockResolvedValueOnce(liveSignUp);
    mocks.post.mockResolvedValueOnce({
      ok: false,
      status: 400,
      refusal: { code: 'OTP_REQUEST_ENDED' },
    });
    const wrapper = mountPage(SignUpPage);
    await flushPromises();
    await vmOf(wrapper).onVerify('123456');
    expect(vmOf(wrapper).step.step.value).toBe('ended_notice');
  });

  it('expires the step on OTP_EXPIRED when the resume read reports expired', async () => {
    mocks.resume.mockResolvedValueOnce(liveSignUp).mockResolvedValueOnce({ status: 'expired' });
    mocks.post.mockResolvedValueOnce({
      ok: false,
      status: 400,
      refusal: { code: 'OTP_EXPIRED' },
    });
    const wrapper = mountPage(SignUpPage);
    await flushPromises();
    await vmOf(wrapper).onVerify('123456');
    expect(vmOf(wrapper).step.step.value).toBe('expired_notice');
  });

  it('keeps the code step and states the refusal otherwise', async () => {
    mocks.resume.mockResolvedValueOnce(liveSignUp);
    mocks.post.mockResolvedValueOnce({
      ok: false,
      status: 400,
      refusal: { code: 'OTP_INCORRECT' },
    });
    const wrapper = mountPage(SignUpPage);
    await flushPromises();
    await vmOf(wrapper).onVerify('000000');
    expect(vmOf(wrapper).step.step.value).toBe('code');
    expect(vmOf(wrapper).codeMessage).toBe('الرمز غير صحيح.');
  });

  it('records the outcome and ends on a verified success', async () => {
    mocks.resume.mockResolvedValueOnce(liveSignUp);
    mocks.post.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { outcome: 'created' },
    });
    const wrapper = mountPage(SignUpPage);
    await flushPromises();
    await vmOf(wrapper).onVerify('123456');
    expect(vmOf(wrapper).outcome).toBe('created');
    expect(vmOf(wrapper).step.step.value).toBe('done');
    expect(mocks.forget).toHaveBeenCalled();
  });

  it('updates the re-request count on a resend', async () => {
    mocks.resume.mockResolvedValueOnce(liveSignUp);
    mocks.post.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { remainingReRequests: 1 },
    });
    const wrapper = mountPage(SignUpPage);
    await flushPromises();
    await vmOf(wrapper).onResend();
    expect(vmOf(wrapper).remainingReRequests).toBe(1);
    expect(vmOf(wrapper).status).toBe('أرسلنا رمزا جديدا. الرمز السابق لم يعد صالحا.');
  });

  it('expires the step on a resend refusal that reports the request gone', async () => {
    mocks.resume.mockResolvedValueOnce(liveSignUp);
    mocks.post.mockResolvedValueOnce({
      ok: false,
      status: 400,
      refusal: { code: 'OTP_EXPIRED' },
    });
    const wrapper = mountPage(SignUpPage);
    await flushPromises();
    await vmOf(wrapper).onResend();
    expect(vmOf(wrapper).step.step.value).toBe('expired_notice');
  });

  it('keeps the code step on another resend refusal', async () => {
    mocks.resume.mockResolvedValueOnce(liveSignUp);
    mocks.post.mockResolvedValueOnce({
      ok: false,
      status: 429,
      refusal: { code: 'OTP_RESEND_LIMIT' },
    });
    const wrapper = mountPage(SignUpPage);
    await flushPromises();
    await vmOf(wrapper).onResend();
    expect(vmOf(wrapper).codeMessage).toBe(
      'تجاوزت عدد طلبات الرمز المسموح بها. أعد المحاولة بعد قليل.',
    );
  });

  it('returns to the form and forgets the request on change-number', async () => {
    mocks.resume.mockResolvedValueOnce(liveSignUp);
    const wrapper = mountPage(SignUpPage);
    await flushPromises();
    await vmOf(wrapper).onChangeNumber();
    expect(mocks.forget).toHaveBeenCalled();
    expect(vmOf(wrapper).step.step.value).toBe('form');
  });
});

describe('the recovery page', () => {
  it('opens the done step from a live verified resume', async () => {
    mocks.resume.mockResolvedValueOnce({
      status: 'live',
      data: { ...liveRecovery.data, state: 'verified' },
    });
    const wrapper = mountPage(RecoveryPage);
    await flushPromises();
    expect(vmOf(wrapper).step.step.value).toBe('done');
    expect(vmOf(wrapper).outcome).toBe('verified');
  });

  it('opens the code step from a live pending resume', async () => {
    mocks.resume.mockResolvedValueOnce(liveRecovery);
    const wrapper = mountPage(RecoveryPage);
    await flushPromises();
    expect(vmOf(wrapper).step.step.value).toBe('code');
    expect(vmOf(wrapper).remainingReRequests).toBe(2);
  });

  it('states the internal error when the bootstrap fails', async () => {
    mocks.bootstrap.mockRejectedValueOnce(new Error('down'));
    const wrapper = mountPage(RecoveryPage);
    await flushPromises();
    expect(vmOf(wrapper).message).toBe('حدث خطأ. أعد المحاولة.');
  });

  it('states a refusal on the request without leaving the form', async () => {
    mocks.post.mockResolvedValueOnce({
      ok: false,
      status: 400,
      refusal: { code: 'INVALID_PHONE' },
    });
    const wrapper = mountPage(RecoveryPage);
    await flushPromises();
    await vmOf(wrapper).onRequest({ phone: '1' });
    expect(vmOf(wrapper).message).toBe('أدخل رقم هاتف ليبي صحيحا يبدأ بـ +218.');
  });

  it('enters the code step after a request whose resume read is live', async () => {
    mocks.post.mockResolvedValueOnce({
      ok: true,
      status: 202,
      data: { requestId: 'req-2', phone: '+218912345678', remainingReRequests: 3 },
    });
    mocks.resume.mockResolvedValueOnce(liveRecovery);
    const wrapper = mountPage(RecoveryPage);
    await flushPromises();
    await vmOf(wrapper).onRequest({ phone: '912345678' });
    expect(vmOf(wrapper).step.step.value).toBe('code');
  });

  it('moves to the done step on a verified success', async () => {
    mocks.resume.mockResolvedValueOnce(liveRecovery);
    mocks.post.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { outcome: 'verified' },
    });
    const wrapper = mountPage(RecoveryPage);
    await flushPromises();
    await vmOf(wrapper).onVerify('123456');
    expect(vmOf(wrapper).outcome).toBe('verified');
    expect(vmOf(wrapper).step.step.value).toBe('done');
  });

  it('records a reset outcome and forgets the request', async () => {
    mocks.resume.mockResolvedValueOnce(liveRecovery);
    mocks.post.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { outcome: 'reset' },
    });
    const wrapper = mountPage(RecoveryPage);
    await flushPromises();
    await vmOf(wrapper).onVerify('123456');
    expect(vmOf(wrapper).outcome).toBe('reset');
    expect(mocks.forget).toHaveBeenCalled();
  });

  it('ends the request on OTP_REQUEST_ENDED', async () => {
    mocks.resume.mockResolvedValueOnce(liveRecovery);
    mocks.post.mockResolvedValueOnce({
      ok: false,
      status: 400,
      refusal: { code: 'OTP_REQUEST_ENDED' },
    });
    const wrapper = mountPage(RecoveryPage);
    await flushPromises();
    await vmOf(wrapper).onVerify('123456');
    expect(vmOf(wrapper).step.step.value).toBe('ended_notice');
  });

  it('expires the step on OTP_EXPIRED when the resume read reports expired', async () => {
    mocks.resume.mockResolvedValueOnce(liveRecovery).mockResolvedValueOnce({ status: 'expired' });
    mocks.post.mockResolvedValueOnce({
      ok: false,
      status: 400,
      refusal: { code: 'OTP_EXPIRED' },
    });
    const wrapper = mountPage(RecoveryPage);
    await flushPromises();
    await vmOf(wrapper).onVerify('123456');
    expect(vmOf(wrapper).step.step.value).toBe('expired_notice');
  });

  it('keeps the code step on another verify refusal', async () => {
    mocks.resume.mockResolvedValueOnce(liveRecovery);
    mocks.post.mockResolvedValueOnce({
      ok: false,
      status: 400,
      refusal: { code: 'OTP_INCORRECT' },
    });
    const wrapper = mountPage(RecoveryPage);
    await flushPromises();
    await vmOf(wrapper).onVerify('000000');
    expect(vmOf(wrapper).codeMessage).toBe('الرمز غير صحيح.');
  });

  it('updates the count on a resend and clears the message', async () => {
    mocks.resume.mockResolvedValueOnce(liveRecovery);
    mocks.post.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { remainingReRequests: 1 },
    });
    const wrapper = mountPage(RecoveryPage);
    await flushPromises();
    await vmOf(wrapper).onResend();
    expect(vmOf(wrapper).remainingReRequests).toBe(1);
    expect(vmOf(wrapper).status).toBe('أرسلنا رمزا جديدا. الرمز السابق لم يعد صالحا.');
  });

  it('expires the step on a resend refusal that reports the request gone', async () => {
    mocks.resume.mockResolvedValueOnce(liveRecovery);
    mocks.post.mockResolvedValueOnce({
      ok: false,
      status: 400,
      refusal: { code: 'OTP_REQUEST_ENDED' },
    });
    const wrapper = mountPage(RecoveryPage);
    await flushPromises();
    await vmOf(wrapper).onResend();
    expect(vmOf(wrapper).step.step.value).toBe('expired_notice');
  });

  it('keeps the code step on another resend refusal', async () => {
    mocks.resume.mockResolvedValueOnce(liveRecovery);
    mocks.post.mockResolvedValueOnce({
      ok: false,
      status: 429,
      refusal: { code: 'OTP_RESEND_LIMIT' },
    });
    const wrapper = mountPage(RecoveryPage);
    await flushPromises();
    await vmOf(wrapper).onResend();
    expect(vmOf(wrapper).codeMessage).toBe(
      'تجاوزت عدد طلبات الرمز المسموح بها. أعد المحاولة بعد قليل.',
    );
  });

  it('records the reset outcome from the new-password step', async () => {
    mocks.resume.mockResolvedValueOnce(liveRecovery);
    mocks.post.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { outcome: 'reset_blocked' },
    });
    const wrapper = mountPage(RecoveryPage);
    await flushPromises();
    vmOf(wrapper).newPassword = 'new-password-value';
    await vmOf(wrapper).onReset();
    expect(vmOf(wrapper).outcome).toBe('reset_blocked');
    expect(vmOf(wrapper).newPassword).toBe('');
  });

  it('expires the step on RECOVERY_EXPIRED and clears the plaintext', async () => {
    mocks.resume.mockResolvedValueOnce(liveRecovery);
    mocks.post.mockResolvedValueOnce({
      ok: false,
      status: 400,
      refusal: { code: 'RECOVERY_EXPIRED' },
    });
    const wrapper = mountPage(RecoveryPage);
    await flushPromises();
    vmOf(wrapper).newPassword = 'new-password-value';
    await vmOf(wrapper).onReset();
    expect(vmOf(wrapper).step.step.value).toBe('expired_notice');
    expect(vmOf(wrapper).newPassword).toBe('');
  });

  it('keeps the new-password step on another refusal and clears the plaintext', async () => {
    mocks.resume.mockResolvedValueOnce(liveRecovery);
    mocks.post.mockResolvedValueOnce({
      ok: false,
      status: 400,
      refusal: { code: 'PASSWORD_TOO_SHORT' },
    });
    const wrapper = mountPage(RecoveryPage);
    await flushPromises();
    vmOf(wrapper).newPassword = 'short';
    await vmOf(wrapper).onReset();
    expect(vmOf(wrapper).newPassword).toBe('');
    expect(vmOf(wrapper).passwordMessage).toContain('كلمة المرور أقصر من');
  });

  it('returns to the form and forgets the request on change-number', async () => {
    mocks.resume.mockResolvedValueOnce(liveRecovery);
    const wrapper = mountPage(RecoveryPage);
    await flushPromises();
    await vmOf(wrapper).onChangeNumber();
    expect(mocks.forget).toHaveBeenCalled();
    expect(vmOf(wrapper).step.step.value).toBe('form');
  });
});
