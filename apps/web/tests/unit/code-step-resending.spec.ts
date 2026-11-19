// The resend control's own in-progress state: while a resend is in flight the
// resend button carries «يجري الإرسال…», and the submit control keeps its idle
// label rather than borrowing the verify label (FR-040, AC-043; T232).
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import CodeStep from '../../app/components/auth/CodeStep.vue';

const props = {
  collected: [],
  displayPhone: '+218 91 234 5678',
  remainingReRequests: 3,
};

describe('the code step’s resend state', () => {
  it('keeps the idle labels when neither request is in flight', () => {
    const wrapper = mount(CodeStep, { props: { ...props, loading: false } });
    expect(wrapper.find('.wf-code-step__submit').text()).toBe('تحقق');
    expect(wrapper.find('.wf-code-step__actions button').text()).toBe('إرسال رمز جديد');
  });

  it('shows the resend label without changing the verify label', () => {
    const wrapper = mount(CodeStep, {
      props: { ...props, loading: true, resending: true },
    });
    const resend = wrapper.find('.wf-code-step__actions button');
    expect(resend.text()).toBe('يجري الإرسال…');
    expect(resend.attributes('disabled')).toBeDefined();
    expect(wrapper.find('.wf-code-step__submit').text()).toBe('تحقق');
  });

  it('shows the verify label for a verification in flight', () => {
    const wrapper = mount(CodeStep, {
      props: { ...props, loading: true, resending: false },
    });
    expect(wrapper.find('.wf-code-step__submit').text()).toBe('يجري التحقق…');
    expect(wrapper.find('.wf-code-step__actions button').text()).toBe('إرسال رمز جديد');
  });

  it('states the spent bound inline beside the disabled resend control (T309)', () => {
    const wrapper = mount(CodeStep, { props: { ...props, remainingReRequests: 0 } });
    const resend = wrapper.find('.wf-code-step__actions button');
    expect(resend.attributes('disabled')).toBeDefined();
    const reason = wrapper.find('.wf-code-step__spent');
    expect(reason.exists()).toBe(true);
    expect(reason.text()).toBe(
      'انتهت محاولات إرسال رمز جديد. أدخل الرمز المرسل قبل انتهاء صلاحيته.',
    );
  });

  it('states no spent-bound reason while re-requests remain (T309)', () => {
    const wrapper = mount(CodeStep, { props: { ...props, remainingReRequests: 3 } });
    expect(wrapper.find('.wf-code-step__spent').exists()).toBe(false);
  });
});
