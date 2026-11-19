// The intake test's shared setup: one merchant with a live session and the CSRF
// pair, the start request, the browser's part writes, and the completion — so a
// suite states its subject and not the transport around it (T009, T031).
import type { CookieJar, Harness } from './harness.ts';
import { bootstrap, call, seedAccount, type ResponseRecord } from './harness.ts';
import { writePartForKey } from './storage.ts';

export interface MerchantSession {
  accountId: string;
  token: string;
  jar: CookieJar;
}

export async function merchant(
  harness: Harness,
  options: {
    phoneNumber?: string;
    password?: string;
    status?: 'active' | 'blocked';
    role?: 'merchant' | 'administrator';
    mustChangePassword?: boolean;
  } = {},
): Promise<MerchantSession> {
  const account = await seedAccount(harness, {
    phoneNumber: options.phoneNumber ?? '+218912345678',
    password: options.password ?? 'merchant password value',
    ...(options.status === undefined ? {} : { status: options.status }),
    ...(options.role === undefined ? {} : { role: options.role }),
    ...(options.mustChangePassword === undefined
      ? {}
      : { mustChangePassword: options.mustChangePassword }),
  });
  const issued = await harness.auth.issue({
    userId: account.id,
    now: harness.clock.now(),
  });
  const jar: CookieJar = {};
  await bootstrap(harness, jar);
  jar['wafar.session'] = issued.token;
  return { accountId: account.id, token: issued.token, jar };
}

export function start(
  harness: Harness,
  session: MerchantSession,
  fileName: string,
  byteSize: number,
): Promise<ResponseRecord> {
  return call(
    harness,
    'POST',
    '/api/v1/uploads',
    { fileName, byteSize },
    { jar: session.jar, csrf: true },
  );
}

export interface StartedUpload {
  uploadId: string;
  partSize: number;
  expiresAt: string;
  parts: { partNumber: number; url: string; byteSize: number }[];
}

export function originalKey(uploadId: string): string {
  return `intake/${uploadId}/original`;
}

/** The browser's part writes, split exactly as the start response ordered them. */
export function writeParts(
  harness: Harness,
  started: StartedUpload,
  bytes: Uint8Array,
): { partNumber: number; etag: string }[] {
  const parts: { partNumber: number; etag: string }[] = [];
  let offset = 0;
  for (const part of started.parts) {
    const slice = bytes.subarray(offset, offset + part.byteSize);
    const etag = writePartForKey(
      harness.storage,
      originalKey(started.uploadId),
      part.partNumber,
      slice,
    );
    parts.push({ partNumber: part.partNumber, etag });
    offset += part.byteSize;
  }
  return parts;
}

export function complete(
  harness: Harness,
  session: MerchantSession,
  uploadId: string,
  parts: { partNumber: number; etag: string }[],
): Promise<ResponseRecord> {
  return call(
    harness,
    'POST',
    `/api/v1/uploads/${uploadId}/complete`,
    { parts },
    { jar: session.jar, csrf: true },
  );
}

export function abort(
  harness: Harness,
  session: MerchantSession,
  uploadId: string,
): Promise<ResponseRecord> {
  return call(harness, 'DELETE', `/api/v1/uploads/${uploadId}`, undefined, {
    jar: session.jar,
    csrf: true,
  });
}

export async function upload(
  harness: Harness,
  session: MerchantSession,
  fileName: string,
  bytes: Uint8Array,
): Promise<{ started: StartedUpload; response: ResponseRecord }> {
  const startedResponse = await start(harness, session, fileName, bytes.byteLength);
  if (startedResponse.status !== 201) {
    throw new Error(
      `start refused: ${startedResponse.status} ${JSON.stringify(startedResponse.body)}`,
    );
  }
  const started = startedResponse.body as StartedUpload;
  const parts = writeParts(harness, started, bytes);
  const response = await complete(harness, session, started.uploadId, parts);
  return { started, response };
}
