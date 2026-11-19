// The intake sequence: complete the multipart, re-check the object, run the
// safety pipeline in FR-029's order, write the kept bytes, and settle the
// record or the duplicate — composing Phase 2's modules and holding no rule of
// its own (FR-029-FR-041).
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, open, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { Readable } from 'node:stream';
import type { AccountContext, RetainedDuplicate } from '@wafar/shared';
import { contentTypes } from '@wafar/shared';
import type { IntakeStorage, Scanner } from '../../../http/deps.ts';
import type { Acceptance } from './acceptance.ts';
import { resolveDuplicate } from './duplicate.ts';
import type { OperationalRecord } from './record.ts';
import { decideSafety, isSafetyCause, withdraw, type SafetyCause } from './safety.ts';
import { measureDecoded } from '../inspection/cap.ts';
import { inspectFormat } from '../inspection/format.ts';
import { sanitize } from '../inspection/sanitize.ts';
import type { DuplicatesRepository } from '../repository/duplicates.ts';
import type { SessionsRepository, UploadSession } from '../repository/sessions.ts';

export interface IntakePorts {
  storage: IntakeStorage;
  scanner: Scanner;
  sessions: SessionsRepository;
  duplicates: DuplicatesRepository;
  acceptance: Acceptance;
  record: OperationalRecord;
  now: () => Date;
  workspaceDir: string;
  requestId: string;
  account: AccountContext;
}

export type IntakeOutcome =
  | { kind: 'accepted'; catalog: { id: string; fileName: string; byteSize: number; contentType: string; uploadedAt: Date } }
  | { kind: 'duplicate'; original: RetainedDuplicate }
  | { kind: 'refused'; code: string; field?: string }
  | { kind: 'failed'; code: string };

/** The five timed budgets contracts/intake-api.md §2.3 fixes, in FR-029's order. */
export const budgets = {
  probeMs: 5_000,
  scanMs: 90_000,
  capMs: 5_000,
  sanitizeMs: 10_000,
  reopenMs: 5_000,
} as const;

async function streamToFile(
  stream: ReadableStream<Uint8Array>,
  path: string,
): Promise<number> {
  await mkdir(dirname(path), { recursive: true });
  const file = await open(path, 'w');
  let byteSize = 0;
  try {
    const reader = stream.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      await file.write(value);
      byteSize += value.byteLength;
    }
  } finally {
    await file.close();
  }
  return byteSize;
}

function formatCause(verdict: 'mismatch' | 'corrupt' | 'password-protected'): SafetyCause {
  if (verdict === 'mismatch') return 'UPLOAD_CONTENT_MISMATCH';
  if (verdict === 'password-protected') return 'UPLOAD_PASSWORD_PROTECTED';
  return 'UPLOAD_CORRUPT';
}

/**
 * One transport leg streamed from a workspace file: the scanner's input and
 * the kept object's write read the disk in chunks, so no second full-file copy
 * is built in memory (ADR-180; plan: Storage decision).
 */
function fileStream(path: string): ReadableStream<Uint8Array> {
  return Readable.toWeb(createReadStream(path)) as unknown as ReadableStream<Uint8Array>;
}

