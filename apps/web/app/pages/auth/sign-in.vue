<!-- The sign-in page: no code, one uniform failure text, no lock copy, and no address, history entry, or stored value carrying the number (FR-007, FR-008, FR-009, AC-002, AC-008, AC-009, AC-044). -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import SignInForm from '../../components/auth/SignInForm.vue';
import MessageAlert from '../../components/auth/MessageAlert.vue';
import { useApi } from '../../composables/auth/useApi';
import { messageFor } from '../../composables/auth/useAuthMessages';

const api = useApi();
const message = ref('');
const signedIn = ref(false);

onMounted(async () => {
  try {
    await api.bootstrap();
  } catch {
    message.value = messageFor({ code: 'INTERNAL_ERROR' });
  }
});

const showForm = computed(() => !signedIn.value);

async function onSubmit(payload: { phone: string; password: string }): Promise<void> {
  message.value = '';
  const result = await api.post<{ outcome: string }>('/api/v1/auth/sign-in', payload);
  if (!result.ok) {
    message.value = messageFor({ code: result.refusal.code });
    return;
  }
  signedIn.value = true;
}
</script>

<template>
  <NuxtLayout name="bare" title="تسجيل الدخول">
    <template #cross-links>
      <NuxtLink to="/auth/sign-up">ليس لديك حساب؟ أنشئ حسابا</NuxtLink>
      <NuxtLink to="/auth/forgot-password">نسيت كلمة المرور</NuxtLink>
    </template>

    <SignInForm
      v-if="showForm"
      :loading="api.loading.value"
      :message="message"
      @submit="onSubmit"
    />

    <section v-else class="wf-signed-in" role="status">
      <MessageAlert message="تم تسجيل الدخول." kind="status" />
      <NuxtLink to="/">الرئيسية</NuxtLink>
    </section>
  </NuxtLayout>
</template>

<style scoped>
.wf-signed-in {
  display: flex;
  flex-direction: column;
  gap: var(--wf-space-3);
}
.wf-signed-in a {
  min-block-size: var(--wf-touch-floor);
  display: inline-flex;
  align-items: center;
  color: var(--wf-primary);
}
</style>
