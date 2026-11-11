// The sign-up form's own value rule: the mobile field reads every spelling
// FR-031 names — a country code typed once, a leading national zero, a bare
// national number, and Arabic-Indic digits — as the same number, and emits the
// typed value for the API to normalize (FR-031, AC-007; T301, T306).
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { normalizePhone } from '@wafar/shared';
import SignUpForm from '../../app/components/auth/SignUpForm.vue';

const spellings = [
  '+218912345678',
  '218912345678',
  '00218912345678',
  '0912345678',
  '٠٩١٢٣٤٥٦٧٨',
];

describe('the sign-up form', () => {
  it.each(spellings)(
    'reads %s as the same number and emits it unchanged',
    async (phone) => {
      const wrapper = mount(SignUpForm, {
        props: {
          formStamp: 'stamp',
          loading: false,
          initial: {
            fullName: 'سالم',
            phone,
            city: 'طرابلس',
          },
        },
      });

      await wrapper
        .find('input[type="password"]')
        .setValue('correct horse battery staple');
      await wrapper.find('form').trigger('submit');

      expect(wrapper.text()).not.toContain(
        'أدخل رقم هاتف ليبي صحيحا يبدأ بـ +218.',
      );
      const emitted = wrapper.emitted('submit');
      expect(emitted).toHaveLength(1);
      const payload = emitted?.[0]?.[0] as { phone: string };
      expect(normalizePhone(payload.phone)?.e164).toBe('+218912345678');
    },
  );
});
