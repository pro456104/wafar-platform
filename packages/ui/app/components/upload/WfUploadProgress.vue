<!-- The work's progress: a determinate transfer with «إلغاء», then the indeterminate screening phase with «إلغاء» withdrawn, one announcement per phase change and never per percentage (FR-048, FR-059, contracts/ui-contracts.md §5.1). -->
<script setup lang="ts">
withDefaults(
  defineProps<{ phase: 'transfer' | 'screening'; percent?: number }>(),
  { percent: 0 },
);
const emit = defineEmits<{ cancel: [] }>();
</script>

<template>
  <section
    class="wf-upload-progress"
    aria-labelledby="wf-upload-progress-heading"
  >
    <h2
      id="wf-upload-progress-heading"
      class="wf-upload-progress__heading"
      tabindex="-1"
    >
      {{ phase === 'screening' ? 'يجري فحص الملف' : 'يجري رفع الملف' }}
    </h2>
    <div
      v-if="phase === 'transfer'"
      class="wf-upload-progress__track"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="percent"
      aria-label="نسبة الرفع"
    >
      <span
        class="wf-upload-progress__fill"
        :style="{ inlineSize: `${percent}%` }"
      />
    </div>
    <div
      v-else
      class="wf-upload-progress__screening"
      role="presentation"
    >
      <span class="wf-upload-progress__pulse" />
      <span class="wf-upload-progress__screening-label">يجري فحص الملف</span>
    </div>
    <p
      v-if="phase === 'transfer'"
      class="wf-upload-progress__percent"
    >
      <WfNumeral :value="percent" /><span
        class="wf-upload-progress__sign"
        aria-hidden="true"
      >%</span>
    </p>
    <button
      v-if="phase === 'transfer'"
      type="button"
      class="wf-upload-progress__cancel"
      @click="emit('cancel')"
    >
      <WfIcon
        name="close"
        :size="16"
      />
      <span>إلغاء</span>
    </button>
  </section>
</template>

<style scoped>
.wf-upload-progress {
  display: flex;
  flex-direction: column;
  gap: var(--wf-space-2);
}
.wf-upload-progress__heading {
  margin: 0;
  font-size: var(--wf-text-sm);
  font-weight: var(--wf-weight-medium);
  color: var(--wf-ink-muted);
}
.wf-upload-progress__track {
  position: relative;
  block-size: var(--wf-space-2);
  border-radius: var(--wf-radius);
  background: var(--wf-border);
  overflow: hidden;
}
.wf-upload-progress__fill {
  display: block;
  block-size: 100%;
  background: var(--wf-primary);
  transition: inline-size var(--wf-duration-base) var(--wf-ease-standard);
}
.wf-upload-progress__screening {
  display: flex;
  align-items: center;
  gap: var(--wf-space-2);
  min-block-size: var(--wf-space-8);
}
.wf-upload-progress__pulse {
  inline-size: var(--wf-space-3);
  block-size: var(--wf-space-3);
  border-radius: 50%;
  background: linear-gradient(var(--wf-shimmer-angle), var(--wf-shimmer-from), var(--wf-shimmer-to));
  animation: wf-pulse var(--wf-duration-slow) linear infinite alternate;
}
.wf-upload-progress__screening-label {
  color: var(--wf-ink-muted);
  font-size: var(--wf-text-sm);
}
.wf-upload-progress__percent {
  margin: 0;
  font-size: var(--wf-text-sm);
}
.wf-upload-progress__sign {
  margin-inline-start: 0.1em;
}
.wf-upload-progress__cancel {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: var(--wf-space-1);
  min-block-size: var(--wf-touch-floor);
  padding-inline: var(--wf-space-3);
  border: var(--wf-border-width) solid var(--wf-border);
  border-radius: var(--wf-radius);
  background: transparent;
  color: var(--wf-ink);
  font: inherit;
  cursor: pointer;
}
@keyframes wf-pulse {
  from {
    opacity: 0.4;
  }
  to {
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .wf-upload-progress__fill {
    transition: none;
  }
  .wf-upload-progress__pulse {
    animation: none;
  }
}
</style>
