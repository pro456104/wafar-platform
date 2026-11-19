// The start route: `POST /api/v1/uploads` validates the declared file, decides
// both limits, counts the attempt, and creates the multipart, in the observable
// order the contract fixes (FR-013, FR-020-FR-028, FR-061;
// contracts/intake-api.md §2.2, §4.1).
import { randomUUID } from 'node:crypto';
import type { Hono } from 'hono';
import { startUploadRequestSchema, monthStart, type IntakeErrorCode } from '@wafar/shared';
import type { AppDependencies, AppEnv } from '../../../http/deps.ts';
import { refuse } from '../../../http/errors.ts';
import { readCookie } from '../../../http/security.ts';
import { resolveMerchant, SESSION_COOKIE } from '../../../http/context.ts';
import { createCountersRepository } from '../repository/counters.ts';
import { createSessionsRepository } from '../repository/sessions.ts';
import { decideAttempt, secondsToNextWindow } from '../service/attempts.ts';
import { decideLimits, effectiveLimits } from '../service/quota.ts';
import { createRecord } from '../service/record.ts';
import { validateFile } from '../service/validation.ts';

export const partSize = 8 * 1024 * 1024;
export const partUrlSeconds = 15 * 60;
/** The part URLs' expiry plus the workspace's grace: the session's own bound. */
export const sessionGraceSeconds = 5 * 60;

export function registerUploadRoutes(app: Hono<AppEnv>, dependencies: AppDependencies): void {
  app.post('/api/v1/uploads', async (c) => {
    const now = dependencies.now();
    const record = createRecord(dependencies.recordSink);

    // Every settled submission the start route answers leaves one line, with
    // the closed-set cause and the request's correlation identifier alone
    // (FR-062, AC-034; contracts/intake-api.md §5).
    const settle = (code: IntakeErrorCode): void => {
      record.settled({
        outcome: 'refused',
        cause: code,
        requestId: c.get('requestId'),
        timestamp: now,
      });
    };

    // Step 1: the session, the role, and the account's status.
    const merchant = await resolveMerchant(dependencies.db, dependencies.auth, {
      token: readCookie(c.req.header('cookie'), SESSION_COOKIE),
      now,
      requiresUnrestricted: true,
      isUserInitiated: true,
    });
    if (merchant.kind === 'refused') return refuse(c, merchant.code);
    if (merchant.kind !== 'merchant') return refuse(c, 'SESSION_ENDED');

    // Step 2: the request shape.
    let payload: unknown;
    try {
      payload = await c.req.json();
    } catch {
      settle('UPLOAD_INVALID_REQUEST');
      return refuse(c, 'UPLOAD_INVALID_REQUEST');
    }
    const parsed = startUploadRequestSchema.safeParse(payload);
    if (!parsed.success) {
      settle('UPLOAD_INVALID_REQUEST');
      return refuse(c, 'UPLOAD_INVALID_REQUEST');
    }
    const { fileName, byteSize } = parsed.data;

    // Steps 3-6: the file-level checks in FR-028's fixed order.
    const file = validateFile({ fileName, byteSize });
    if (file.kind === 'refused') {
      settle(file.code as IntakeErrorCode);
      return refuse(c, file.code as 'UPLOAD_INVALID_NAME', {
        ...(file.field === undefined ? {} : { field: file.field }),
      });
    }

    // Steps 7-8: the pre-sign limit decision, monthly first.
    const counters = createCountersRepository(dependencies.db, {
      readAccount: (userId) => dependencies.accountContext.read(userId),
    });
    const account = await dependencies.accountContext.read(merchant.userId);
    if (account === null) return refuse(c, 'SESSION_ENDED');
    const limits = effectiveLimits(account);
    const monthlyUsed = await counters.monthlyUsed(merchant.userId, monthStart(now));
    const activeUsed = await counters.activeUsed(merchant.userId);
    const decision = decideLimits({ monthlyUsed, activeUsed, limits });
    if (!decision.allowed) {
      const firstReason = decision.reasons[0];
      settle(decision.code);
      return refuse(c, decision.code, {
        ...(firstReason === undefined ? {} : { field: firstReason.field }),
        details: decision.reasons.map((reason) => ({
          code: reason.code,
          field: reason.field,
        })),
      });
    }

    // Step 9: the attempt bound; a refusal is not counted.
    const state = await counters.attemptState(merchant.userId, now);
    const attempt = decideAttempt(state, now);
    if (!attempt.allowed) {
      settle('UPLOAD_TOO_MANY_ATTEMPTS');
      return refuse(
        c,
        'UPLOAD_TOO_MANY_ATTEMPTS',
        { retryAfterSeconds: attempt.retryAfterSeconds },
        { 'Retry-After': String(attempt.retryAfterSeconds) },
      );
    }
    await counters.incrementAttempt(merchant.userId, now);

    // Step 10: the multipart create.
    const uploadId = randomUUID();
    const originalKey = `intake/${uploadId}/original`;
    let multipart: { uploadId: string };
    try {
      multipart = await dependencies.storage.createMultipart({
        key: originalKey,
        contentType: 'application/octet-stream',
      });
    } catch {
      settle('UPLOAD_STORAGE_UNAVAILABLE');
      return refuse(c, 'UPLOAD_STORAGE_UNAVAILABLE');
    }

    const sessions = createSessionsRepository(dependencies.db);
    try {
      await sessions.create({
        id: uploadId,
        userId: merchant.userId,
        uploadId: multipart.uploadId,
        originalKey,
        fileName,
        declaredBytes: byteSize,
        format: file.format,
        urlExpiresAt: new Date(now.getTime() + (partUrlSeconds + sessionGraceSeconds) * 1000),
      });
    } catch {
      settle('UPLOAD_STORAGE_UNAVAILABLE');
      return refuse(c, 'UPLOAD_STORAGE_UNAVAILABLE');
    }

    const partCount = Math.max(1, Math.ceil(byteSize / partSize));
    const parts: { partNumber: number; url: string; byteSize: number }[] = [];
    try {
      for (let partNumber = 1; partNumber <= partCount; partNumber += 1) {
        const remaining = byteSize - (partNumber - 1) * partSize;
        const size = Math.min(partSize, remaining);
        const url = await dependencies.storage.presignPart({
          key: originalKey,
          uploadId: multipart.uploadId,
          partNumber,
          byteSize: size,
          expiresInSeconds: partUrlSeconds,
        });
        parts.push({ partNumber, url, byteSize: size });
      }
    } catch {
      settle('UPLOAD_STORAGE_UNAVAILABLE');
      return refuse(c, 'UPLOAD_STORAGE_UNAVAILABLE');
    }

    return c.json(
      {
        uploadId,
        partSize,
        expiresAt: new Date(now.getTime() + partUrlSeconds * 1000).toISOString(),
        parts,
      },
      201,
    );
  });
}

export { secondsToNextWindow };
