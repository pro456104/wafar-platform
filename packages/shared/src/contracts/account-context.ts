// The account-context port's contract: the one shape the quota path consumes
// from the `users` module, so `catalogs` imports no path under it (Principle X).
import { z } from 'zod';

export const accountContextSchema = z.object({
  status: z.enum(['active', 'blocked']),
  monthlyUploadQuotaOverride: z.number().int().min(1).max(500).nullable(),
  activeUploadQuotaOverride: z.number().int().min(1).max(1500).nullable(),
});

export type AccountContext = z.infer<typeof accountContextSchema>;

/** The port: one read per request, returning the account's intake-relevant state. */
export interface AccountContextPort {
  read(userId: string): Promise<AccountContext | null>;
}
