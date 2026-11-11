// The two other mobile-number forms read every spelling FR-031 names as the
// same number and emit the typed value for the API to normalize (FR-031,
// AC-007; T306): sign-in and password recovery.
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { normalizePhone } from '@wafar/shared';
import SignInForm from '../../app/components/auth/SignInForm.vue';
import RecoveryForm from '../../app/components/auth/RecoveryForm.vue';

const spellings = [
  '+218912345678',
  '218912345678',
  '00218912345678',
  '0912345678',
  '٠٩١٢٣٤٥٦٧٨',
];

const INVALID_PHONE = 'أدخل رقم هاتف ليبي صحيحا يبدأ بـ +218.';

describe('the sign-in form', () => {
  it.each(spellings)(
    'reads %s as the same number and emits it unchanged',
    async (phone) => {
      const wrapper = mount(SignInForm, { props: { loading: false } });
      await wrapper.find('input[autocomplete="tel-national"]').setValue(phone);
      await wrapper.find('input[type="password"]').setValue('secret');
      await wrapper.find('form').trigger('submit');

      expect(wrapper.text()).not.toContain(INVALID_PHONE);
      const emitted = wrapper.emitted('submit');
      expect(emitted).toHaveLength(1);
      const payload = emitted?.[0]?.[0] as { phone: string };
      expect(normalizePhone(payload.phone)?.e164).toBe('+218912345678');
    },
  );
});

describe('the password-recovery form', () => {
  it.each(spellings)(
    'reads %s as the same number and emits it unchanged',
    async (phone) => {
      const wrapper = mount(RecoveryForm, { props: { loading: false } });
      await wrapper.find('input[autocomplete="tel-national"]').setValue(phone);
      await wrapper.find('form').trigger('submit');

      expect(wrapper.text()).not.toContain(INVALID_PHONE);
      const emitted = wrapper.emitted('submit');
      expect(emitted).toHaveLength(1);
      const payload = emitted?.[0]?.[0] as { phone: string };
      expect(normalizePhone(payload.phone)?.e164).toBe('+218912345678');
    },
  );
});
