// The error envelope of contracts/auth-api.md §3 extended by the intake's
// closed seventeen (contracts/intake-api.md §3): one shape, one status table,
// and no message field — the Arabic text is the page's (FR-064).
import type { Context } from 'hono';
import type { FieldErrorReason, RefusalCode } from '@wafar/shared';
import { intakeEnvelopeSchema, type IntakeEnvelope } from '@wafar/shared';

export interface RefusalSpec {
  status: number;
  retryable: boolean;
}

/** The platform union's one row per code, 26 + 17 = 43 (row 26). */
export const refusals: Record<RefusalCode, RefusalSpec> = {
  CSRF_FAILED: { status: 403, retryable: false },
  RATE_LIMITED: { status: 429, retryable: true },
  FORM_TOO_FAST: { status: 400, retryable: true },
  PAYLOAD_TOO_LARGE: { status: 413, retryable: false },
  INVALID_PHONE: { status: 400, retryable: false },
  INVALID_FULL_NAME: { status: 400, retryable: false },
  INVALID_SHOP_NAME: { status: 400, retryable: false },
  CITY_NOT_IN_LIST: { status: 400, retryable: false },
  PASSWORD_TOO_SHORT: { status: 400, retryable: false },
  PASSWORD_TOO_LONG: { status: 400, retryable: false },
  PASSWORD_TOO_COMMON: { status: 400, retryable: false },
  PASSWORD_UNCHANGED: { status: 400, retryable: false },
  AUTH_INVALID_CREDENTIALS: { status: 401, retryable: false },
  OTP_INCORRECT: { status: 400, retryable: false },
  OTP_EXPIRED: { status: 400, retryable: true },
  OTP_REQUEST_ENDED: { status: 400, retryable: true },
  OTP_RESEND_LIMIT: { status: 400, retryable: true },
  OTP_SEND_FAILED: { status: 502, retryable: true },
  RECOVERY_EXPIRED: { status: 400, retryable: true },
  SESSION_ENDED: { status: 401, retryable: false },
  ACCOUNT_BLOCKED: { status: 401, retryable: false },
  PASSWORD_CHANGE_REQUIRED: { status: 403, retryable: false },
  ACCOUNT_CREATION_FAILED: { status: 500, retryable: true },
  INTERNAL_ERROR: { status: 500, retryable: true },
  NOT_FOUND: { status: 404, retryable: false },
  METHOD_NOT_ALLOWED: { status: 405, retryable: false },
  UPLOAD_INVALID_REQUEST: { status: 400, retryable: false },
  UPLOAD_INVALID_NAME: { status: 400, retryable: false },
  UPLOAD_UNSUPPORTED_FORMAT: { status: 400, retryable: false },
  UPLOAD_TOO_LARGE: { status: 413, retryable: false },
  UPLOAD_EMPTY: { status: 400, retryable: false },
  UPLOAD_CONTENT_MISMATCH: { status: 400, retryable: false },
  UPLOAD_CORRUPT: { status: 400, retryable: false },
  UPLOAD_PASSWORD_PROTECTED: { status: 400, retryable: false },
  UPLOAD_INFECTED: { status: 400, retryable: false },
  UPLOAD_EXPANSION_CAP: { status: 400, retryable: false },
  UPLOAD_SANITIZATION_FAILED: { status: 400, retryable: false },
  UPLOAD_SCAN_UNAVAILABLE: { status: 502, retryable: true },
  UPLOAD_TOO_MANY_ATTEMPTS: { status: 429, retryable: true },
  UPLOAD_MONTHLY_LIMIT: { status: 409, retryable: false },
  UPLOAD_ACTIVE_LIMIT: { status: 409, retryable: false },
  UPLOAD_STORAGE_UNAVAILABLE: { status: 503, retryable: true },
  UPLOAD_INCOMPLETE: { status: 409, retryable: false },
};

export interface RefusalOptions {
  field?: string;
  reason?: FieldErrorReason;
  retryAfterSeconds?: number;
  details?: { code: RefusalCode; field?: string; reason?: FieldErrorReason }[];
}

export function refusalBody(code: RefusalCode, options: RefusalOptions = {}): IntakeEnvelope {
  const body: IntakeEnvelope = { error: { code, retryable: refusals[code].retryable } };
  if (options.field !== undefined) body.error.field = options.field;
  if (options.reason !== undefined) body.error.reason = options.reason;
  if (options.retryAfterSeconds !== undefined) {
    body.error.retryAfterSeconds = options.retryAfterSeconds;
  }
  if (options.details !== undefined && options.details.length > 1) {
    body.error.details = options.details;
  }
  return intakeEnvelopeSchema.parse(body);
}

/** Answers a refusal with the envelope's status and the given extra headers. */
export function refuse(
  c: Context,
  code: RefusalCode,
  options: RefusalOptions = {},
  headers: Record<string, string> = {},
): Response {
  const body = refusalBody(code, options);
  for (const [name, value] of Object.entries(headers)) c.header(name, value);
  if (options.retryAfterSeconds !== undefined) {
    c.header('Retry-After', String(options.retryAfterSeconds));
  }
  return c.json(body, refusals[code].status as 400);
}

/** Answers a value-failure list: the first entry is the envelope's code. */
export function refuseDetails(
  c: Context,
  details: { code: RefusalCode; field?: string; reason?: FieldErrorReason }[],
): Response {
  const first = details[0];
  if (first === undefined) throw new Error('refuseDetails needs at least one failure');
  const options: RefusalOptions = { details };
  if (first.field !== undefined) options.field = first.field;
  if (first.reason !== undefined) options.reason = first.reason;
  return refuse(c, first.code, options);
}