export function createIntake(ports: IntakePorts) {
  const { storage } = ports;

  return {
    async run(session: UploadSession, parts: { partNumber: number; etag: string }[]): Promise<IntakeOutcome> {
      const now = ports.now();
      const workspacePath = join(ports.workspaceDir, `${session.id}.original`);
      const sanitizedPath = join(ports.workspaceDir, `${session.id}.sanitized`);
      const staged = {
        originalKey: session.originalKey,
        uploadId: session.uploadId,
        sanitizedKey: null as string | null,
      };

      const refuse = async (cause: SafetyCause): Promise<IntakeOutcome> => {
        const answer = await decideSafety(storage, cause, staged);
        await ports.sessions.settle(session.id, {
          state: 'failed',
          at: now,
          sanitizedKey: staged.sanitizedKey,
        });
        if (answer.kind === 'storage-failed') {
          ports.record.settled({
            outcome: 'refused',
            cause,
            requestId: ports.requestId,
            timestamp: now,
          });
          return { kind: 'failed', code: 'UPLOAD_STORAGE_UNAVAILABLE' };
        }
        ports.record.settled({
          outcome: 'refused',
          cause,
          requestId: ports.requestId,
          timestamp: now,
        });
        return { kind: 'refused', code: cause };
      };

      try {
        // Step 4: complete the multipart. A part list the store cannot assemble
        // is the incomplete-transfer cause; a transport failure is the storage
        // failure (contracts/intake-api.md §2.3, §3.1).
        try {
          await storage.completeMultipart({
            key: session.originalKey,
            uploadId: session.uploadId,
            parts,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : '';
          if (/invalid part|part missing|upload_incomplete/i.test(message)) {
            await ports.sessions.settle(session.id, { state: 'failed', at: now });
            ports.record.settled({
              outcome: 'refused',
              cause: 'UPLOAD_INCOMPLETE',
              requestId: ports.requestId,
              timestamp: now,
            });
            return { kind: 'refused', code: 'UPLOAD_INCOMPLETE' };
          }
          throw error;
        }

        // Step 5: the object's head, re-checked against the declared size.
        const head = await storage.head({ key: session.originalKey });
        if (head === null) return await refuse('UPLOAD_CONTENT_MISMATCH');
        if (head.byteSize === 0) {
          await withdraw(storage, staged);
          await ports.sessions.settle(session.id, { state: 'failed', at: now });
          ports.record.settled({
            outcome: 'refused',
            cause: 'UPLOAD_EMPTY',
            requestId: ports.requestId,
            timestamp: now,
          });
          return { kind: 'refused', code: 'UPLOAD_EMPTY' };
        }
        if (head.byteSize > 104_857_600) {
          await withdraw(storage, staged);
          await ports.sessions.settle(session.id, { state: 'failed', at: now });
          ports.record.settled({
            outcome: 'refused',
            cause: 'UPLOAD_TOO_LARGE',
            requestId: ports.requestId,
            timestamp: now,
          });
          return { kind: 'refused', code: 'UPLOAD_TOO_LARGE' };
        }
        if (head.byteSize !== session.declaredBytes) {
          await withdraw(storage, staged);
          await ports.sessions.settle(session.id, { state: 'failed', at: now });
          ports.record.settled({
            outcome: 'refused',
            cause: 'UPLOAD_INCOMPLETE',
            requestId: ports.requestId,
            timestamp: now,
          });
          return { kind: 'refused', code: 'UPLOAD_INCOMPLETE' };
        }

        const original = await storage.getStream({ key: session.originalKey });
        const written = await streamToFile(original, workspacePath);
        if (written !== head.byteSize) {
          await withdraw(storage, staged);
          await ports.sessions.settle(session.id, { state: 'failed', at: now });
          ports.record.settled({
            outcome: 'refused',
            cause: 'UPLOAD_INCOMPLETE',
            requestId: ports.requestId,
            timestamp: now,
          });
          return { kind: 'refused', code: 'UPLOAD_INCOMPLETE' };
        }
        // The inspection set (cfb, pdf-lib — CMV row 12, ADR-171) parses the
        // compressed file as one bounded working copy, at most the 100 MB
        // ceiling; the transport legs around it stream (ADR-180).
        const bytes = await readFile(workspacePath);

        // Step 6: the content probe, under its own five-second budget.
        const probe = await inspectFormat(bytes, session.format, budgets.probeMs);
        if (probe.kind !== 'matches') {
          return await refuse(formatCause(probe.kind));
        }

        // Step 7: the antivirus scan, streamed from the workspace file.
        const scan = await ports.scanner.scan({
          stream: fileStream(workspacePath),
          budgetMs: budgets.scanMs,
        });
        if (scan.verdict === 'infected') return await refuse('UPLOAD_INFECTED');
        if (scan.verdict === 'unavailable') return await refuse('UPLOAD_SCAN_UNAVAILABLE');

        // Step 8: the decoded-size cap's read of the original decode.
        const cap = measureDecoded({
          bytes,
          format: session.format,
          budgetMs: budgets.capMs,
        });
        if (cap.kind === 'over') return await refuse('UPLOAD_EXPANSION_CAP');
        if (cap.kind === 'timeout') return await refuse('UPLOAD_CORRUPT');

        // Step 9: sanitize and reopen.
        const cleaned = await sanitize({
          bytes,
          format: session.format,
          budgetMs: budgets.sanitizeMs,
          reopenBudgetMs: budgets.reopenMs,
          originalDecodedBytes: cap.decodedBytes,
        });
        if (cleaned.kind === 'failed') {
          if (cleaned.reason === 'over-cap') return await refuse('UPLOAD_EXPANSION_CAP');
          return await refuse('UPLOAD_SANITIZATION_FAILED');
        }
        await writeFile(sanitizedPath, cleaned.bytes);

        // Step 10: the kept object, hashed while it is written.
        const catalogId = randomUUID();
        const extension = session.format;
        const sha256 = createHash('sha256').update(cleaned.bytes).digest('hex');
        const sanitizedKey = `catalogs/${catalogId}/${sha256}.${extension}`;
        const stored = await storage.putStream({
          key: sanitizedKey,
          body: fileStream(sanitizedPath),
          contentType: contentTypes[session.format],
        });
        staged.sanitizedKey = sanitizedKey;
        await ports.sessions.settle(session.id, {
          state: 'completing',
          at: now,
          sanitizedKey,
          contentHash: stored.sha256,
        });

        // Step 11: the duplicate first, then the acceptance transaction.
        const duplicate = await resolveDuplicate(
          ports.duplicates,
          storage,
          { contentHash: stored.sha256, sanitizedKey },
        );
        if (duplicate.kind === 'storage-failed') {
          return await refuse('UPLOAD_SANITIZATION_FAILED');
        }
        if (duplicate.kind === 'duplicate') {
          await withdraw(storage, { ...staged, sanitizedKey });
          await ports.sessions.settle(session.id, {
            state: 'done',
            at: now,
            sanitizedKey,
            contentHash: stored.sha256,
          });
          ports.record.settled({
            outcome: 'duplicate',
            requestId: ports.requestId,
            timestamp: now,
          });
          return { kind: 'duplicate', original: duplicate.original };
        }

        const accepted = await ports.acceptance.accept({
          userId: session.userId,
          catalogId,
          fileName: session.fileName,
          byteSize: stored.byteSize,
          contentType: contentTypes[session.format],
          contentHash: stored.sha256,
          storageKey: sanitizedKey,
          now,
          account: ports.account,
        });

        if (accepted.kind === 'duplicate') {
          await withdraw(storage, { ...staged, sanitizedKey });
          await ports.sessions.settle(session.id, {
            state: 'done',
            at: now,
            sanitizedKey,
            contentHash: stored.sha256,
          });
          ports.record.settled({
            outcome: 'duplicate',
            requestId: ports.requestId,
            timestamp: now,
          });
          return { kind: 'duplicate', original: accepted.original };
        }

        if (accepted.kind === 'limit') {
          // The failed transaction wrote no row, so the kept object is withdrawn
          // and no quota is consumed.
          await withdraw(storage, { ...staged, sanitizedKey });
          await ports.sessions.settle(session.id, {
            state: 'failed',
            at: now,
            sanitizedKey,
          });
          ports.record.settled({
            outcome: 'refused',
            cause: accepted.code,
            requestId: ports.requestId,
            timestamp: now,
          });
          return {
            kind: 'refused',
            code: accepted.code,
            ...(accepted.fields[0] === undefined ? {} : { field: accepted.fields[0] }),
          };
        }

        // The acceptance stands only when the staging bytes are withdrawn: a
        // withdrawal the store refuses rolls the record back and removes the
        // kept object, so no catalog and no quota survive the failure. The kept
        // object is not part of the staging set.
        const withdrawn = await withdraw(storage, { ...staged, sanitizedKey: null });
        if (withdrawn.kind === 'refused') {
          await storage.delete({ key: sanitizedKey }).catch(() => undefined);
          await ports.acceptance.rollback({
            catalogId,
            userId: session.userId,
            now,
          });
          await ports.sessions.settle(session.id, {
            state: 'failed',
            at: now,
            sanitizedKey: null,
          });
          ports.record.settled({
            outcome: 'failed',
            cause: 'UPLOAD_STORAGE_UNAVAILABLE',
            requestId: ports.requestId,
            timestamp: now,
          });
          return { kind: 'failed', code: 'UPLOAD_STORAGE_UNAVAILABLE' };
        }
        await ports.sessions.settle(session.id, {
          state: 'done',
          at: now,
          sanitizedKey,
          contentHash: stored.sha256,
        });
        ports.record.settled({
          outcome: 'accepted',
          requestId: ports.requestId,
          timestamp: now,
        });
        return {
          kind: 'accepted',
          catalog: {
            id: catalogId,
            fileName: session.fileName,
            byteSize: stored.byteSize,
            contentType: contentTypes[session.format],
            uploadedAt: accepted.uploadedAt,
          },
        };
      } catch (error) {
        const code =
          error instanceof Error && /storage|write|read failed|multipart/i.test(error.message)
            ? 'UPLOAD_STORAGE_UNAVAILABLE'
            : 'INTERNAL_ERROR';
        const confirmed = await withdraw(storage, staged);
        await ports.sessions.settle(session.id, {
          state: 'failed',
          at: now,
          sanitizedKey: staged.sanitizedKey,
        });
        if (isSafetyCause(code)) {
          ports.record.settled({
            outcome: 'refused',
            cause: code,
            requestId: ports.requestId,
            timestamp: now,
          });
        } else {
          ports.record.settled({
            outcome: 'failed',
            ...(code === 'UPLOAD_STORAGE_UNAVAILABLE'
              ? { cause: 'UPLOAD_STORAGE_UNAVAILABLE' as const }
              : {}),
            requestId: ports.requestId,
            timestamp: now,
          });
        }
        if (code === 'UPLOAD_STORAGE_UNAVAILABLE' || confirmed.kind === 'refused') {
          return { kind: 'failed', code: 'UPLOAD_STORAGE_UNAVAILABLE' };
        }
        return { kind: 'failed', code: 'INTERNAL_ERROR' };
      } finally {
        await rm(workspacePath, { force: true }).catch(() => undefined);
        await rm(sanitizedPath, { force: true }).catch(() => undefined);
      }
    },
  };
}

export type Intake = ReturnType<typeof createIntake>;
