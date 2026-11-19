// The refusal catalogue's conformance: the contract's closed error-code union,
// each row's status and retryability, one producer for every code and no code
// outside the union, one text per fixed design value asserted as identity
// between the cases that share it, the retry affordance on a retryable refusal
// and none on a non-retryable one, and the transport's four answers listed with
// their producing suite (FR-008, FR-009, FR-034, FR-040, FR-044, FR-053;
// AC-009, AC-010, AC-036, AC-043, AC-048, AC-056; T168).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  authErrorCodes,
  intakeErrorCodes,
  type RefusalCode,
} from '@wafar/shared';
import { users } from '@wafar/db';
import { lockMinutes, otpLifetimeSeconds } from '@wafar/shared';
import {
  bootstrap,
  call,
  createHarness,
  hasDatabase,
  seedAccount,
  type CookieJar,
} from '../../support/harness.ts';
import { refusals } from '../../../src/http/errors.ts';

const contractPath = join(
  'specs',
  '001-identity-foundation',
  'contracts',
  'auth-api.md',
);
const intakeContractPath = join(
  'specs',
  '002-file-intake',
  'contracts',
  'intake-api.md',
);

/** The suite that produces each code, and what asserts it. */
interface Producer {
  suite: string;
  criterion: string;
}

const producers: Record<RefusalCode, Producer> = {
  CSRF_FAILED: { suite: 'apps/api/test/integration/http/transport-refusals.spec.ts', criterion: 'AC-048' },
  RATE_LIMITED: { suite: 'apps/api/test/integration/auth/rate-limits.spec.ts', criterion: 'AC-033' },
  FORM_TOO_FAST: { suite: 'apps/api/test/integration/auth/sign-up-abuse-cases.spec.ts', criterion: 'AC-032' },
  PAYLOAD_TOO_LARGE: { suite: 'apps/api/test/integration/http/transport-refusals.spec.ts', criterion: 'transport' },
  INVALID_PHONE: { suite: 'apps/api/test/integration/auth/sign-in.spec.ts', criterion: 'AC-003' },
  INVALID_FULL_NAME: { suite: 'apps/api/test/integration/auth/sign-up.spec.ts', criterion: 'AC-046' },
  INVALID_SHOP_NAME: { suite: 'apps/api/test/integration/auth/refusal-order.spec.ts', criterion: 'AC-046' },
  CITY_NOT_IN_LIST: { suite: 'apps/api/test/integration/auth/refusal-race.spec.ts', criterion: 'AC-005' },
  PASSWORD_TOO_SHORT: { suite: 'apps/api/test/integration/auth/refusal-order.spec.ts', criterion: 'AC-037' },
  PASSWORD_TOO_LONG: { suite: 'packages/shared/src/contracts/__tests__/sign-up.spec.ts', criterion: 'AC-037' },
  PASSWORD_TOO_COMMON: { suite: 'apps/api/src/modules/auth/service/__tests__/password-policy.spec.ts', criterion: 'AC-037' },
  PASSWORD_UNCHANGED: { suite: 'apps/api/test/integration/auth/administrator-first-sign-in.spec.ts', criterion: 'AC-030' },
  AUTH_INVALID_CREDENTIALS: { suite: 'apps/api/test/integration/auth/sign-in.spec.ts', criterion: 'AC-009' },
  OTP_INCORRECT: { suite: 'apps/api/test/integration/auth/refusal-race.spec.ts', criterion: 'AC-036' },
  OTP_EXPIRED: { suite: 'apps/api/test/integration/auth/clock-bounds.spec.ts', criterion: 'AC-036' },
  OTP_REQUEST_ENDED: { suite: 'apps/api/test/integration/auth/recovery-rate-limit.spec.ts', criterion: 'AC-041' },
  OTP_RESEND_LIMIT: { suite: 'apps/api/test/integration/auth/code-dispatch-ceiling.spec.ts', criterion: 'AC-035' },
  OTP_SEND_FAILED: { suite: 'apps/api/test/integration/auth/sms-failure-matrix.spec.ts', criterion: 'AC-047' },
  RECOVERY_EXPIRED: { suite: 'apps/api/test/integration/auth/recovery.spec.ts', criterion: 'AC-016' },
  SESSION_ENDED: { suite: 'apps/api/test/integration/auth/sessions.spec.ts', criterion: 'AC-053' },
  ACCOUNT_BLOCKED: { suite: 'apps/api/test/integration/users/status.spec.ts', criterion: 'AC-021' },
  PASSWORD_CHANGE_REQUIRED: { suite: 'apps/api/test/integration/auth/administrator-first-sign-in.spec.ts', criterion: 'AC-030' },
  ACCOUNT_CREATION_FAILED: { suite: 'apps/api/test/integration/auth/atomic-writes.spec.ts', criterion: 'AC-004' },
  INTERNAL_ERROR: { suite: 'apps/api/test/integration/auth/atomic-writes.spec.ts', criterion: 'AC-043' },
  NOT_FOUND: { suite: 'apps/api/test/integration/http/isolation.spec.ts', criterion: 'AC-056' },
  METHOD_NOT_ALLOWED: { suite: 'apps/api/test/integration/http/transport-refusals.spec.ts', criterion: 'transport' },
  UPLOAD_INVALID_REQUEST: { suite: 'apps/api/test/integration/catalogs/intake.spec.ts', criterion: 'AC-005' },
  UPLOAD_INVALID_NAME: { suite: 'apps/api/test/integration/catalogs/intake.spec.ts', criterion: 'AC-005' },
  UPLOAD_UNSUPPORTED_FORMAT: { suite: 'apps/api/test/integration/catalogs/intake.spec.ts', criterion: 'AC-005' },
  UPLOAD_TOO_LARGE: { suite: 'apps/api/test/integration/catalogs/intake.spec.ts', criterion: 'AC-004' },
  UPLOAD_EMPTY: { suite: 'apps/api/test/integration/catalogs/intake.spec.ts', criterion: 'AC-005' },
  UPLOAD_CONTENT_MISMATCH: { suite: 'apps/api/test/integration/catalogs/safety.spec.ts', criterion: 'AC-006' },
  UPLOAD_CORRUPT: { suite: 'apps/api/test/integration/catalogs/safety.spec.ts', criterion: 'AC-006' },
  UPLOAD_PASSWORD_PROTECTED: { suite: 'apps/api/test/integration/catalogs/safety.spec.ts', criterion: 'AC-006' },
  UPLOAD_INFECTED: { suite: 'apps/api/test/integration/catalogs/safety.spec.ts', criterion: 'AC-018' },
  UPLOAD_EXPANSION_CAP: { suite: 'apps/api/test/integration/catalogs/safety.spec.ts', criterion: 'AC-016' },
  UPLOAD_SANITIZATION_FAILED: { suite: 'apps/api/test/integration/catalogs/safety.spec.ts', criterion: 'AC-017' },
  UPLOAD_SCAN_UNAVAILABLE: { suite: 'apps/api/test/integration/catalogs/safety.spec.ts', criterion: 'AC-018' },
  UPLOAD_TOO_MANY_ATTEMPTS: { suite: 'apps/api/test/integration/catalogs/quota-contracts.spec.ts', criterion: 'AC-050' },
  UPLOAD_MONTHLY_LIMIT: { suite: 'apps/api/test/integration/catalogs/quota-contracts.spec.ts', criterion: 'AC-029' },
  UPLOAD_ACTIVE_LIMIT: { suite: 'apps/api/test/integration/catalogs/quota-contracts.spec.ts', criterion: 'AC-029' },
  UPLOAD_STORAGE_UNAVAILABLE: { suite: 'apps/api/test/integration/catalogs/intake.spec.ts', criterion: 'AC-009' },
  UPLOAD_INCOMPLETE: { suite: 'apps/api/test/integration/catalogs/intake.spec.ts', criterion: 'AC-005' },
};

