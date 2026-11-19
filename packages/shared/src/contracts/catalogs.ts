// The intake's request and outcome schemas: the one source the API validates
// against, the OpenAPI document publishes, and the page reads
// (contracts/intake-api.md §1, §2.2-§2.3).
import { z } from 'zod';
import { refusalCodeSchema } from '../refusals/intake.ts';

/** The five canonical content types, keyed by the name's last suffix. */
export const catalogFormats = ['xls', 'xlsx', 'doc', 'docx', 'pdf'] as const;
export type CatalogFormat = (typeof catalogFormats)[number];

export const contentTypes: Record<CatalogFormat, string> = {
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pdf: 'application/pdf',
};

export const catalogStatuses = ['uploaded', 'processing', 'completed', 'failed'] as const;
export type CatalogStatus = (typeof catalogStatuses)[number];

export const startUploadRequestSchema = z.object({
  fileName: z.string().max(4096),
  byteSize: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
});
export type StartUploadRequest = z.infer<typeof startUploadRequestSchema>;

export const completeUploadPartSchema = z.object({
  partNumber: z.number().int().min(1),
  etag: z.string().min(1).max(256),
});

export const completeUploadRequestSchema = z.object({
  parts: z.array(completeUploadPartSchema),
});
export type CompleteUploadRequest = z.infer<typeof completeUploadRequestSchema>;

export const uploadPartSchema = z.object({
  partNumber: z.number().int().min(1),
  url: z.string().min(1),
  byteSize: z.number().int().min(0),
});
export type UploadPart = z.infer<typeof uploadPartSchema>;

export const startUploadResponseSchema = z.object({
  uploadId: z.string().min(1),
  partSize: z.number().int().min(1),
  expiresAt: z.string().min(1),
  parts: z.array(uploadPartSchema),
});
export type StartUploadResponse = z.infer<typeof startUploadResponseSchema>;

export const quotaPairSchema = z.object({
  used: z.number().int().min(0),
  limit: z.number().int().min(0),
});
export type QuotaPair = z.infer<typeof quotaPairSchema>;

export const quotaResponseSchema = z.object({
  monthly: quotaPairSchema,
  active: quotaPairSchema,
});
export type QuotaResponse = z.infer<typeof quotaResponseSchema>;

export const acceptedCatalogSchema = z.object({
  id: z.string().min(1),
  fileName: z.string().min(1),
  byteSize: z.number().int().min(1),
  contentType: z.string().min(1),
  status: z.literal('uploaded'),
  uploadedAt: z.string().min(1),
});
export type AcceptedCatalog = z.infer<typeof acceptedCatalogSchema>;

export const acceptedOutcomeSchema = z.object({
  outcome: z.literal('accepted'),
  catalog: acceptedCatalogSchema,
});

/** The duplicate's four-field projection and no other field (FR-044). */
export const retainedDuplicateSchema = z.object({
  id: z.string().min(1),
  fileName: z.string().min(1),
  uploadedAt: z.string().min(1),
  status: z.enum(catalogStatuses),
});
export type RetainedDuplicate = z.infer<typeof retainedDuplicateSchema>;

export const duplicateOutcomeSchema = z.object({
  outcome: z.literal('duplicate'),
  original: retainedDuplicateSchema,
});

export const completeUploadResponseSchema = z.union([
  acceptedOutcomeSchema,
  duplicateOutcomeSchema,
]);
export type CompleteUploadResponse = z.infer<typeof completeUploadResponseSchema>;

export const intakeEnvelopeSchema = z.object({
  error: z.object({
    code: refusalCodeSchema,
    retryable: z.boolean(),
    field: z.string().min(1).optional(),
    reason: z.enum(['empty', 'too_long', 'emoji', 'characters']).optional(),
    retryAfterSeconds: z.number().int().min(0).optional(),
    details: z
      .array(
        z.object({
          code: refusalCodeSchema,
          field: z.string().min(1).optional(),
          reason: z.enum(['empty', 'too_long', 'emoji', 'characters']).optional(),
        }),
      )
      .optional(),
  }),
});
export type IntakeEnvelope = z.infer<typeof intakeEnvelopeSchema>;
