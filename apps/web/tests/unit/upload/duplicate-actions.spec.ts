// The outcome's actions at a limit: «رفع آخر» and «اختيار ملف آخر» are withheld
// while the refreshed quota shows an exhausted limit, both return in place under
// both limits, and the duplicate's «ملفاتي» link stays shown (FR-006, FR-017,
// FR-044, AC-021, AC-045, AC-049; T067).
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import UploadDuplicate from '../../../app/components/upload/UploadDuplicate.vue';
import UploadSuccess from '../../../app/components/upload/UploadSuccess.vue';
import WfFileName from '@wafar/ui/app/components/WfFileName.vue';
import WfNumeral from '@wafar/ui/app/components/WfNumeral.vue';
import WfIcon from '@wafar/ui/app/components/WfIcon.vue';

const globals = {
  components: { WfFileName, WfNumeral, WfIcon },
  stubs: { NuxtLink: { template: '<a><slot /></a>' } },
};

const original = {
  id: 'parts-id',
  fileName: 'كتالوج.pdf',
  uploadedAt: '2026-10-02T08:14:00.000Z',
  status: 'failed' as const,
};

describe('the duplicate outcome’s actions', () => {
  it('withholds «رفع آخر» while a limit is exhausted but keeps «ملفاتي»', () => {
    const wrapper = mount(UploadDuplicate, {
      global: globals,
      props: { original, withheld: true },
    });
    expect(wrapper.text()).not.toContain('رفع آخر');
    expect(wrapper.text()).toContain('ملفاتي');
    expect(wrapper.text()).toContain('عرض القطع');
  });

  it('returns «رفع آخر» in place when a read lands under both limits', async () => {
    const wrapper = mount(UploadDuplicate, {
      global: globals,
      props: { original, withheld: true },
    });
    expect(wrapper.text()).not.toContain('رفع آخر');
    await wrapper.setProps({ withheld: false });
    expect(wrapper.text()).toContain('رفع آخر');
  });

  it('focuses its heading on mount', () => {
    const wrapper = mount(UploadDuplicate, { global: globals, props: { original } });
    expect(wrapper.find('#upload-duplicate-heading').attributes('tabindex')).toBe('-1');
  });

  it('links the parts route with the original’s identifier', () => {
    const wrapper = mount(UploadDuplicate, { global: globals, props: { original } });
    expect(wrapper.html()).toContain('/parts?file=parts-id');
  });
});

describe('the success outcome’s action', () => {
  it('withholds «رفع آخر» while a limit is exhausted', () => {
    const wrapper = mount(UploadSuccess, {
      global: globals,
      props: { fileName: 'a.pdf', withheld: true },
    });
    expect(wrapper.text()).not.toContain('رفع آخر');
    expect(wrapper.text()).toContain('الانتقال إلى ملفاتي');
  });

  it('returns it when the quota read lands under both limits', async () => {
    const wrapper = mount(UploadSuccess, {
      global: globals,
      props: { fileName: 'a.pdf', withheld: true },
    });
    await wrapper.setProps({ withheld: false });
    expect(wrapper.text()).toContain('رفع آخر');
  });

  it('emits upload-another from the action', async () => {
    const wrapper = mount(UploadSuccess, {
      global: globals,
      props: { fileName: 'a.pdf' },
    });
    await wrapper.find('.upload-success__again').trigger('click');
    expect(wrapper.emitted('upload-another')).toHaveLength(1);
  });
});
