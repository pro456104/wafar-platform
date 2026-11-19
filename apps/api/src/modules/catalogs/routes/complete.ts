// The complete route: `POST /api/v1/uploads/{uploadId}/complete` completes the
// multipart, screens the object, and settles the intake, with `NOT_FOUND` for
// an unknown, foreign, expired, or non-open session (FR-027-FR-050;
// contracts/intake-api.md §2.3).
import type { Hono } from 'hono';
import { completeUploadRequestSchema } from '@wafar/shared';
import type { AppDependencies, AppEnv } from '../../../http/deps.ts';
import { refuse } from '../../../http/errors.ts';
import { readCookie } from '../../../http/security.ts';
import { resolveMerchant, SESSION_COOKIE } from '../../../http/context.ts';
import { createAcceptance } from '../service/acceptance.ts';
import { createIntake } from '../service/intake.ts';
import { createRecord } from '../service/record.ts';
import { createDuplicatesRepository } from '../repository/duplicates.ts';
import { createSessionsRepository } from '../repository/sessions.ts';

/** The parts list the completion accepts: 1..n with no gap and no duplicate. */
export function partsAreContiguous(parts: { partNumber: number }[]): boolean {
  if (parts.length === 0) return false;
  const numbers = parts.map((part) => part.partNumber).sort((left, right) => left - right);
  return numbers.every((value, index) => value === index + 1);
}

export function registerCompleteRoute(app: Hono<AppEnv>, dependencies: AppDependencies): void {
  app.post('/api/v1/uploads/:uploadId/complete', async (c) => {
    const now = dependencies.now();
    const record = createRecord(dependencies.recordSink);

    // The completion's own settled refusal leaves one line, as every settled
    // submission does (FR-062, AC-034; contracts/intake-api.md §5).
    const settle = (code: 'UPLOAD_INCOMPLETE'): void => {
      record.settled({
        outcome: 'refused',
        cause: code,
        requestId: c.get('requestId'),
        timestamp: now,
      });
    };

    const merchant = await resolveMerchant(dependencies.db, dependencies.auth, {
      token: readCookie(c.req.header('cookie'), SESSION_COOKIE),
      now,
      requiresUnrestricted: true,
      isUserInitiated: true,
    });
    if (merchant.kind === 'refused') return refuse(c, merchant.code);
    if (merchant.kind !== 'merchant') return refuse(c, 'SESSION_ENDED');

    const sessions = createSessionsRepository(dependencies.db);
    const uploadId = c.req.param('uploadId');
    const session = await sessions.findOwned(merchant.userId, uploadId);
    if (
      session === null ||
      session.state !== 'open' ||
      session.urlExpiresAt.getTime() < now.getTime()
    ) {
      return refuse(c, 'NOT_FOUND');
    }

    let payload: unknown;
    try {
      payload = await c.req.json();
    } catch {
      settle('UPLOAD_INCOMPLETE');
      return refuse(c, 'UPLOAD_INCOMPLETE');
    }
    const parsed = completeUploadRequestSchema.safeParse(payload);
    if (!parsed.success || !partsAreContiguous(parsed.data.parts)) {
      settle('UPLOAD_INCOMPLETE');
      return refuse(c, 'UPLOAD_INCOMPLETE');
    }

    const began = await sessions.beginCompleting(uploadId);
    if (!began) return refuse(c, 'NOT_FOUND');

    const account = await dependencies.accountContext.read(merchant.userId);
    if (account === null) return refuse(c, 'SESSION_ENDED');

    const intake = createIntake({
      storage: dependencies.storage,
      scanner: dependencies.scanner,
      sessions,
      duplicates: createDuplicatesRepository(dependencies.db),
      acceptance: createAcceptance(dependencies.db),
      record,
      now: dependencies.now,
      workspaceDir: dependencies.env.WORKSPACE_DIR,
      requestId: c.get('requestId'),
      account,
    });

    const outcome = await intake.run(session, parsed.data.parts);

    if (outcome.kind === 'accepted') {
      return c.json(
        {
          outcome: 'accepted',
          catalog: {
            id: outcome.catalog.id,
            fileName: outcome.catalog.fileName,
            byteSize: outcome.catalog.byteSize,
            contentType: outcome.catalog.contentType,
            status: 'uploaded',
            uploadedAt: outcome.catalog.uploadedAt.toISOString(),
          },
        },
        201,
      );
    }
    if (outcome.kind === 'duplicate') {
      return c.json({ outcome: 'duplicate', original: outcome.original }, 200);
    }
    if (outcome.kind === 'refused') {
      return refuse(c, outcome.code as 'UPLOAD_CORRUPT', {
        ...(outcome.field === undefined ? {} : { field: outcome.field }),
      });
    }
    return refuse(c, outcome.code as 'INTERNAL_ERROR');
  });
}
