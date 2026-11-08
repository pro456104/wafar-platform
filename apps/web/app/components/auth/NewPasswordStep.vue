<!-- The recovery flow's new-password step: the policy statement, the field, and the guarded submit (FR-014, FR-040, AC-016, AC-043). -->
<script setup lang="ts">
import { passwordMaxLength, passwordMinLength } from '@wafar/shared';
import MessageAlert from './MessageAlert.vue';
import PasswordField from './PasswordField.vue';

defineProps<{ modelValue: string; message?: string; loading: boolean }>();
const emit = defineEmits<{
  'update:modelValue': [value: string];
  submit: [];
}>();

function update(value: string): void {
  emit('update:modelValue', value);
}
</script>

<template>
  <section class="wf-new-password">
    <h2>كلمة المرور الجديدة</h2>
    <MessageAlert :message="message ?? ''" kind="alert" />
    <p class="wf-new-password__policy">
      كلمة المرور من {{ passwordMinLength }} إلى {{ passwordMaxLength }} حرفا.
    </p>
    <PasswordField
      :model-value="modelValue"
      label="كلمة المرور الجديدة"
      @update:model-value="update"
    />
    <button
      type="button"
      class="wf-new-password__submit"
      :disabled="loading"
      @click="emit('submit')"
    >
      حفظ كلمة المرور
    </button>
  </section>
</template>

<style scoped>
.wf-new-password {
  display: flex;
  flex-direction: column;
  gap: var(--wf-space-3);
}
.wf-new-password__policy {
  margin: 0;
  color: var(--wf-ink-muted);
  font-size: var(--wf-text-sm);
}
.wf-new-password__submit {
  min-block-size: var(--wf-touch-floor);
  border: 0;
  border-radius: var(--wf-radius);
  background: var(--wf-primary);
  color: var(--wf-primary-contrast);
  font: inherit;
  font-weight: var(--wf-weight-semibold);
}
</style>
