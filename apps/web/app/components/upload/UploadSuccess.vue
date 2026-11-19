<!-- The success outcome: the heading, the body naming the file, the registered /my-files link, and «رفع آخر», withheld while a limit is exhausted (FR-007, FR-047, contracts/ui-contracts.md §4.4). -->
<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = withDefaults(defineProps<{ fileName: string; withheld?: boolean }>(), {
  withheld: false,
});
const emit = defineEmits<{ 'upload-another': [] }>();
const heading = ref<HTMLElement | null>(null);
onMounted(() => heading.value?.focus());
</script>

<template>
  <section
    class="upload-success"
    aria-labelledby="upload-success-heading"
  >
    <h2
      id="upload-success-heading"
      ref="heading"
      class="upload-success__heading"
      tabindex="-1"
    >
      تم استلام الملف
    </h2>
    <p class="upload-success__body">
      <span class="upload-success__saved">تم حفظ</span>
      <WfFileName :name="props.fileName" />
      <span>في ملفاتي. تبدأ المعالجة تلقائيا.</span>
    </p>
    <div class="upload-success__actions">
      <NuxtLink
        class="upload-success__link"
        to="/my-files"
      >
        <WfIcon
          name="my-files"
          :size="16"
        />
        <span>الانتقال إلى ملفاتي</span>
      </NuxtLink>
      <button
        v-if="!props.withheld"
        type="button"
        class="upload-success__again"
        @click="emit('upload-another')"
      >
        رفع آخر
      </button>
    </div>
  </section>
</template>

<style scoped>
.upload-success {
  display: flex;
  flex-direction: column;
  gap: var(--wf-space-3);
}
.upload-success__heading {
  margin: 0;
  font-size: var(--wf-text-xl);
}
.upload-success__body {
  margin: 0;
  color: var(--wf-ink-muted);
}
.upload-success__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--wf-space-3);
}
.upload-success__link,
.upload-success__again {
  display: inline-flex;
  align-items: center;
  gap: var(--wf-space-1);
  min-block-size: var(--wf-touch-floor);
  color: var(--wf-primary);
}
.upload-success__again {
  padding-inline: var(--wf-space-3);
  border: var(--wf-border-width) solid var(--wf-border);
  border-radius: var(--wf-radius);
  background: transparent;
  font: inherit;
  cursor: pointer;
}
.upload-success__heading:focus-visible {
  outline: var(--wf-focus-width) solid var(--wf-focus-colour);
  outline-offset: var(--wf-focus-offset);
}
</style>
