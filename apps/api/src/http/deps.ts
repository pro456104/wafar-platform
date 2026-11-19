// The dependency container every route receives: one database client, one SMS
// port, one logger, one clock, and the intake's three ports — the account
// context, the object store, and the scanner — so a test can substitute any of
// them and no service imports an adapter directly (FR-035, FR-040).
import type { Database } from '@wafar/db';
import type { AccountContextPort, SecurityEventPort } from '@wafar/shared';
import type { AuthEngine } from '../modules/auth/engine.ts';
import type { SmsTransport } from '../modules/auth/sms/port.ts';
import type { Env } from '../env.ts';
import type { Logger } from '../observability/logger.ts';

/** The storage port contracts/intake-api.md §6.1 fixes, in full. */
export interface IntakeStorage {
  createMultipart(input: {
    key: string;
    contentType: 'application/octet-stream';
  }): Promise<{ uploadId: string }>;
  presignPart(input: {
    key: string;
    uploadId: string;
    partNumber: number;
    byteSize: number;
    expiresInSeconds: number;
  }): Promise<string>;
  completeMultipart(input: {
    key: string;
    uploadId: string;
    parts: { partNumber: number; etag: string }[];
  }): Promise<void>;
  listParts(input: {
    key: string;
    uploadId: string;
  }): Promise<{ parts: { partNumber: number; byteSize: number }[] }>;
  abortMultipart(input: { key: string; uploadId: string }): Promise<void>;
  head(input: { key: string }): Promise<{ byteSize: number } | null>;
  getStream(input: { key: string }): Promise<ReadableStream<Uint8Array>>;
  putStream(input: {
    key: string;
    body: ReadableStream<Uint8Array>;
    contentType: string;
  }): Promise<{ byteSize: number; sha256: string }>;
  delete(input: { key: string }): Promise<void>;
  headBucket(): Promise<void>;
}

export type ScanVerdict =
  | { verdict: 'clean' }
  | { verdict: 'infected'; signature: string }
  | { verdict: 'unavailable' };

/** The scanner port contracts/intake-api.md §6.2 fixes, plus the probe's ping. */
export interface Scanner {
  scan(input: { stream: ReadableStream<Uint8Array>; budgetMs: number }): Promise<ScanVerdict>;
  /** The readiness probe's clamd `PING`/`PONG`, bounded by the caller's budget. */
  ping(input: { budgetMs: number }): Promise<boolean>;
}

export interface AppDependencies {
  db: Database;
  /** The one better-auth engine the services call (ADR-151). */
  auth: AuthEngine;
  env: Env;
  sms: SmsTransport;
  logger: Logger;
  events: SecurityEventPort;
  now: () => Date;
  /** The contract's trusted-proxy allowlist; an empty list trusts no header. */
  trustedProxies: string[];
  /** The `users` module's read, consumed through the shared contract (T113). */
  accountContext: AccountContextPort;
  /** The object store's adapter (T024). */
  storage: IntakeStorage;
  /** The antivirus adapter (T025) or its deterministic double. */
  scanner: Scanner;
  /** The intake's one operational line per submission (T058). */
  recordSink: { write(line: string): void };
}

export interface AppEnv {
  Variables: {
    nonce: string;
    requestId: string;
  };
}

export const PENDING_COOKIE = 'wafar.pending';
/** The pending cookie's scoped path, so it never travels to a page route. */
export const PENDING_COOKIE_PATH = '/api/v1/auth';

export function pendingCookie(value: string, production: boolean, maxAge = 300): string {
  const parts = [
    `${PENDING_COOKIE}=${encodeURIComponent(value)}`,
    `Path=${PENDING_COOKIE_PATH}`,
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

export function clearedCookie(name: string, production: boolean, path = '/'): string {
  const parts = [`${name}=`, `Path=${path}`, 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (production) parts.push('Secure');
  return parts.join('; ');
}
