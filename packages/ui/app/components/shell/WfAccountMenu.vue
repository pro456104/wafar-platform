<!-- The account control and its three-item menu: «حسابي», «إعدادات», and a sign-out action behind a yes/no confirmation (FR-047, contracts/ui-contracts.md §8.3). -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { AccountMenuTargets } from '@wafar/shared';
import WfIcon from '../WfIcon.vue';

withDefaults(defineProps<{ signedIn?: boolean; targets: AccountMenuTargets }>(), {
  signedIn: true,
});

const emit = defineEmits<{ signOut: [] }>();

const root = ref<HTMLElement | null>(null);
const trigger = ref<HTMLButtonElement | null>(null);
const open = ref(false);
const confirming = ref(false);

function confirmSignOut(): void {
  confirming.value = false;
  open.value = false;
  emit('signOut');
}

/** Escape dismisses the confirmation first, then the menu, and returns focus. */
function onKeyDown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return;
  if (confirming.value) {
    confirming.value = false;
    return;
  }
  if (!open.value) return;
  open.value = false;
  trigger.value?.focus();
}

/** An activation outside the control dismisses the menu (contracts/ui-contracts.md §8.3). */
function onPointerDown(event: PointerEvent): void {
  if (!open.value || confirming.value) return;
  const target = event.target;
  if (target instanceof Node && root.value !== null && root.value.contains(target)) return;
  open.value = false;
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('pointerdown', onPointerDown, true);
});
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('pointerdown', onPointerDown, true);
});
</script>

<template>
  <div
    v-if="signedIn"
    ref="root"
    class="wf-account-menu"
  >
    <button
      ref="trigger"
      type="button"
      class="wf-account-menu__trigger"
      :aria-expanded="open"
      aria-haspopup="menu"
      aria-label="حسابي"
      @click="open = !open"
    >
      <WfIcon name="profile" />
    </button>

    <div
      v-if="open"
      class="wf-account-menu__panel"
      role="menu"
      aria-label="حسابي"
    >
      <NuxtLink
        class="wf-account-menu__item"
        :to="targets.profile"
        role="menuitem"
      >
        حسابي
      </NuxtLink>
      <NuxtLink
        class="wf-account-menu__item"
        :to="targets.settings"
        role="menuitem"
      >
        إعدادات
      </NuxtLink>
      <button
        type="button"
        class="wf-account-menu__item wf-account-menu__signout"
        role="menuitem"
        @click="confirming = true"
      >
        <WfIcon
          name="sign-out"
          :size="16"
        />
        تسجيل الخروج
      </button>
    </div>

    <div
      v-if="confirming"
      class="wf-account-menu__confirm"
      role="alertdialog"
      aria-labelledby="wf-signout-title"
    >
      <p id="wf-signout-title">
        هل تريد تسجيل الخروج؟
      </p>
      <div class="wf-account-menu__actions">
        <button
          type="button"
          class="wf-account-menu__confirm-action"
          @click="confirmSignOut"
        >
          تسجيل الخروج
        </button>
        <button
          type="button"
          class="wf-account-menu__cancel"
          @click="confirming = false"
        >
          إلغاء
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wf-account-menu {
  position: relative;
}
.wf-account-menu__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--wf-space-1);
  min-block-size: var(--wf-touch-floor);
  min-inline-size: var(--wf-touch-floor);
  padding-inline: var(--wf-space-2);
  border: var(--wf-border-width) solid var(--wf-border);
  border-radius: var(--wf-radius);
  background: var(--wf-surface);
  color: var(--wf-ink);
  font: inherit;
}
.wf-account-menu__panel {
  position: absolute;
  inset-block-start: calc(100% + var(--wf-space-1));
  inset-inline-end: 0;
  z-index: var(--wf-z-overlay);
  min-inline-size: 12rem;
  border: var(--wf-border-width) solid var(--wf-border);
  border-radius: var(--wf-radius);
  background: var(--wf-surface);
  box-shadow: 0 8px 24px var(--wf-border-subtle);
}
.wf-account-menu__item {
  display: flex;
  align-items: center;
  gap: var(--wf-space-2);
  inline-size: 100%;
  min-block-size: var(--wf-touch-floor);
  padding-inline: var(--wf-space-3);
  border: 0;
  background: transparent;
  color: var(--wf-ink);
  font: inherit;
  text-align: start;
  text-decoration: none;
}
.wf-account-menu__confirm {
  position: absolute;
  inset-block-start: calc(100% + var(--wf-space-1));
  inset-inline-end: 0;
  z-index: var(--wf-z-toast);
  inline-size: 16rem;
  padding: var(--wf-space-3);
  border: var(--wf-border-width) solid var(--wf-border);
  border-radius: var(--wf-radius);
  background: var(--wf-surface);
}
.wf-account-menu__actions {
  display: flex;
  gap: var(--wf-space-2);
}
</style>
