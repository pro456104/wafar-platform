<!-- The Wafar wordmark: «منصة وفر» with the second word in the accent colour, rendered from the layer's own text and no second image asset; at 320 CSS px the header uses the shortened «وفر» form (FR-021, FR-023, contracts/ui-contracts.md §2, §8.2). -->
<script setup lang="ts">
withDefaults(
  defineProps<{ as?: 'mark' | 'link'; to?: string; href?: string }>(),
  { as: 'mark', to: '/', href: undefined },
);
</script>

<template>
  <NuxtLink
    v-if="as === 'link'"
    :to="to ?? href ?? '/'"
    class="wf-wordmark"
    aria-label="منصة وفر"
  >
    <span class="wf-wordmark__full">
      <span class="wf-wordmark__brand">منصة</span>
      <span class="wf-wordmark__name">وفر</span>
    </span>
    <span class="wf-wordmark__short" aria-hidden="true">وفر</span>
  </NuxtLink>
  <span v-else class="wf-wordmark" role="img" aria-label="منصة وفر">
    <span class="wf-wordmark__full">
      <span class="wf-wordmark__brand">منصة</span>
      <span class="wf-wordmark__name">وفر</span>
    </span>
    <span class="wf-wordmark__short" aria-hidden="true">وفر</span>
  </span>
</template>

<style scoped>
.wf-wordmark {
  display: inline-flex;
  align-items: center;
  gap: var(--wf-space-1);
  color: var(--wf-ink);
  font-weight: var(--wf-weight-bold);
  font-size: var(--wf-text-xl);
  line-height: var(--wf-leading-tight);
  text-decoration: none;
  white-space: nowrap;
}
.wf-wordmark__brand {
  font-weight: var(--wf-weight-regular);
}
.wf-wordmark__name {
  color: var(--wf-primary);
}
.wf-wordmark__short {
  display: none;
  color: var(--wf-primary);
}
@media (max-width: 359px) {
  .wf-wordmark__full {
    display: none;
  }
  .wf-wordmark__short {
    display: inline;
  }
}
</style>
