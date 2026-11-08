// The better-auth 1.6.14 configuration: the phone-number extension, the scrypt
// hooks of CMV 2, the reserved placeholder email, and no mounted library HTTP
// handler â€” the module owns its routes and calls the library server-side
// (FR-004, FR-035, CMV 2).
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { phoneNumber } from 'better-auth/plugins';
import type { Database } from '@wafar/db';
import { hashPassword, verifyPassword } from './service/password-policy.ts';

export interface BetterAuthOptions {
  db: Database;
  secret: string;
  baseUrl: string;
  /** The one-time code's dispatch, supplied by the SMS port. */
  sendOtp: (input: { phoneNumber: string; code: string }) => Promise<void>;
}

export function createBetterAuth(options: BetterAuthOptions) {
  return betterAuth({
    secret: options.secret,
    baseURL: options.baseUrl,
    database: drizzleAdapter(options.db, {
      provider: 'pg',
      usePlural: false,
    }),
    emailAndPassword: {
      enabled: true,
      password: {
        hash: (password: string) => hashPassword(password),
        verify: (input: { hash: string; password: string }) =>
          verifyPassword(input.password, input.hash),
      },
    },
    user: {
      modelName: 'users',
      fields: {
        name: 'fullName',
        emailVerified: 'emailVerified',
      },
    },
    session: {
      modelName: 'sessions',
      // The library's sliding update is disabled: the absolute lifetime is 12 h
      // and the inactivity clock is the module's (CMV 4, research R-04).
      expiresIn: 12 * 60 * 60,
      updateAge: 12 * 60 * 60,
    },
    plugins: [
      phoneNumber({
        sendOTP: ({ phoneNumber: number, code }) =>
          options.sendOtp({ phoneNumber: number, code }),
      }),
    ],
    advanced: {
      cookiePrefix: 'wafar',
      // The API verifies the CSRF pair in its own middleware (T019).
      disableCSRFCheck: true,
    },
  });
}

export type WafarAuth = ReturnType<typeof createBetterAuth>;
