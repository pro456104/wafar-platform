// The layer's upload components: one control in the accessibility tree, the two
// pointer presentations, focusable headings, the phase announcements left to the
// page's region, the file-name cut hidden from assistive technology, the quota
// block's three states, layer tokens only, and the logical-property check
// (FR-006, FR-008, FR-048, FR-058, AC-001, AC-003, AC-011, AC-044, AC-045; T030).
import { readFileSync } from 'node:fs';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import WfUploadControl from '../../app/components/upload/WfUploadControl.vue';
import WfSelectedFile from '../../app/components/upload/WfSelectedFile.vue';
import WfUploadProgress from '../../app/components/upload/WfUploadProgress.vue';
import WfQuotaBlock from '../../app/components/upload/WfQuotaBlock.vue';
import WfFileName from '../../app/components/WfFileName.vue';
import WfNumeral from '../../app/components/WfNumeral.vue';
import WfIcon from '../../app/components/WfIcon.vue';

const globals = { components: { WfFileName, WfNumeral, WfIcon } };

describe('WfUploadControl', () => {
  it('exposes one control in the accessibility tree', () => {
    const wrapper = mount(WfUploadControl, { global: globals });
    expect(wrapper.findAll('button')).toHaveLength(1);
    expect(wrapper.find('input[type="file"]').attributes('accept')).toBe(
      '.xls,.xlsx,.doc,.docx,.pdf',
    );
  });

  it('opens the picker on Enter and on Space', async () => {
    const wrapper = mount(WfUploadControl, { global: globals, attachTo: document.body });
    const button = wrapper.find('button');
    let opened = 0;
    const input = wrapper.find('input').element as HTMLInputElement;
    input.click = () => {
      opened += 1;
    };
    await button.trigger('keydown', { key: 'Enter' });
    await button.trigger('keydown', { key: ' ' });
    expect(opened).toBe(2);
    wrapper.unmount();
  });

  it('emits multi-file alone for a drop carrying more than one file', async () => {
    const wrapper = mount(WfUploadControl, { global: globals });
    const first = new File(['a'], 'a.pdf');
    const second = new File(['b'], 'b.pdf');
    await wrapper.find('button').trigger('drop', {
      dataTransfer: { files: [first, second] },
    });
    // One drop is one emission: the parent starts the first file from the
    // `multi-file` payload and shows the notice once, so `select` never fires
    // beside it (contracts/ui-contracts.md §4.7, §5.1).
    expect(wrapper.emitted('multi-file')?.[0]?.[0]).toHaveLength(2);
    expect(wrapper.emitted('select')).toBeUndefined();
  });

  it('emits select alone for a one-file drop', async () => {
    const wrapper = mount(WfUploadControl, { global: globals });
    const only = new File(['a'], 'a.pdf');
    await wrapper.find('button').trigger('drop', {
      dataTransfer: { files: [only] },
    });
    expect(wrapper.emitted('select')?.[0]?.[0]).toBe(only);
    expect(wrapper.emitted('multi-file')).toBeUndefined();
  });

  it('carries the upload icon and the layer tokens', () => {
    const wrapper = mount(WfUploadControl, { global: globals });
    expect(wrapper.html()).toContain('wf-icon');
    expect(wrapper.html()).toContain('رفع ملف');
  });
});

describe('WfSelectedFile', () => {
  it('keeps the whole name as the accessible name once and hides the cut run', () => {
    const wrapper = mount(WfSelectedFile, {
      global: globals,
      props: { name: 'كتالوج المورد.xlsx', byteSize: 2_411_724, format: 'Excel' },
    });
    const cut = wrapper.find('.wf-selected-file__measure');
    expect(cut.attributes('aria-hidden')).toBe('true');
    expect(wrapper.text()).toContain('كتالوج المورد.xlsx');
    expect(wrapper.find('.wf-selected-file__heading').attributes('tabindex')).toBe('-1');
  });

  it('renders the size and the format label as their own runs', () => {
    const wrapper = mount(WfSelectedFile, {
      global: globals,
      props: { name: 'a.pdf', byteSize: 2_411_724, format: 'PDF' },
    });
    expect(wrapper.text()).toContain('2.3');
    expect(wrapper.find('.wf-selected-file__format').attributes('lang')).toBe('en');
    expect(wrapper.find('.wf-selected-file__format').attributes('dir')).toBe('ltr');
  });
});

