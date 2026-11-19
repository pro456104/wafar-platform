<!-- The Upload Catalog page: the eleven presentations of the UI contract. -->
<!-- The fixed block order, the two live regions, and the state machine composed
     from the layer and the page's own panels (FR-001-FR-008, FR-051-FR-060). -->
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { bareRoutes } from '@wafar/shared';
import { useSession } from '../composables/auth/useSession';
import { useQuota } from '../composables/upload/useQuota';
import { useUpload, type FocusTarget } from '../composables/upload/useUpload';

definePageMeta({ middleware: 'merchant', layout: 'shell' });

const session = useSession();
const accountKey = computed(() => session.data.value?.user?.fullName ?? 'anonymous');

const quota = useQuota(accountKey.value);

const polite = ref('');
const assertive = ref('');
const politeRegion = ref<HTMLElement | null>(null);
const assertiveRegion = ref<HTMLElement | null>(null);

const upload = useUpload({
  onOutcome: () => quota.invalidate(),
  announce: (channel, text) => {
    if (channel === 'polite') {
      polite.value = '';
      void nextTick(() => {
        polite.value = text;
      });
    } else {
      assertive.value = '';
      void nextTick(() => {
        assertive.value = text;
      });
    }
  },
  focus: (target: FocusTarget) => {
    void nextTick(() => {
      if (target === null) return;
      if (target === 'control') {
        document.querySelector<HTMLElement>('[data-upload-control] button')?.focus();
        return;
      }
      if (target === 'ended') {
        document.querySelector<HTMLElement>('.wf-ended-session__heading')?.focus();
        return;
      }
      const id =
        target === 'card'
          ? 'wf-selected-file-heading'
          : target === 'success'
            ? 'upload-success-heading'
            : target === 'duplicate'
              ? 'upload-duplicate-heading'
              : target === 'quota'
                ? 'wf-quota-heading'
                : 'upload-error-heading';
      document.getElementById(id)?.focus();
    });
  },
});

const withheld = computed(
  () => quota.exhausted.value.length > 0 || upload.limitRefused.value,
);
// One submission surface at a time: the control exists only while the page is
// choosing (FR-006, AC-003).
const choosing = computed(() => upload.state.value === 'choosing');

// The door admits an ended session so the page can state it; the page then
// reads the reason from the session resource rather than from a refusal
// (FR-004, FR-049; AC-002, AC-010).
const sessionEnded = computed<'ended' | 'blocked' | null>(() => {
  const payload = session.data.value;
  if (payload === undefined || payload.authenticated !== false) return null;
  if (payload.ended === 'ACCOUNT_BLOCKED') return 'blocked';
  if (payload.ended === 'SESSION_ENDED') return 'ended';
  return null;
});

const endedVariant = computed<'ended' | 'blocked' | null>(
  () => upload.ended.value ?? sessionEnded.value,
);

watch(sessionEnded, (variant) => {
  if (variant === null) return;
  upload.markEnded(variant);
});

// The session and account are re-read while the page is open and during a
// transfer, so an ended session or a blocked account replaces the progress
// state at once rather than at the next request (FR-004, FR-050; AC-002,
// AC-010; plan threat T12).
let sessionTimer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  sessionTimer = setInterval(() => {
    if (document.visibilityState === 'visible') void session.refetch();
  }, 15_000);
});
onBeforeUnmount(() => {
  if (sessionTimer !== null) clearInterval(sessionTimer);
});

watch(
  () => quota.exhausted.value.length,
  (length, previous) => {
    if (length > 0 && previous === 0) {
      assertive.value = 'بلغت حد الرفع.';
    }
  },
);

function chooseAnother(): void {
  upload.reset();
}
</script>

<template>
  <div class="upload-page">
    <WfEndedSession
      v-if="endedVariant !== null"
      :variant="endedVariant"
      :sign-in-path="bareRoutes.signIn"
    />

    <template v-else>
      <header class="upload-page__header">
        <h1 class="upload-page__title">
          رفع كتالوج
        </h1>
        <p class="upload-page__subtitle">
          ملف مورد واحد: Excel أو PDF أو Word حتى 100 MB. المعالجة تبدأ تلقائيا.
        </p>
      </header>

      <p
        ref="politeRegion"
        class="upload-page__region"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ polite }}
      </p>
      <p
        ref="assertiveRegion"
        class="upload-page__region"
        aria-live="assertive"
        aria-atomic="true"
      >
        {{ assertive }}
      </p>

      <WfQuotaBlock
        :state="quota.state.value"
        :monthly="quota.quota.value?.monthly ?? { used: 0, limit: 50 }"
        :active="quota.quota.value?.active ?? { used: 0, limit: 300 }"
        :exhausted="quota.exhausted.value"
        :numbers-hidden="quota.state.value === 'failed' && quota.quota.value !== null"
        @refresh="quota.refresh"
      />

      <div
        v-if="choosing && !withheld"
        data-upload-control
      >
        <WfUploadControl
          :disabled="upload.state.value === 'uploading' || upload.state.value === 'screening'"
          @select="upload.select"
          @multi-file="upload.announceMultiFile"
        />
        <p class="upload-page__format-line">
          <span>Excel (xls، xlsx) · PDF · Word (doc، docx) — حتى 100 MB</span>
        </p>
      </div>

      <UploadNotice :visible="upload.multiFileVisible.value" />

      <WfSelectedFile
        v-if="
          upload.state.value === 'uploading' ||
            upload.state.value === 'screening' ||
            upload.state.value === 'selected'
        "
        :name="upload.fileName.value"
        :byte-size="upload.byteSize.value"
        :format="upload.formatName()"
      />

      <WfUploadProgress
        v-if="
          upload.state.value === 'selected' ||
            upload.state.value === 'uploading' ||
            upload.state.value === 'screening'
        "
        :phase="upload.phase.value"
        :percent="upload.percent.value"
        @cancel="upload.cancel"
      />

      <UploadDuplicate
        v-if="upload.state.value === 'duplicate' && upload.duplicate.value !== null"
        :original="upload.duplicate.value"
        :withheld="withheld"
        @upload-another="chooseAnother"
      />

      <UploadSuccess
        v-if="upload.state.value === 'success' && upload.catalog.value !== null"
        :file-name="upload.catalog.value.fileName"
        :withheld="withheld"
        @upload-another="chooseAnother"
      />

      <UploadError
        v-if="upload.state.value === 'error'"
        :code="upload.errorCode.value"
        :retry-after-seconds="upload.retryAfterSeconds.value"
        :withheld="withheld"
        @retry="upload.retry"
        @choose-another="chooseAnother"
      />
    </template>
  </div>
</template>

<style scoped>
.upload-page {
  display: flex;
  flex-direction: column;
  gap: var(--wf-space-5);
  max-inline-size: 48rem;
}
.upload-page__header {
  display: flex;
  flex-direction: column;
  gap: var(--wf-space-2);
}
.upload-page__title {
  margin: 0;
  font-size: var(--wf-text-2xl);
}
.upload-page__subtitle {
  margin: 0;
  color: var(--wf-ink-muted);
}
.upload-page__region {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  margin: 0;
}
.upload-page__format-line {
  margin-block-start: var(--wf-space-2);
  margin-inline: 0;
  color: var(--wf-ink-muted);
  font-size: var(--wf-text-sm);
  text-align: center;
}
</style>
