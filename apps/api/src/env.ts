// The validated environment: every key the quickstart names is read once at
// boot, so a bad value stops startup instead of failing a request.
import { z } from 'zod';
import { smsFakeMaxAcceptMs } from '@wafar/shared';

/**
 * The development and test placeholder. Production must never select it: a
 * deployment that omits BETTER_AUTH_SECRET would otherwise sign sessions with
 * a value published in this file (Constitution: Query Safety and Secrets).
 */
const DEVELOPMENT_AUTH_SECRET = 'development-only-secret-value-0000';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1).optional(),
  BETTER_AUTH_SECRET: z.string().min(16).optional(),
  BETTER_AUTH_URL: z.string().url().default('http://localhost:3001'),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  // The contract's trusted-proxy list (§2.5): comma-separated addresses whose
  // X-Real-IP is honoured. Unset means no header is trusted.
  TRUSTED_PROXIES: z.string().default(''),
  SMS_TRANSPORT: z.enum(['fake', 'twilio']).default('fake'),
  SMS_FAKE_ACCEPT_MS: z.coerce.number().int().min(0).max(smsFakeMaxAcceptMs).default(0),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  BACKUP_KEY_ENCRYPTION_KEY: z.string().optional(),
  // The object store: SeaweedFS's S3 gateway, one private bucket (CMV 12,
  // ADR-172). Secrets are injected server-side and never logged.
  S3_ENDPOINT: z.string().url().default('http://localhost:8333'),
  S3_REGION: z.string().min(1).default('us-east-1'),
  S3_BUCKET: z.string().min(1).default('wafar'),
  S3_ACCESS_KEY_ID: z.string().min(1).default('wafar'),
  S3_SECRET_ACCESS_KEY: z.string().min(1).default('wafar-secret'),
  // The scanner: the clamd INSTREAM adapter or the deterministic double
  // (ADR-173). The daemon is a separate process, never bundled in the API.
  SCANNER: z.enum(['clamd', 'double']).default('double'),
  CLAMD_HOST: z.string().min(1).default('localhost'),
  CLAMD_PORT: z.coerce.number().int().min(1).max(65535).default(3310),
  // The per-request workspace: one bounded working copy per intake.
  WORKSPACE_DIR: z.string().min(1).default('.workspace'),
});

type ParsedEnv = z.infer<typeof schema>;

/** The validated environment, with the secret narrowed to the value in use. */
export type Env = Omit<ParsedEnv, 'BETTER_AUTH_SECRET'> & {
  BETTER_AUTH_SECRET: string;
};

/** The parse result, so a test can assert a refusal without `process.exit`. */
export type EnvironmentResult =
  | { success: true; data: Env }
  | { success: false; errors: Record<string, string[] | undefined> };

/** Reads the comma-separated trusted-proxy list; an empty value trusts none. */
export function trustedProxiesFrom(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '');
}

/**
 * Parses the environment without exiting: production requires an injected
 * secret and refuses the development placeholder; every other mode keeps the
 * placeholder so a developer checkout boots without a secret store.
 */
export function parseEnvironment(source: NodeJS.ProcessEnv): EnvironmentResult {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const value = parsed.data;
  if (value.NODE_ENV === 'production') {
    if (value.BETTER_AUTH_SECRET === undefined) {
      return {
        success: false,
        errors: {
          BETTER_AUTH_SECRET: ['BETTER_AUTH_SECRET must be supplied in production'],
        },
      };
    }
    if (value.BETTER_AUTH_SECRET === DEVELOPMENT_AUTH_SECRET) {
      return {
        success: false,
        errors: {
          BETTER_AUTH_SECRET: [
            'BETTER_AUTH_SECRET must not be the development placeholder in production',
          ],
        },
      };
    }
    return {
      success: true,
      data: { ...value, BETTER_AUTH_SECRET: value.BETTER_AUTH_SECRET },
    };
  }

  return {
    success: true,
    data: {
      ...value,
      BETTER_AUTH_SECRET: value.BETTER_AUTH_SECRET ?? DEVELOPMENT_AUTH_SECRET,
    },
  };
}

let cached: Env | undefined;

/** Reads and validates the environment once; a second call reuses the result. */
export function environment(): Env {
  if (cached === undefined) {
    const result = parseEnvironment(process.env);
    if (!result.success) {
      console.error('Invalid environment:', result.errors);
      process.exit(1);
    }
    cached = result.data;
  }
  return cached;
}

/** Test-only: drops the cache so a suite can set a key and read it again. */
export function resetEnvironmentCache(): void {
  cached = undefined;
}
