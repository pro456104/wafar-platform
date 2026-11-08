<!-- The frame's page layout: header, sidebar, content, footer band, and the bottom bar on a narrow screen. R1 ships no page that renders it (EX-007). -->
<script setup lang="ts">
withDefaults(
  defineProps<{ signedIn?: boolean; blocked?: boolean; fullName?: string }>(),
  {
    signedIn: false,
    blocked: false,
    fullName: '',
  },
);
</script>

<template>
  <div class="shell-layout">
    <WfShellHeader :signed-in="signedIn" :blocked="blocked" :full-name="fullName" />
    <div class="shell-layout__body">
      <WfShellSidebar />
      <main id="main" class="shell-layout__main">
        <slot />
      </main>
    </div>
    <WfShellFooter />
    <WfShellBottomBar />
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
}
</style>
