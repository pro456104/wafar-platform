<!-- The selected file's identity: the whole name in the markup and as the accessible name, visually cut at the inline end with «…» whenever it does not fit, at any width (FR-008, FR-025, FR-058). -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { formatSize } from '@wafar/shared';

const props = defineProps<{
  name: string;
  byteSize: number;
  format: 'Excel' | 'Word' | 'PDF';
  focus?: boolean;
}>();

const heading = ref<HTMLElement | null>(null);
const size = computed(() => formatSize(props.byteSize));

onMounted(() => {
  if (props.focus === true) heading.value?.focus();
});
</script>

<template>
  <section
    class="wf-selected-file"
    aria-labelledby="wf-selected-file-heading"
  >
    <h2
      id="wf-selected-file-heading"
      ref="heading"
      class="wf-selected-file__heading"
      tabindex="-1"
    >
      الملف المختار
    </h2>
    <p
      class="wf-selected-file__name"
      :title="props.name"
    >
      <span
        class="wf-selected-file__measure"
        aria-hidden="true"
      >
        <WfFileName :name="props.name" />
      </span>
      <span class="wf-selected-file__whole">{{ props.name }}</span>
    </p>
    <p class="wf-selected-file__detail">
      <span class="wf-selected-file__size"><WfNumeral :value="size.replace(' MB', '').replace(' KB', '')" /><span
        class="wf-selected-file__unit"
        lang="en"
        dir="ltr"
      >{{ size.includes('MB') ? 'MB' : 'KB' }}</span></span>
      <span aria-hidden="true"> · </span>
      <span
        class="wf-selected-file__format"
        lang="en"
        dir="ltr"
      >{{ props.format }}</span>
    </p>
  </section>
</template>

<style scoped>
.wf-selected-file {
  display: flex;
  flex-direction: column;
  gap: var(--wf-space-1);
  padding: var(--wf-space-4);
  border: var(--wf-border-width) solid var(--wf-border);
  border-radius: var(--wf-radius);
  background: var(--wf-surface-muted);
}
.wf-selected-file__heading {
  margin: 0;
  font-size: var(--wf-text-sm);
  font-weight: var(--wf-weight-medium);
  color: var(--wf-ink-muted);
}
.wf-selected-file__name {
  margin: 0;
  min-inline-size: 0;
  font-weight: var(--wf-weight-semibold);
}
.wf-selected-file__measure {
  display: block;
  max-inline-size: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  direction: rtl;
}
.wf-selected-file__whole {
  position: absolute;
  inline-size: var(--wf-border-width);
  block-size: var(--wf-border-width);
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.wf-selected-file__detail {
  display: flex;
  gap: var(--wf-space-1);
  margin: 0;
  color: var(--wf-ink-muted);
  font-size: var(--wf-text-sm);
}
.wf-selected-file__unit,
.wf-selected-file__format {
  direction: ltr;
  unicode-bidi: isolate;
}
.wf-selected-file__heading:focus-visible {
  outline: var(--wf-focus-width) solid var(--wf-focus-colour);
  outline-offset: var(--wf-focus-offset);
}
</style>