/**
 * String literals the suite scan must not read as a refusal code: the
 * environment schema names variables in its own suites (the boot guard T296,
 * and the integration harness), and a variable is not a code.
 */
const notCodes = new Set(['DATABASE_URL', 'NODE_ENV', 'BETTER_AUTH_SECRET']);

interface ContractRow {
  code: string;
  status: number;
  retryable: boolean;
}

function contractRows(): ContractRow[] {
  const text = readFileSync(contractPath, 'utf8');
  const section = text.slice(text.indexOf('### 3.1 Codes'), text.indexOf('## 4. Refusal order'));
  const rows: ContractRow[] = [];
  for (const line of section.split('\n')) {
    const match = /^\|\s*`([A-Z_]+)`\s*\|\s*(\d{3})\s*\|\s*(yes|no)\s*\|/.exec(line);
    if (match === null) continue;
    rows.push({
      code: match[1] as string,
      status: Number.parseInt(match[2] as string, 10),
      retryable: match[3] === 'yes',
    });
  }
  return rows;
}

/** The intake contract's own code table: the seventeen second set. */
function intakeContractRows(): ContractRow[] {
  const text = readFileSync(intakeContractPath, 'utf8');
  const section = text.slice(text.indexOf('### 3.1 Codes'), text.indexOf('### 3.2'));
  const rows: ContractRow[] = [];
  for (const line of section.split('\n')) {
    const match = /^\|\s*`([A-Z_]+)`\s*\|\s*(\d{3})\s*\|\s*(yes|no)\s*\|/.exec(line);
    if (match === null) continue;
    rows.push({
      code: match[1] as string,
      status: Number.parseInt(match[2] as string, 10),
      retryable: match[3] === 'yes',
    });
  }
  return rows;
}

