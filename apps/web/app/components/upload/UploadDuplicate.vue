<!-- The duplicate outcome: the original's name, Gregorian date, Arabic status label, the parts link, and «رفع آخر», with the failed original's extra note and «ملفاتي» (FR-041-FR-046, contracts/ui-contracts.md §4.4). -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { formatDate, formatStatus } from '@wafar/shared';
import type { RetainedDuplicate } from '@wafar/shared';

const props = withDefaults(
  defineProps<{ original: RetainedDuplicate; withheld?: boolean }>(),
  { withheld: false },
);
const emit = defineEmits<{ 'upload-another': [] }>();
const heading = ref<HTMLElement | null>(null);
onMounted(() => heading.value?.focus());

const date = computed(() => formatDate(props.original.uploadedAt));
const label = computed(() => formatStatus(props.original.status));
const partsHref = computed(() => `/parts?file=${props.original.id}`);
</script>

<template>
  <section
    class="upload-duplicate"
    aria-labelledby="upload-duplicate-heading"
  >
    <h2
      id="upload-duplicate-heading"
      ref="heading"
      class="upload-duplicate__heading"
      tabindex="-1"
    >
      الملف موجود مسبقا
    </h2>
    <p class="upload-duplicate__body">
      <span>هذا الملف مطابق للملف</span>
      <WfFileName :name="props.original.fileName" />
      <span>الذي تم رفعه في</span>
      <WfNumeral :value="date" />
      <span>.</span>
    </p>
    <p class="upload-duplicate__status">
      الحالة: {{ label }}
    </p>
    <p
      v-if="props.original.status === 'failed'"
      class="upload-duplicate__note"
    >
      فشلت معالجة الملف الأصلي. يمكنك إعادة المحاولة من ملفاتي.
    </p>
    <div class="upload-duplicate__actions">
      <NuxtLink
        class="upload-duplicate__link"
        :to="partsHref"
      >عرض القطع</NuxtLink>
      <NuxtLink
        v-if="props.original.status === 'failed'"
        class="upload-duplicate__link"
        to="/my-files"
      >
        ملفاتي
      </NuxtLink>
      <button
        v-if="!props.withheld"
        type="button"
        class="upload-duplicate__again"
        @click="emit('upload-another')"
      >
        رفع آخر
      </button>
    </div>
  </section>
</template>

<style scoped>
.upload-duplicate {
  display: flex;
  flex-direction: column;
  gap: var(--wf-space-3);
}
.upload-duplicate__heading {
  margin: 0;
  font-size: var(--wf-text-xl);
}
.upload-duplicate__body,
.upload-duplicate__status,
.upload-duplicate__note {
  margin: 0;
  color: var(--wf-ink-muted);
}
.upload-duplicate__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--wf-space-3);
}
.upload-duplicate__link,
.upload-duplicate__again {
  display: inline-flex;
  align-items: center;
  min-block-size: var(--wf-touch-floor);
  color: var(--wf-primary);
}
.upload-duplicate__again {
  padding-inline: var(--wf-space-3);
  border: var(--wf-border-width) solid var(--wf-border);
  border-radius: var(--wf-radius);
  background: transparent;
  font: inherit;
  cursor: pointer;
}
.upload-duplicate__heading:focus-visible {
  outline: var(--wf-focus-width) solid var(--wf-focus-colour);
  outline-offset: var(--wf-focus-offset);
}
</style>
