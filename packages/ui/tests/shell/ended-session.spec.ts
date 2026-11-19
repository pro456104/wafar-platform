// The ended-session state in both variants: the live region, the focusable
// heading, the withheld sign-in control, the guest redirect rule, and the
// heading's focus rule drawn from the registered focus tokens
// (FR-049, FR-048, AC-053, AC-052; T097, T311).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import WfEndedSession from '../../app/components/shell/WfEndedSession.vue';
import WfNavList from '../../app/components/shell/WfNavList.vue';
import { signInPath, sidebarItems } from './fixtures.ts';

const stubs = {
  NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
  WfIcon: { template: '<i />' },
};

describe('the ended-session state', () => {
  it('announces ahead of the page and focuses its heading (ended)', async () => {
    const wrapper = mount(WfEndedSession, {
      props: { variant: 'ended', signInPath },
      global: { stubs },
      attachTo: document.body,
    });
    const region = wrapper.find('[role="status"]');
    expect(region.attributes('aria-live')).toBe('polite');
    expect(wrapper.find('h2').text()).toBe('انتهت الجلسة');
    expect(wrapper.find('h2').attributes('tabindex')).toBe('-1');
    expect(wrapper.find('a').attributes('href')).toBe('/auth/sign-in');
    expect(wrapper.find('a').text()).toBe('تسجيل الدخول');
    expect(document.activeElement).toBe(wrapper.find('h2').element);
    wrapper.unmount();
  });

  it('withholds the sign-in control in the blocked variant', async () => {
    const wrapper = mount(WfEndedSession, {
      props: { variant: 'blocked', signInPath },
      global: { stubs },
      attachTo: document.body,
    });
    expect(wrapper.find('h2').text()).toBe('الحساب موقوف');
    expect(wrapper.find('a').exists()).toBe(false);
    expect(wrapper.text()).toContain(
      'أوقفت الإدارة هذا الحساب، ولن يقبل تسجيل الدخول حتى يعاد تفعيله.',
    );
    expect(document.activeElement).toBe(wrapper.find('h2').element);
    wrapper.unmount();
  });

  it('takes a guest from a merchant-area item to sign-in and keeps it enabled', () => {
    const wrapper = mount(WfNavList, {
      props: { guest: true, items: sidebarItems },
      global: { stubs },
    });
    const profile = wrapper.findAll('.wf-nav-list__item').at(-1);
    expect(profile?.attributes('href')).toBe('/auth/sign-in');
    expect(profile?.attributes('disabled')).toBeUndefined();
  });

  it('draws the heading’s focus rule from the registered focus tokens (T311)', () => {
    const source = readFileSync(
      resolve('packages/ui/app/components/shell/WfEndedSession.vue'),
      'utf8',
    );
    const rule = /__heading:focus-visible\s*\{([^}]*)\}/.exec(source)?.[1] ?? '';
    expect(rule).toContain(
      'outline: var(--wf-focus-width) solid var(--wf-focus-colour)',
    );
    expect(rule).toContain('outline-offset: var(--wf-focus-offset)');
    expect(rule).not.toContain('--wf-focus-ring');
  });
});
