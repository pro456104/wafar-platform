<!-- The frame's page layout: header, sidebar, content, footer band, the drawer on a narrow screen, and the bottom bar. The layout owns the drawer's open state, so «المزيد» opens it and the recorded dismissals close it (FR-022, FR-039, FR-048, FR-052; R1 ships no page that renders it, EX-007). -->
<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  accountMenu,
  bareRoutes,
  bottomBarSlots,
  footerLinks,
  sidebarDestinations,
} from '@wafar/shared';
import { useApi } from '../composables/auth/useApi';
import { useSession } from '../composables/auth/useSession';

const props = withDefaults(defineProps<{ signedIn?: boolean; blocked?: boolean }>(), {
  signedIn: false,
  blocked: false,
});

// The one page that renders the frame is a merchant page, so the frame reads the
// session it already has: the header's account control, the notifications
// control, and the menu's sign-out (FR-047, FR-049; AC-035, AC-038).
const session = useSession();
const api = useApi();
const signedIn = computed(
  () => props.signedIn || session.data.value?.authenticated === true,
);
const blocked = computed(
  () => props.blocked || session.data.value?.ended === 'ACCOUNT_BLOCKED',
);

const drawerOpen = ref(false);

/** The menu's confirm: the product's own sign-out, then the bare sign-in page. */
async function signOut(): Promise<void> {
  await api.post('/api/v1/auth/sign-out', {});
  await session.refetch();
  await navigateTo(bareRoutes.signIn);
}
</script>

<template>
  <div class="shell-layout">
    <WfShellHeader
      :signed-in="signedIn"
      :blocked="blocked"
      :sign-in-path="bareRoutes.signIn"
      :account-targets="accountMenu"
      :inert="drawerOpen ? true : undefined"
      @sign-out="signOut"
    />
    <div
      class="shell-layout__body"
      :inert="drawerOpen ? true : undefined"
    >
      <div class="shell-layout__sidebar">
        <WfShellSidebar
          :items="sidebarDestinations"
          :links="footerLinks"
          :guest="!signedIn"
        />
      </div>
      <main
        id="main"
        class="shell-layout__main"
      >
        <slot />
      </main>
    </div>
    <WfShellFooter
      :links="footerLinks"
      :inert="drawerOpen ? true : undefined"
    />
    <WfShellBottomBar
      :items="bottomBarSlots"
      :guest="!signedIn"
      :drawer-open="drawerOpen"
      @open-drawer="drawerOpen = true"
    />
    <WfShellDrawer
      :items="sidebarDestinations"
      :links="footerLinks"
      :open="drawerOpen"
      :guest="!signedIn"
      @close="drawerOpen = false"
    />
  </div>
</template>

<style scoped>
.shell-layout {
  display: flex;
  flex-direction: column;
  min-block-size: 100vh;
  padding-block-end: var(--wf-bottom-bar-height);
}
.shell-layout__body {
  display: flex;
  flex: 1;
  align-items: stretch;
}
.shell-layout__sidebar {
  display: none;
}
.shell-layout__main {
  flex: 1;
  inline-size: 100%;
  max-inline-size: var(--wf-content-max);
  margin-inline: auto;
  padding: var(--wf-space-5);
}
@media (min-width: 1024px) {
  .shell-layout {
    padding-block-end: 0;
  }
  .shell-layout__sidebar {
    display: block;
  }
}
</style>
