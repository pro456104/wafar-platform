// The dependency container every route receives: one database client, one SMS
// port, one logger, and one clock, so a test can substitute any of them.
import type { Database } from '@wafar/db';
import type { SecurityEventPort } from '@wafar/shared';
import type { SmsTransport } from '../modules/auth/sms/port.ts';
import type { Env } from '../env.ts';
import type { Logger } from '../observability/logger.ts';

export interface AppDependencies {
  db: Database;
  env: Env;
  sms: SmsTransport;
  logger: Logger;
  events: SecurityEventPort;
  now: () => Date;
  /** The contract's trusted-proxy allowlist; an empty list trusts no header. */
  trustedProxies: string[];
}

export interface AppEnv {
  Variables: {
    nonce: string;
    requestId: string;
  };
}

export const PENDING_COOKIE = 'wafar.pending';

export function pendingCookie(value: string, production: boolean, maxAge = 1800): string {
  const parts = [
    `${PENDING_COOKIE}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (production) parts.push('Secure');
  return parts.join('; ');
}

export function sessionCookie(value: string, production: boolean, maxAge = 43200): string {
  const parts = [
    `wafar.session=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (production) parts.push('Secure');
  return parts.join('; ');
}

export function clearedCookie(name: string, production: boolean): string {
  const parts = [`${name}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (production) parts.push('Secure');
  return parts.join('; ');
}