function specText(): string {
  return readFileSync(join('specs', '001-identity-foundation', 'spec.md'), 'utf8');
}

function suiteFiles(): string[] {
  const roots = [
    'apps/api/test',
    'apps/api/src',
    'apps/web/tests',
    'packages/shared/src',
    'packages/ui/tests',
  ];
  const files: string[] = [];
  const walk = (directory: string): void => {
    for (const entry of readdirSync(directory)) {
      if (entry === 'node_modules') continue;
      const full = join(directory, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith('.spec.ts')) files.push(full.replace(/\\/g, '/'));
    }
  };
  for (const root of roots) walk(root);
  return files;
}

function refusalBody(response: { body: unknown }): unknown {
  return response.body;
}

const harness = hasDatabase ? createHarness() : null;
const password = 'correct horse battery staple';

async function startSignUp(jar: CookieJar, phone: string) {
  const pair = await bootstrap(harness!, jar);
  harness!.clock.advance(4000);
  const started = await call(
    harness!,
    'POST',
    '/api/v1/auth/sign-up',
    {
      fullName: 'محمد علي',
      phone,
      password,
      city: 'طرابلس',
      website: '',
      formStamp: pair.formStamp,
    },
    { jar, csrf: true },
  );
  expect(started.status).toBe(202);
  return {
    requestId: (started.body as { requestId: string }).requestId,
    code: harness!.sms.lastCode() ?? '',
  };
}