describe('WfUploadProgress', () => {
  it('renders a determinate transfer with «إلغاء»', () => {
    const wrapper = mount(WfUploadProgress, {
      global: globals,
      props: { phase: 'transfer', percent: 42 },
    });
    const bar = wrapper.find('[role="progressbar"]');
    expect(bar.attributes('aria-valuenow')).toBe('42');
    expect(wrapper.text()).toContain('إلغاء');
    expect(wrapper.text()).toContain('42');
  });

  it('withdraws «إلغاء» in the screening phase and carries no percentage', () => {
    const wrapper = mount(WfUploadProgress, {
      global: globals,
      props: { phase: 'screening', percent: 42 },
    });
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(false);
    expect(wrapper.text()).toContain('يجري فحص الملف');
    expect(wrapper.text()).not.toContain('إلغاء');
    expect(wrapper.text()).not.toContain('42');
  });

  it('writes no announcement itself: the page owns the two regions', () => {
    const wrapper = mount(WfUploadProgress, {
      global: globals,
      props: { phase: 'screening', percent: 0 },
    });
    expect(wrapper.html()).not.toContain('aria-live');
  });
});

describe('WfQuotaBlock', () => {
  it('exposes the loading state as busy and names the read', () => {
    const wrapper = mount(WfQuotaBlock, {
      global: globals,
      props: {
        state: 'loading',
        monthly: { used: 12, limit: 50 },
        active: { used: 34, limit: 300 },
        exhausted: [],
      },
    });
    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('يجري قراءة الحصة…');
  });

  it('exposes the read failure with its retry and no count', () => {
    const wrapper = mount(WfQuotaBlock, {
      global: globals,
      props: {
        state: 'failed',
        monthly: { used: 12, limit: 50 },
        active: { used: 34, limit: 300 },
        exhausted: [],
      },
    });
    expect(wrapper.text()).toContain('تعذر قراءة الحصة');
    expect(wrapper.text()).toContain('إعادة المحاولة');
    expect(wrapper.find('dl').exists()).toBe(false);
  });

  it('renders both limits’ exhausted content monthly first and «تحديث»', () => {
    const wrapper = mount(WfQuotaBlock, {
      global: globals,
      props: {
        state: 'ready',
        monthly: { used: 50, limit: 50 },
        active: { used: 300, limit: 300 },
        exhausted: ['monthly', 'active'],
      },
    });
    const text = wrapper.text();
    expect(text.indexOf('حد الرفع الشهري')).toBeLessThan(text.indexOf('حد الملفات النشطة'));
    expect(text).toContain('تحديث');
    expect(wrapper.find('dl').exists()).toBe(false);
  });

  it('hides the numbers on a failed re-read while keeping the exhausted content', () => {
    const wrapper = mount(WfQuotaBlock, {
      global: globals,
      props: {
        state: 'failed',
        monthly: { used: 50, limit: 50 },
        active: { used: 10, limit: 300 },
        exhausted: ['monthly'],
        numbersHidden: true,
      },
    });
    expect(wrapper.text()).toContain('بلغت حد الرفع الشهري.');
    expect(wrapper.text()).not.toContain('50 من 50');
    expect(wrapper.text()).toContain('تحديث');
  });

  it('renders no upload control and no outcome action inside the block', () => {
    const wrapper = mount(WfQuotaBlock, {
      global: globals,
      props: {
        state: 'ready',
        monthly: { used: 50, limit: 50 },
        active: { used: 300, limit: 300 },
        exhausted: ['monthly', 'active'],
      },
    });
    expect(wrapper.html()).not.toContain('رفع ملف');
    expect(wrapper.text()).not.toContain('رفع آخر');
    expect(wrapper.text()).not.toContain('اختيار ملف آخر');
  });
});

describe('the logical-property check over the four files', () => {
  const files = [
    'packages/ui/app/components/upload/WfUploadControl.vue',
    'packages/ui/app/components/upload/WfSelectedFile.vue',
    'packages/ui/app/components/upload/WfUploadProgress.vue',
    'packages/ui/app/components/upload/WfQuotaBlock.vue',
  ];

  for (const file of files) {
    it(`${file} uses logical properties only`, () => {
      const source = readFileSync(file, 'utf8');
      expect(source).not.toMatch(/(^|[^-\w])(left|right)\s*:/);
      expect(source).not.toMatch(/margin-(left|right)\s*:/);
      expect(source).not.toMatch(/padding-(left|right)\s*:/);
      expect(source).not.toMatch(/\binset-(left|right)\b/);
    });
  }

  it('carries no raw visual value outside the layer tokens', () => {
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      const styles = source.slice(source.indexOf('<style'));
      expect(styles).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(styles).not.toMatch(/\b\d+(px|rem|ms)\b(?!\s*\))/);
    }
  });
});
