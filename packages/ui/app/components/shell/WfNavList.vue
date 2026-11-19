<!-- The nine-destination navigation list: one entry per destination, each label carried whole as the link's accessible name, and a guest sent to the sign-in page from a merchant-area destination (FR-039, FR-048). -->
<script setup lang="ts">
import { destinationFor } from '@wafar/shared';
import type { SidebarDestination } from '@wafar/shared';
import WfIcon from '../WfIcon.vue';
import type { WfIconName } from '../../types/icon.ts';

withDefaults(
  defineProps<{
    items: readonly SidebarDestination[];
    guest?: boolean;
    collapsed?: boolean;
  }>(),
  {
    guest: false,
    collapsed: false,
  },
);

const emit = defineEmits<{ navigate: [] }>();

const icons: Record<string, WfIconName> = {
  home: 'home',
  parts: 'parts',
  catalogs: 'catalogs',
  upload: 'upload',
  'my-files': 'my-files',
  cart: 'cart',
  notifications: 'notifications',
  messages: 'messages',
  profile: 'profile',
};
</script>

<template>
  <ul class="wf-nav-list">
    <li
      v-for="item in items"
      :key="item.key"
    >
      <NuxtLink
        :to="destinationFor(item.path, guest)"
        class="wf-nav-list__item"
        @click="emit('navigate')"
      >
        <WfIcon :name="icons[item.key] ?? 'home'" />
        <span class="wf-nav-list__label">{{ item.label }}</span>
        <!-- The collapsed rail's tooltip: an element positioned at the item's
             inline-end edge, never the browser's native title, which cannot
             open on that side or stay inside the viewport (ui-contracts §8.3). -->
        <span
          v-if="collapsed"
          class="wf-nav-list__tooltip"
          aria-hidden="true"
        >{{ item.label }}</span>
      </NuxtLink>
    </li>
  </ul>
</template>

<style scoped>
.wf-nav-list {
  display: flex;
  flex-direction: column;
  gap: var(--wf-space-1);
  list-style: none;
  margin: 0;
  padding: 0;
}
.wf-nav-list__item {
  display: flex;
  align-items: center;
  gap: var(--wf-space-2);
  inline-size: 100%;
  min-block-size: var(--wf-touch-floor);
  padding-inline: var(--wf-space-2);
  border-radius: var(--wf-radius);
  color: var(--wf-ink-muted);
  text-decoration: none;
}
.wf-nav-list li {
  position: relative;
}
.wf-nav-list__item:hover {
  background: var(--wf-surface-muted);
  color: var(--wf-ink);
}
.wf-nav-list__label {
  min-inline-size: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.wf-nav-list__tooltip {
  position: absolute;
  inset-inline-start: calc(100% + var(--wf-space-2));
  inset-block-start: 50%;
  translate: 0 -50%;
  z-index: var(--wf-z-sticky);
  inline-size: max-content;
  max-inline-size: calc(100vw - var(--wf-rail-width) - 2 * var(--wf-space-3));
  padding: var(--wf-space-1) var(--wf-space-2);
  border: var(--wf-border-width) solid var(--wf-border);
  border-radius: var(--wf-radius);
  background: var(--wf-surface);
  color: var(--wf-ink);
  font-size: var(--wf-text-sm);
  white-space: normal;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
}
.wf-nav-list__item:hover .wf-nav-list__tooltip,
.wf-nav-list__item:focus-visible .wf-nav-list__tooltip {
  opacity: 1;
  visibility: visible;
}
</style>
