// The effective-limit rules: the defaults, the administrator override, the
// Tripoli month window from the injected clock, and the pre-sign decision
// (FR-010-FR-019, AC-027-AC-030).
import { monthStart } from '@wafar/shared';

export const defaultMonthlyLimit = 50;
export const defaultActiveLimit = 300;
export const maxMonthlyLimit = 500;
export const maxActiveLimit = 1_500;

export interface Limits {
  monthly: number;
  active: number;
}

export type LimitReason = { code: 'UPLOAD_MONTHLY_LIMIT' | 'UPLOAD_ACTIVE_LIMIT'; field: 'monthly' | 'active' };

export type LimitDecision =
  | { allowed: true }
  | { allowed: false; code: 'UPLOAD_MONTHLY_LIMIT' | 'UPLOAD_ACTIVE_LIMIT'; reasons: LimitReason[] };

/** The merchant's effective limits: the default, or the override inside its cap. */
export function effectiveLimits(overrides: {
  monthlyUploadQuotaOverride: number | null;
  activeUploadQuotaOverride: number | null;
}): Limits {
  return {
    monthly:
      overrides.monthlyUploadQuotaOverride === null
        ? defaultMonthlyLimit
        : Math.min(overrides.monthlyUploadQuotaOverride, maxMonthlyLimit),
    active:
      overrides.activeUploadQuotaOverride === null
        ? defaultActiveLimit
        : Math.min(overrides.activeUploadQuotaOverride, maxActiveLimit),
  };
}

/** The month key the counter and the record share: the injected clock's month. */
export function monthKey(now: Date): string {
  return monthStart(now);
}

/**
 * The pre-sign decision: both limits are named monthly first when both are
 * exhausted, and a file-level refusal never reaches here (FR-013, FR-016).
 */
export function decideLimits(input: {
  monthlyUsed: number;
  activeUsed: number;
  limits: Limits;
}): LimitDecision {
  const reasons: LimitReason[] = [];
  if (input.monthlyUsed >= input.limits.monthly) {
    reasons.push({ code: 'UPLOAD_MONTHLY_LIMIT', field: 'monthly' });
  }
  if (input.activeUsed >= input.limits.active) {
    reasons.push({ code: 'UPLOAD_ACTIVE_LIMIT', field: 'active' });
  }
  if (reasons.length === 0) return { allowed: true };
  const first = reasons[0];
  return {
    allowed: false,
    code: first === undefined ? 'UPLOAD_MONTHLY_LIMIT' : first.code,
    reasons,
  };
}
