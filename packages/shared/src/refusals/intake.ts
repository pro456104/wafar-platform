// The intake's closed refusal set and the platform union it completes
// (contracts/intake-api.md §3.1; Complexity Tracking row 26).
import { z } from 'zod';
import { authErrorCodes, type AuthErrorCode } from '../contracts/auth.ts';

/** The 17 intake codes of contracts/intake-api.md §3.1 — closed for R2. */
export const intakeErrorCodes = [
  'UPLOAD_INVALID_REQUEST',
  'UPLOAD_INVALID_NAME',
  'UPLOAD_UNSUPPORTED_FORMAT',
  'UPLOAD_TOO_LARGE',
  'UPLOAD_EMPTY',
  'UPLOAD_CONTENT_MISMATCH',
  'UPLOAD_CORRUPT',
  'UPLOAD_PASSWORD_PROTECTED',
  'UPLOAD_INFECTED',
  'UPLOAD_EXPANSION_CAP',
  'UPLOAD_SANITIZATION_FAILED',
  'UPLOAD_SCAN_UNAVAILABLE',
  'UPLOAD_TOO_MANY_ATTEMPTS',
  'UPLOAD_MONTHLY_LIMIT',
  'UPLOAD_ACTIVE_LIMIT',
  'UPLOAD_STORAGE_UNAVAILABLE',
  'UPLOAD_INCOMPLETE',
] as const;

export type IntakeErrorCode = (typeof intakeErrorCodes)[number];
export const intakeErrorCodeSchema = z.enum(intakeErrorCodes);

/** The platform union: R1's 26 plus R2's 17, 43 in all. */
export const refusalCodes = [...authErrorCodes, ...intakeErrorCodes] as const;
export type RefusalCode = AuthErrorCode | IntakeErrorCode;
export const refusalCodeSchema = z.enum(refusalCodes);

/** The three retryable intake codes: the page's transfer failure has no code. */
export const retryableIntakeCodes = [
  'UPLOAD_SCAN_UNAVAILABLE',
  'UPLOAD_TOO_MANY_ATTEMPTS',
  'UPLOAD_STORAGE_UNAVAILABLE',
] as const;
