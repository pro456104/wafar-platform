<!-- The error panel: one Arabic message per cause, «إعادة المحاولة» only where a retry may succeed, and «اختيار ملف آخر» for every cause except the two limit codes (FR-028, FR-034, FR-049, contracts/ui-contracts.md §4.5). -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { formatDuration } from '@wafar/shared';
import { refusalMessage, transferFailureMessage } from '../../composables/upload/refusal-messages.ts';

const props = withDefaults(
  defineProps<{ code: string | null; retryAfterSeconds?: number; withheld?: boolean }>(),
  { withheld: false, retryAfterSeconds: 0 },
);
const emit = defineEmits<{ retry: []; 'choose-another': [] }>();
const heading = ref<HTMLElement | null>(null);
onMounted(() => heading.value?.focus());

const message = computed(() => {
  const base =
    props.code === null
      ? transferFailureMessage()
      : refusalMessage(props.code, props.retryAfterSeconds);
  return base;
});
const retryable = computed(() => {
  if (props.code === null) return true;
  return ['UPLOAD_SCAN_UNAVAILABLE', 'UPLOAD_TOO_MANY_ATTEMPTS', 'UPLOAD_STORAGE_UNAVAILABLE', 'INTERNAL_ERROR'].includes(
    props.code,
  );
});
const limitCode = computed(
  () => props.code === 'UPLOAD_MONTHLY_LIMIT' || props.code === 'UPLOAD_ACTIVE_LIMIT',
);
</script>

<template>
  <section
    class="upload-error"
    aria-labelledby="upload-error-heading"
  >
    <h2
      id="upload-error-heading"
      ref="heading"
      class="upload-error__heading"
      tabindex="-1"
    >
      تعذر رفع الملف
    </h2>
    <p class="upload-error__body">
      {{ message }}
    </p>
    <p
      v-if="props.retryAfterSeconds !== undefined && props.code === 'UPLOAD_TOO_MANY_ATTEMPTS'"
      class="upload-error__wait"
    >
      أعد المحاولة بعد <WfNumeral :value="formatDuration(props.retryAfterSeconds)" />.
    </p>
    <div
      v-if="!props.withheld && !limitCode"
      class="upload-error__actions"
    >
      <button
        v-if="retryable"
        type="button"
        class="upload-error__retry"
        @click="emit('retry')"
      >
        إعادة المحاولة
      </button>
      <button
        type="button"
        class="upload-error__other"
        @click="emit('choose-another')"
      >
        اختيار ملف آخر
      </button>
    </div>
  </section>
</template>

<style scoped>
.upload-error {
  display: flex;
  flex-direction: column;
  gap: var(--wf-space-3);
  padding: var(--wf-space-4);
  border: var(--wf-border-width) solid var(--wf-danger);
  border-radius: var(--wf-radius);
  background: var(--wf-danger-soft);
}
.upload-error__heading {
  margin: 0;
  font-size: var(--wf-text-xl);
  color: var(--wf-danger);
}
.upload-error__body,
.upload-error__wait {
  margin: 0;
  color: var(--wf-ink);
}
.upload-error__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--wf-space-3);
}
.upload-error__retry,
.upload-error__other {
  display: inline-flex;
  align-items: center;
  min-block-size: var(--wf-touch-floor);
  padding-inline: var(--wf-space-3);
  border: var(--wf-border-width) solid var(--wf-border);
  border-radius: var(--wf-radius);
  background: var(--wf-surface);
  color: var(--wf-ink);
  font: inherit;
  cursor: pointer;
}
.upload-error__retry {
  border-color: var(--wf-danger);
  color: var(--wf-danger);
}
.upload-error__heading:focus-visible {
  outline: var(--wf-focus-width) solid var(--wf-focus-colour);
  outline-offset: var(--wf-focus-offset);
}
</style>
