<!-- The recovery page: the request, the code, and the new password, with every outcome stated and never a hint whether the number has an account (FR-014, FR-015, AC-036, AC-041). -->
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { formatPhoneForDisplay } from '@wafar/shared';
import RecoveryForm from '../../components/auth/RecoveryForm.vue';
import CodeStep from '../../components/auth/CodeStep.vue';
import NewPasswordStep from '../../components/auth/NewPasswordStep.vue';
import MessageAlert from '../../components/auth/MessageAlert.vue';
import { useAuthStep } from '../../composables/auth/useAuthStep';
import { useApi } from '../../composables/auth/useApi';
import { usePendingRequest } from '../../composables/auth/usePendingRequest';
import { messageFor, notices } from '../../composables/auth/useAuthMessages';

const step = useAuthStep();
const api = useApi();
const pending = usePendingRequest();

const message = ref('');
const status = ref('');
const codeMessage = ref('');
const displayPhone = ref('');
const typedPhone = ref('');
const remainingReRequests = ref(3);
const newPassword = ref('');
const passwordMessage = ref('');
const outcome = ref('');

onMounted(async () => {
  try {
    await api.bootstrap();
  } catch {
    message.value = messageFor({ code: 'INTERNAL_ERROR' });
  }
  const resumed = await pending.resume();
  if (resumed.status === 'live' && resumed.data.purpose === 'recovery') {
    displayPhone.value = formatPhoneForDisplay(resumed.data.phone);
    remainingReRequests.value = resumed.data.remainingReRequests;
    if (resumed.data.state === 'verified') {
      outcome.value = 'verified';
      await step.show('done');
    } else {
      await step.show('code');
    }
  }
});

function enterCodeStep(data: { phone: string; remainingReRequests: number }): void {
  displayPhone.value = formatPhoneForDisplay(data.phone);
  remainingReRequests.value = data.remainingReRequests;
  void step.show('code');
}

async function onRequest(payload: { phone: string }): Promise<void> {
  message.value = '';
  step.clearAnnouncement();
  typedPhone.value = payload.phone;
  const result = await api.post<{
    requestId: string;
    phone: string;
    remainingReRequests?: number;
  }>('/api/v1/auth/password/forgot', payload);
  if (!result.ok) {
    message.value = messageFor({
      code: result.refusal.code,
      ...(result.refusal.reason === undefined ? {} : { reason: result.refusal.reason }),
    });
    return;
  }
  pending.remember(result.data.requestId);
  const resumed = await pending.resume(result.data.requestId);
  if (resumed.status !== 'live') return;
  enterCodeStep(resumed.data);
}

async function onVerify(code: string): Promise<void> {
  const requestId = pending.requestId.value;
  if (requestId === null) return;
  codeMessage.value = '';
  const result = await api.post<{ outcome: string }>(
    '/api/v1/auth/password/forgot/verify',
    { requestId, code },
  );
  if (!result.ok) {
    if (result.refusal.code === 'OTP_REQUEST_ENDED') {
      await step.end(messageFor({ code: 'OTP_REQUEST_ENDED' }));
      return;
    }
    if (result.refusal.code === 'OTP_EXPIRED') {
      const resumed = await pending.resume(requestId);
      if (resumed.status === 'expired') {
        await step.expire(messageFor({ code: 'OTP_EXPIRED' }));
        return;
      }
    }
    codeMessage.value = messageFor({ code: result.refusal.code });
    return;
  }
  if (result.data.outcome === 'verified') {
    outcome.value = 'verified';
    await step.show('done');
    return;
  }
  outcome.value = result.data.outcome;
  pending.forget();
  await step.show('done');
}

async function onResend(): Promise<void> {
  const requestId = pending.requestId.value;
  if (requestId === null) return;
  const result = await api.post<{ remainingReRequests: number }>(
    '/api/v1/auth/verifications/resend',
    { requestId },
  );
  if (!result.ok) {
    codeMessage.value = messageFor({ code: result.refusal.code });
    return;
  }
  remainingReRequests.value = result.data.remainingReRequests;
  status.value = notices.resendAccepted;
}

async function onReset(): Promise<void> {
  const requestId = pending.requestId.value;
  if (requestId === null) return;
  passwordMessage.value = '';
  const result = await api.post<{ outcome: string }>('/api/v1/auth/password/reset', {
    requestId,
    newPassword: newPassword.value,
  });
  if (!result.ok) {
    if (result.refusal.code === 'RECOVERY_EXPIRED') {
      await step.expire(messageFor({ code: 'RECOVERY_EXPIRED' }));
      return;
    }
    passwordMessage.value = messageFor({ code: result.refusal.code });
    return;
  }
  outcome.value = result.data.outcome;
  pending.forget();
  await step.show('done');
}
</script>

<template>
  <NuxtLayout name="bare" title="استعادة كلمة المرور">
    <template #cross-links>
      <NuxtLink to="/auth/sign-in">العودة إلى تسجيل الدخول</NuxtLink>
      <NuxtLink to="/auth/sign-up">إنشاء حساب</NuxtLink>
    </template>

    <MessageAlert
      v-if="step.showsFirstStep.value"
      :message="step.announcement.value"
      :kind="step.announcementKind.value"
    />

    <RecoveryForm
      v-if="step.showsFirstStep.value"
      :loading="api.loading.value"
      :message="message"
      :initial-phone="typedPhone"
      @submit="onRequest"
    />

    <CodeStep
      v-if="step.step.value === 'code'"
      :collected="[]"
      :display-phone="displayPhone"
      :remaining-re-requests="remainingReRequests"
      :loading="api.loading.value"
      :code-message="codeMessage"
      :status-message="status"
      :can-change-number="false"
      @verify="onVerify"
      @resend="onResend"
    />

    <NewPasswordStep
      v-if="step.step.value === 'done' && outcome === 'verified'"
      v-model="newPassword"
      :message="passwordMessage"
      :loading="api.loading.value"
      @submit="onReset"
    />

    <section
      v-if="step.step.value === 'done' && outcome !== 'verified'"
      class="wf-outcome"
      role="status"
    >
      <p v-if="outcome === 'reset'">تم تغيير كلمة المرور، وانتهت كل الجلسات.</p>
      <p v-else-if="outcome === 'reset_blocked'">
        تم تغيير كلمة المرور، والحساب موقوف حاليا.
      </p>
      <p v-else-if="outcome === 'no_account'">
        لا يمكن إتمام الاستعادة لهذا الرقم. تحقق من الرقم أو أنشئ حسابا.
      </p>
      <p v-else-if="outcome === 'administrator_account'">
        هذا الحساب حساب إداري. استخدم تطبيق الإدارة.
      </p>
      <NuxtLink to="/auth/sign-in">الانتقال إلى تسجيل الدخول</NuxtLink>
    </section>
  </NuxtLayout>
</template>

<style scoped>
.wf-outcome {
  display: flex;
  flex-direction: column;
  gap: var(--wf-space-3);
}
.wf-outcome a {
  min-block-size: var(--wf-touch-floor);
  display: inline-flex;
  align-items: center;
  color: var(--wf-primary);
}
</style>