describe.skipIf(!hasDatabase)('the refusal catalogue', () => {
  beforeAll(async () => {
    await harness!.reset();
  });
  beforeEach(async () => {
    await harness!.reset();
  });
  afterAll(async () => {
    await harness!.close();
  });

  it('matches the two contract tables exactly: 43 codes, each status and retryability', () => {
    const rows = [...contractRows(), ...intakeContractRows()];
    expect(rows).toHaveLength(43);
    expect(authErrorCodes).toHaveLength(26);
    expect(intakeErrorCodes).toHaveLength(17);
    expect([...authErrorCodes, ...intakeErrorCodes].sort()).toEqual(
      rows.map((row) => row.code).sort(),
    );

    for (const row of rows) {
      expect(refusals[row.code as RefusalCode]).toEqual({
        status: row.status,
        retryable: row.retryable,
      });
    }
  });

  it('names one producer for every code in the union of 43', () => {
    for (const code of [...authErrorCodes, ...intakeErrorCodes]) {
      const producer = producers[code];
      expect(producer, `${code} has no producer`).toBeDefined();
      const text = readFileSync(producer.suite, 'utf8');
      expect(text, `${producer.suite} does not produce ${code}`).toContain(`'${code}'`);
    }
    expect(Object.keys(producers)).toHaveLength(43);
  });

  it('names one producer and one criterion for every code, and no code outside the union', () => {
    const spec = specText();
    const union = new Set<string>([...authErrorCodes, ...intakeErrorCodes]);

    for (const code of authErrorCodes) {
      const producer = producers[code];
      expect(producer, `${code} has no producer`).toBeDefined();
      const text = readFileSync(producer.suite, 'utf8');
      expect(text, `${producer.suite} does not produce ${code}`).toContain(
        `'${code}'`,
      );
      if (producer.criterion === 'transport') {
        // Declared outside the criteria: the transport's own answer.
        expect(['PAYLOAD_TOO_LARGE', 'METHOD_NOT_ALLOWED']).toContain(code);
      } else {
        expect(spec, `${producer.criterion} is not a criterion`).toContain(
          `**${producer.criterion}**`,
        );
      }
    }

    const pattern = /['"]([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+)['"]/g;
    const named = new Map<string, Set<string>>();
    for (const file of suiteFiles()) {
      for (const match of readFileSync(file, 'utf8').matchAll(pattern)) {
        const candidate = match[1] as string;
        if (notCodes.has(candidate)) continue;
        if (!named.has(candidate)) named.set(candidate, new Set());
        named.get(candidate)?.add(file);
      }
    }
    const outside = [...named.keys()].filter((candidate) => !union.has(candidate));
    expect(outside, `codes named but not in the union: ${outside.join(', ')}`).toEqual(
      [],
    );
  });

  it('renders one text for the four cases the uniform sign-in transcript shares', async () => {
    const account = await seedAccount(harness!, {
      phoneNumber: '+218912345678',
      password,
    });
    await harness!.db
      .update(users)
      .set({
        failedSignInCount: 5,
        lockedUntil: new Date(harness!.clock.now().getTime() + lockMinutes * 60_000),
      })
      .where(eq(users.id, account.id));
    await seedAccount(harness!, {
      phoneNumber: '+218912345679',
      password,
      status: 'blocked',
    });

    const attempt = async (phone: string, given: string) => {
      const jar: CookieJar = {};
      await bootstrap(harness!, jar);
      const response = await call(
        harness!,
        'POST',
        '/api/v1/auth/sign-in',
        { phone, password: given },
        { jar, csrf: true },
      );
      expect(response.status).toBe(401);
      return refusalBody(response);
    };

    const unknown = await attempt('0912345699', password);
    const wrong = await attempt('0912345698', 'a wrong but long password');
    const locked = await attempt('0912345678', password);
    const blocked = await attempt('0912345679', password);

    // One code, one retryability, one text: the four transcripts are identical.
    expect(unknown).toEqual({ error: { code: 'AUTH_INVALID_CREDENTIALS', retryable: false } });
    expect(wrong).toEqual(unknown);
    expect(locked).toEqual(unknown);
    expect(blocked).toEqual(unknown);
  });

  it('renders one text for the expired, superseded, and unknown code cases', async () => {
    const expiredJar: CookieJar = {};
    const expired = await startSignUp(expiredJar, '0912345601');
    harness!.clock.advance(otpLifetimeSeconds * 1000);
    const expiredResponse = await call(
      harness!,
      'POST',
      '/api/v1/auth/sign-up/verify',
      { requestId: expired.requestId, code: expired.code },
      { jar: expiredJar, csrf: true },
    );

    const supersededJar: CookieJar = {};
    const first = await startSignUp(supersededJar, '0912345602');
    // A different browser submits for the same number, so the later request
    // replaces the row and its code instead of re-rendering the live one.
    const replacementJar: CookieJar = {};
    await startSignUp(replacementJar, '0912345602');
    const supersededResponse = await call(
      harness!,
      'POST',
      '/api/v1/auth/sign-up/verify',
      { requestId: first.requestId, code: first.code },
      { jar: supersededJar, csrf: true },
    );

    const unknownJar: CookieJar = {};
    await bootstrap(harness!, unknownJar);
    const unknownResponse = await call(
      harness!,
      'POST',
      '/api/v1/auth/sign-up/verify',
      { requestId: 'an-unknown-request', code: '123456' },
      { jar: unknownJar, csrf: true },
    );

    for (const response of [expiredResponse, supersededResponse, unknownResponse]) {
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: { code: 'OTP_EXPIRED', retryable: true },
      });
    }
  });

  it('carries the retry affordance on a retryable refusal and none on a fixed one', async () => {
    // A retryable refusal: the spent budget.
    const jar: CookieJar = {};
    const pair = await bootstrap(harness!, jar);
    harness!.clock.advance(4000);
    let limited: { status: number; body: unknown; headers: Headers } | undefined;
    for (let attempt = 0; attempt < 21; attempt += 1) {
      const response = await call(
        harness!,
        'POST',
        '/api/v1/auth/sign-up',
        {
          fullName: 'محمد علي',
          phone: '0912345678',
          password,
          city: 'طرابلس',
          website: '',
          formStamp: pair.formStamp,
        },
        { jar, csrf: true },
      );
      if (response.status === 429) {
        limited = {
          status: response.status,
          body: response.body,
          headers: response.headers,
        };
        break;
      }
    }
    expect(limited).toBeDefined();
    const retryableBody = limited?.body as {
      error: { code: string; retryable: boolean; retryAfterSeconds?: number };
    };
    expect(retryableBody.error.code).toBe('RATE_LIMITED');
    expect(retryableBody.error.retryable).toBe(true);
    expect(retryableBody.error.retryAfterSeconds).toBeGreaterThan(0);
    expect(limited?.headers.get('retry-after')).toBe(
      String(retryableBody.error.retryAfterSeconds),
    );

    // A non-retryable refusal: the format answer.
    const fixedJar: CookieJar = {};
    await bootstrap(harness!, fixedJar);
    const fixed = await call(
      harness!,
      'POST',
      '/api/v1/auth/sign-in',
      { phone: 'not-a-number', password },
      { jar: fixedJar, csrf: true },
    );
    const fixedBody = fixed.body as {
      error: { code: string; retryable: boolean; retryAfterSeconds?: number };
    };
    expect(fixedBody.error.code).toBe('INVALID_PHONE');
    expect(fixedBody.error.retryable).toBe(false);
    expect(fixedBody.error.retryAfterSeconds).toBeUndefined();
    expect(fixed.headers.get('retry-after')).toBeNull();
  });

  it('lists the transport’s four answers with the suite that produces them', () => {
    const transport = readFileSync(
      'apps/api/test/integration/http/transport-refusals.spec.ts',
      'utf8',
    );
    for (const code of [
      'CSRF_FAILED',
      'PAYLOAD_TOO_LARGE',
      'METHOD_NOT_ALLOWED',
      'NOT_FOUND',
    ]) {
      expect(transport).toContain(`'${code}'`);
    }
  });
});
