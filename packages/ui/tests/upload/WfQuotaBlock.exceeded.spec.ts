// The quota-exceeded presentation's own spec: the exhausted content and «تحديث»
// only, the monthly-first copy, each limit's release path, the numbers hidden on
// a failed re-read, and no action of the page's inside the block (FR-015-FR-017,
// AC-012, AC-029, AC-030; T076).
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import WfQuotaBlock from '../../app/components/upload/WfQuotaBlock.vue';
import WfNumeral from '../../app/components/WfNumeral.vue';

const globals = { components: { WfNumeral } };

function mountBlock(overrides: Record<string, unknown> = {}) {
  return mount(WfQuotaBlock, {
    global: globals,
    props: {
      state: 'ready',
      monthly: { used: 50, limit: 50 },
      active: { used: 10, limit: 300 },
      exhausted: ['monthly'],
      ...overrides,
    },
  });
}

describe('the quota-exceeded presentation', () => {
  it('names the monthly limit first with its release path', () => {
    const wrapper = mountBlock();
    expect(wrapper.text()).toContain('بلغت حد الرفع الشهري');
    expect(wrapper.text()).toContain('يتجدد في أول الشهر الميلادي القادم');
  });

  it('names the active limit with its release path', () => {
    const wrapper = mountBlock({ exhausted: ['active'], active: { used: 300, limit: 300 } });
    expect(wrapper.text()).toContain('بلغت حد الملفات النشطة');
    expect(wrapper.text()).toContain('90 يوما');
  });

  it('carries «تحديث» and no error panel or «اختيار ملف آخر»', () => {
    const wrapper = mountBlock();
    expect(wrapper.text()).toContain('تحديث');
    expect(wrapper.text()).not.toContain('تعذر رفع الملف');
    expect(wrapper.text()).not.toContain('اختيار ملف آخر');
  });

  it('hides the numbers when a failed re-read follows the exhausted state', () => {
    const wrapper = mountBlock({ state: 'failed', numbersHidden: true });
    expect(wrapper.text()).not.toContain('50');
    expect(wrapper.text()).toContain('بلغت حد الرفع الشهري.');
    expect(wrapper.text()).toContain('تحديث');
  });

  it('is exposed to assistive technology', () => {
    const wrapper = mountBlock();
    expect(wrapper.find('[role="alert"]').exists()).toBe(true);
  });

  it('carries no raw visual value outside the layer tokens', () => {
    const source = mountBlock().html();
    expect(source).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
