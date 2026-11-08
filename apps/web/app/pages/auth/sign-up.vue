<!-- The sign-up page: the form, the in-place code step, the resume-on-reload tie, and the two endings. A 202 chooses no step: only the resume read's 200 enters the code step, so the silent refusal leaves the page on the form (FR-038, FR-041, AC-031, AC-044). -->
<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { formatPhoneForDisplay } from '@wafar/shared';
import SignUpForm from '../../components/auth/SignUpForm.vue';
import CodeStep from '../../components/auth/CodeStep.vue';
import MessageAlert from '../../components/auth/MessageAlert.vue';
import { useAuthStep } from '../../composables/auth/useAuthStep';
import { useApi } from '../../composables/auth/useApi';
import { usePendingRequest } from '../../composables/auth/usePendingRequest';
import { messageFor, notices } from '../../composables/auth/useAuthMessages';

const step = useAuthStep();
const api = useApi();
const pending = usePendingRequest();

const formStamp = ref('');
const message = ref('');
const status = ref('');
const collected = ref<{ label: string; value: string; ltr?: boolean }[]>([]);
const displayPhone = ref('');
const remainingReRequests = ref(3);
const codeMessage = ref('');
const outcome = ref('');
const formValues = ref<Record<string, string>>({});
const refusedField = ref<string | null>(null);

const showForm = computed(() => step.showsFirstStep.value);
const showCode = computed(() => step.step.value === 'code');
const showDone = computed(() => step.step.value === 'done');

onMounted(async () => {
  try {
    const pair = await api.bootstrap();
    formStamp.value = pair.formStamp;
  } catch {
    message.value = messageFor({ code: 'INTERNAL_ERROR' });
  }
  const resumed = await pending.resume();
  if (resumed.status === 'live' && resumed.data.purpose === 'sign_up') {
    enterCodeStep(resumed.data);
  }
});

function enterCodeStep(data: {
  requestId: string;
  phone: string;
  remainingReRequests: number;
  payload?: { fullName: string; city: string; shopName?: string };
}): void {
  pending.remember(data.requestId);
  displayPhone.value = formatPhoneForDisplay(data.phone);
  remainingReRequests.value = data.remainingReRequests;
  collected.value = [
    ...(data.payload === undefined
      ? []
      : [
          { label: 'الاسم الكامل', value: data.payload.fullName },
          { label: 'المدينة', value: data.payload.city },
          ...(data.payload.shopName === undefined
            ? []
            : [{ label: 'اسم المحل', value: data.payload.shopName }]),
        ]),
  ];
  void step.show('code');
}

async function focusFirstField(): Promise<void> {
  await nextTick();
  document
    .querySelector<HTMLInputElement>('.bare-layout__card form input')
    ?.focus();
}

async function onSubmit(payload: Record<string, string>): Promise<void> {
  message.value = '';
  refusedField.value = null;
  step.clearAnnouncement();
  formValues.value = payload;
  const result = await api.post<{
    requestId: string;
    phone: string;
    codeExpiresAt: string;
    expiresAt: string;
  }>('/api/v1/auth/sign-up', payload);
  if (!result.ok) {
    message.value = messageFor({
      code: result.refusal.code,
      ...(result.refusal.reason === undefined ? {} : { reason: result.refusal.reason }),
    });
    refusedField.value = result.refusal.field ?? null;
    // The retry takes the refreshed stamp, with no reload (FR-029, AC-031).
    if (result.refusal.code === 'FORM_TOO_FAST') {
      formStamp.value = await api.stamp();
    }
    return;
  }

  // A 202 chooses no step. The read decides: 200 enters the code step, and an
  // unknown request leaves the form unchanged and silent.
  pending.remember(result.data.requestId);
  const resumed = await pending.resume(result.data.requestId);
  if (resumed.status !== 'live') return;
  enterCodeStep(resumed.data);
}

async function onVerify(code: string): Promise<void> {
  const requestId = pending.requestId.value;
  if (requestId === null) return;
  codeMessage.value = '';
  const result = await api.post<{ outcome: string }>('/api/v1/auth/sign-up/verify', {
    requestId,
    code,
  });
  if (!result.ok) {
    if (result.refusal.code === 'OTP_REQUEST_ENDED') {
      pending.forget();
      await step.end(messageFor({ code: 'OTP_REQUEST_ENDED' }));
      await focusFirstField();
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

  outcome.value = result.data.outcome;
  if (result.data.outcome === 'created') {
    pending.forget();
    status.value = notices.signedInAfterVerification;
    await step.show('done');
    return;
  }
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
    if (result.refusal.code === 'OTP_EXPIRED') {
      await step.expire(messageFor({ code: 'OTP_EXPIRED' }));
      return;
    }
    codeMessage.value = messageFor({ code: result.refusal.code });
    return;
  }
  remainingReRequests.value = result.data.remainingReRequests;
  status.value = notices.resendAccepted;
  codeMessage.value = '';
}

function onGoHome(): void {
  window.location.assign('/');
}

async function onChangeNumber(): Promise<void> {
  pending.forget();
  status.value = '';
  codeMessage.value = '';
  step.clearAnnouncement();
  await step.show('form');
  await focusFirstField();
}
</script>

<template>
  <NuxtLayout name="bare" title="إنشاء حساب">
    <template #cross-links>
      <NuxtLink to="/auth/sign-in">لديك حساب؟ سجل الدخول</NuxtLink>
      <NuxtLink to="/auth/forgot-password">نسيت كلمة المرور</NuxtLink>
    </template>

    <MessageAlert v-if="showForm" :message="status" kind="status" />
    <MessageAlert
      v-if="showForm"
      :message="step.announcement.value"
      :kind="step.announcementKind.value"
    />

    <SignUpForm
      v-if="showForm"
      :form-stamp="formStamp"
      :loading="api.loading.value"
      :message="message"
      :initial="formValues"
      :refused-field="refusedField"
      @submit="onSubmit"
    />

    <CodeStep
      v-if="showCode"
      :collected="collected"
      :display-phone="displayPhone"
      :remaining-re-requests="remainingReRequests"
      :loading="api.loading.value"
      :code-message="codeMessage"
      :status-message="status"
      @verify="onVerify"
      @resend="onResend"
      @change-number="onChangeNumber"
    />

    <section v-if="showDone" class="wf-outcome" role="status">
      <p v-if="outcome === 'created'">{{ notices.signedInAfterVerification }}</p>
      <p v-else-if="outcome === 'existing_account'">
        لديك حساب بالفعل. سجل الدخول أو استعد كلمة المرور.
      </p>
      <p v-else-if="outcome === 'blocked_account'">
        لا يمكن استخدام هذا الحساب الآن. تواصل مع الدعم.
      </p>
      <p v-else-if="outcome === 'administrator_account'">
        هذا الحساب حساب إداري. استخدم تطبيق الإدارة.
      </p>
      <NuxtLink to="/auth/sign-in">الانتقال إلى تسجيل الدخول</NuxtLink>
      <button type="button" @click="onGoHome">الرئيسية</button>
    </section>
  </NuxtLayout>
</template>

<style scoped>
.wf-outcome {
  display: flex;
  flex-direction: column;
  gap: var(--wf-space-3);
}
.wf-outcome a,
.wf-outcome button {
  min-block-size: var(--wf-touch-floor);
  display: inline-flex;
  align-items: center;
  color: var(--wf-primary);
}
</style>
