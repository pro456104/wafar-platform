// The frame's one composition: the layout owns the drawer's open state, so
// «المزيد» opens the drawer, the drawer's close event ends it, and the sidebar,
// the bar, and the drawer all carry the guest composition (FR-022, FR-039,
// FR-048, FR-052; T226).
import { mount } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { describe, expect, it } from 'vitest';
import ShellLayout from '../../app/layouts/shell.vue';

// The frame reads the session through the layer's provider, so the mount
// installs the same plugin the application does (T320; T151).
function mountLayout() {
  return mount(ShellLayout, {
    global: {
      stubs,
      plugins: [[VueQueryPlugin, { queryClient: new QueryClient() }]],
    },
  });
}

const stubs = {
  WfShellHeader: {
    name: 'WfShellHeader',
    props: ['signedIn', 'blocked', 'signInPath', 'accountTargets'],
    template: '<header />',
  },
  WfShellSidebar: {
    name: 'WfShellSidebar',
    props: ['guest', 'items', 'links'],
    template: '<nav class="sidebar" :data-guest="String(guest)" />',
  },
  WfShellFooter: { name: 'WfShellFooter', props: ['links'], template: '<footer />' },
  WfShellBottomBar: {
    name: 'WfShellBottomBar',
    props: ['guest', 'drawerOpen', 'items'],
    emits: ['openDrawer'],
    template:
      '<button data-slot="more" @click="$emit(\'openDrawer\')">{{ guest }}</button>',
  },
  WfShellDrawer: {
    name: 'WfShellDrawer',
    props: ['open', 'guest', 'items', 'links'],
    emits: ['close'],
    template:
      '<div v-if="open" class="drawer" :data-guest="String(guest)"><button class="drawer-close" @click="$emit(\'close\')" /></div>',
  },
};

describe('the shell layout', () => {
  it('opens the drawer from «المزيد» and closes it on the drawer’s close event', async () => {
    const wrapper = mountLayout();
    expect(wrapper.find('.drawer').exists()).toBe(false);

    await wrapper.find('[data-slot="more"]').trigger('click');
    expect(wrapper.find('.drawer').exists()).toBe(true);

    await wrapper.find('.drawer-close').trigger('click');
    expect(wrapper.find('.drawer').exists()).toBe(false);
  });

  it('gives the guest composition to the sidebar, the bar, and the drawer', async () => {
    const wrapper = mountLayout();
    expect(wrapper.find('.sidebar').attributes('data-guest')).toBe('true');
    await wrapper.find('[data-slot="more"]').trigger('click');
    expect(wrapper.find('.drawer').attributes('data-guest')).toBe('true');
  });

  it('takes the surfaces below the drawer out of focus while it is open', async () => {
    const wrapper = mountLayout();
    const header = wrapper.find('header');
    const body = wrapper.find('.shell-layout__body');
    const footer = wrapper.find('footer');
    expect(header.element.hasAttribute('inert')).toBe(false);
    expect(body.element.hasAttribute('inert')).toBe(false);
    expect(footer.element.hasAttribute('inert')).toBe(false);

    await wrapper.find('[data-slot="more"]').trigger('click');
    expect(header.element.hasAttribute('inert')).toBe(true);
    expect(body.element.hasAttribute('inert')).toBe(true);
    expect(footer.element.hasAttribute('inert')).toBe(true);

    await wrapper.find('.drawer-close').trigger('click');
    expect(header.element.hasAttribute('inert')).toBe(false);
    expect(body.element.hasAttribute('inert')).toBe(false);
    expect(footer.element.hasAttribute('inert')).toBe(false);
  });

  it('gives a signed-in merchant the signed-in composition', async () => {
    const wrapper = mount(ShellLayout, { props: { signedIn: true }, global: { stubs, plugins: [[VueQueryPlugin, { queryClient: new QueryClient() }]] } });
    expect(wrapper.find('.sidebar').attributes('data-guest')).toBe('false');
    await wrapper.find('[data-slot="more"]').trigger('click');
    expect(wrapper.find('.drawer').attributes('data-guest')).toBe('false');
  });

  it('carries no merchant name in the header’s markup (T314)', () => {
    // The layout passes the header no name prop at all, so no full-name
    // attribute can fall through to its root element (FR-023, AC-025).
    const wrapper = mount(ShellLayout, { props: { signedIn: true }, global: { stubs, plugins: [[VueQueryPlugin, { queryClient: new QueryClient() }]] } });
    expect(wrapper.find('header').attributes('full-name')).toBeUndefined();
  });

  it('passes the recorded lists to the layer (T320)', () => {
    const wrapper = mountLayout();
    expect(wrapper.findComponent({ name: 'WfShellSidebar' }).props('items')).toHaveLength(9);
    expect(wrapper.findComponent({ name: 'WfShellSidebar' }).props('links')).toHaveLength(4);
    expect(wrapper.findComponent({ name: 'WfShellBottomBar' }).props('items')).toHaveLength(5);
    expect(wrapper.findComponent({ name: 'WfShellFooter' }).props('links')).toHaveLength(4);
    expect(wrapper.findComponent({ name: 'WfShellHeader' }).props('signInPath')).toBe(
      '/auth/sign-in',
    );
    expect(wrapper.findComponent({ name: 'WfShellHeader' }).props('accountTargets')).toEqual({
      profile: '/profile',
      settings: '/profile#settings',
    });
    expect(wrapper.findComponent({ name: 'WfShellDrawer' }).props('items')).toHaveLength(9);
    expect(wrapper.findComponent({ name: 'WfShellDrawer' }).props('links')).toHaveLength(4);
  });
});
