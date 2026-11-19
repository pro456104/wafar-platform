<!-- The multi-file notice: shown for one drop alone, replaced by the next selection, and removed from the accessibility tree when replaced (FR-020, contracts/ui-contracts.md §4.7). -->
<script setup lang="ts">
defineProps<{ visible: boolean }>();
</script>

<template>
  <p
    v-if="visible"
    class="upload-notice"
  >
    تم بدء الملف الأول. يتم رفع ملف واحد في كل مرة، ولم تبدأ الملفات الأخرى.
  </p>
</template>

<style scoped>
.upload-notice {
  margin: 0;
  padding: var(--wf-space-3);
  border-radius: var(--wf-radius);
  background: var(--wf-primary-soft);
  color: var(--wf-ink);
  font-size: var(--wf-text-sm);
}
</style>
