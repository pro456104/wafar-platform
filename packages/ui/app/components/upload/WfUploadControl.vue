<!-- The choosing state's one control: a drop area on a fine pointer and the 56 px action on a coarse one, never two in the accessibility tree (FR-006, FR-020, contracts/ui-contracts.md §5.1). -->
<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{ disabled?: boolean; label?: string; hint?: string }>(),
  { disabled: false, label: 'رفع ملف', hint: 'اسحب ملفا هنا أو اختر ملفا' },
);
const emit = defineEmits<{
  select: [file: File];
  'multi-file': [files: File[]];
}>();

const input = ref<HTMLInputElement | null>(null);

function open(): void {
  if (props.disabled) return;
  input.value?.click();
}

function filesOf(list: FileList | File[] | null | undefined): File[] {
  if (list === null || list === undefined) return [];
  const files: File[] = [];
  for (let index = 0; index < list.length; index += 1) {
    const file: File | undefined = list[index];
    if (file !== undefined) files.push(file);
  }
  return files;
}

function onChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  const files = filesOf(target.files);
  target.value = '';
  if (files.length === 0) return;
  if (files.length > 1) emit('multi-file', files);
  const first = files[0];
  if (first !== undefined) emit('select', first);
}

function onDrop(event: DragEvent): void {
  if (props.disabled) return;
  const files = filesOf(event.dataTransfer?.files);
  if (files.length === 0) return;
  // A drop carrying more than one file is the notice path: the parent starts
  // the first file, so the control emits one event per drop and never both
  // (contracts/ui-contracts.md §4.7, §5.1).
  if (files.length > 1) {
    emit('multi-file', files);
    return;
  }
  const first = files[0];
  if (first !== undefined) emit('select', first);
}
</script>

<template>
  <div class="wf-upload-control">
    <input
      ref="input"
      class="wf-upload-control__input"
      type="file"
      accept=".xls,.xlsx,.doc,.docx,.pdf"
      :aria-label="label"
      :disabled="props.disabled"
      tabindex="-1"
      aria-hidden="true"
      @change="onChange"
    >
    <button
      type="button"
      class="wf-upload-control__action"
      :disabled="props.disabled"
      @click="open"
      @keydown.enter.prevent="open"
      @keydown.space.prevent="open"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <WfIcon
        name="upload"
        :size="20"
      />
      <span class="wf-upload-control__label">{{ label }}</span>
      <span class="wf-upload-control__hint">{{ hint }}</span>
    </button>
  </div>
</template>

<style scoped>
.wf-upload-control {
  display: flex;
  justify-content: center;
}
.wf-upload-control__input {
  position: absolute;
  inline-size: var(--wf-border-width);
  block-size: var(--wf-border-width);
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.wf-upload-control__action {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: var(--wf-space-2);
  inline-size: 100%;
  min-block-size: var(--wf-raised-action);
  padding-block: var(--wf-space-4);
  padding-inline: var(--wf-space-4);
  border: var(--wf-border-width) dashed var(--wf-border);
  border-radius: var(--wf-radius);
  background: var(--wf-primary-soft);
  color: var(--wf-primary);
  font: inherit;
  cursor: pointer;
}
.wf-upload-control__action:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.wf-upload-control__label {
  font-weight: var(--wf-weight-semibold);
}
.wf-upload-control__hint {
  color: var(--wf-ink-muted);
  font-size: var(--wf-text-sm);
}
@media (pointer: coarse) {
  .wf-upload-control__action {
    inline-size: min(100%, var(--wf-raised-action));
    block-size: var(--wf-raised-action);
    padding: 0;
  }
  .wf-upload-control__hint {
    display: none;
  }
}
</style>
