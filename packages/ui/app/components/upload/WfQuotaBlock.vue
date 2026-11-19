<!-- The quota's own states: loading, ready, failed, and the exhausted presentation, each exposed to assistive technology rather than only to the eye (FR-010, FR-015-FR-017, contracts/ui-contracts.md §5.1). -->
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  state: 'loading' | 'ready' | 'failed';
  monthly: { used: number; limit: number };
  active: { used: number; limit: number };
  exhausted: ('monthly' | 'active')[];
  numbersHidden?: boolean;
}>();
const emit = defineEmits<{ refresh: [] }>();

const monthlyText = computed(() => {
  const base = props.numbersHidden === true
    ? 'بلغت حد الرفع الشهري. يتجدد في أول الشهر الميلادي القادم.'
    : `بلغت حد الرفع الشهري (${props.monthly.used} من ${props.monthly.limit}). يتجدد في أول الشهر الميلادي القادم.`;
  return base;
});
const activeText = computed(() => {
  const base = props.numbersHidden === true
    ? 'بلغت حد الملفات النشطة. يتم تحرير بحذف ملف أو بانتهاء مدة الاحتفاظ (90 يوما).'
    : `بلغت حد الملفات النشطة (${props.active.used} من ${props.active.limit}). يتم تحرير بحذف ملف أو بانتهاء مدة الاحتفاظ (90 يوما).`;
  return base;
});
</script>

<template>
  <section
    class="wf-quota"
    aria-labelledby="wf-quota-heading"
  >
    <h2
      id="wf-quota-heading"
      class="wf-quota__heading"
      tabindex="-1"
    >
      الحصة
    </h2>
    <p class="wf-quota__caption">
      حصة الشهر الميلادي، والحد النشط يشمل الملفات المخزنة غير المحذوفة.
    </p>

    <p
      v-if="props.state === 'loading'"
      class="wf-quota__status"
      role="status"
      aria-busy="true"
    >
      يجري قراءة الحصة…
    </p>

    <template v-else-if="props.exhausted.length > 0">
      <p
        class="wf-quota__exhausted"
        role="alert"
      >
        <span
          v-for="reason in props.exhausted"
          :key="reason"
          class="wf-quota__exhausted-line"
        >
          {{ reason === 'monthly' ? monthlyText : activeText }}
        </span>
      </p>
      <button
        type="button"
        class="wf-quota__refresh"
        @click="emit('refresh')"
      >
        تحديث
      </button>
    </template>

    <p
      v-else-if="props.state === 'failed'"
      class="wf-quota__status wf-quota__status--failure"
    >
      تعذر قراءة الحصة. الحصص غير متاحة الآن.
      <button
        type="button"
        class="wf-quota__retry"
        @click="emit('refresh')"
      >
        إعادة المحاولة
      </button>
    </p>

    <dl
      v-else
      class="wf-quota__lines"
    >
      <div class="wf-quota__line">
        <dt>هذا الشهر:</dt>
        <dd><WfNumeral :value="props.monthly.used" /> من <WfNumeral :value="props.monthly.limit" /></dd>
      </div>
      <div class="wf-quota__line">
        <dt>الملفات النشطة:</dt>
        <dd><WfNumeral :value="props.active.used" /> من <WfNumeral :value="props.active.limit" /></dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.wf-quota {
  display: flex;
  flex-direction: column;
  gap: var(--wf-space-2);
  padding: var(--wf-space-4);
  border: var(--wf-border-width) solid var(--wf-border);
  border-radius: var(--wf-radius);
  background: var(--wf-surface-muted);
}
.wf-quota__heading {
  margin: 0;
  font-size: var(--wf-text-base);
  font-weight: var(--wf-weight-semibold);
}
.wf-quota__caption {
  margin: 0;
  color: var(--wf-ink-muted);
  font-size: var(--wf-text-sm);
}
.wf-quota__status {
  margin: 0;
  color: var(--wf-ink-muted);
  font-size: var(--wf-text-sm);
}
.wf-quota__status--failure {
  color: var(--wf-danger);
}
.wf-quota__exhausted {
  display: flex;
  flex-direction: column;
  gap: var(--wf-space-2);
  margin: 0;
  padding: var(--wf-space-3);
  border-radius: var(--wf-radius);
  background: var(--wf-danger-soft);
  color: var(--wf-danger);
}
.wf-quota__exhausted-line {
  display: block;
}
.wf-quota__lines {
  display: flex;
  flex-direction: column;
  gap: var(--wf-space-1);
  margin: 0;
}
.wf-quota__line {
  display: flex;
  gap: var(--wf-space-1);
  font-size: var(--wf-text-sm);
}
.wf-quota__line dt,
.wf-quota__line dd {
  margin: 0;
}
.wf-quota__retry,
.wf-quota__refresh {
  align-self: flex-start;
  min-block-size: var(--wf-touch-floor);
  padding-inline: var(--wf-space-3);
  border: var(--wf-border-width) solid var(--wf-border);
  border-radius: var(--wf-radius);
  background: var(--wf-surface);
  color: var(--wf-primary);
  font: inherit;
  cursor: pointer;
}
.wf-quota__heading:focus-visible {
  outline: var(--wf-focus-width) solid var(--wf-focus-colour);
  outline-offset: var(--wf-focus-offset);
}
</style>
