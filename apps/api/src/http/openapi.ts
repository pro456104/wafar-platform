// The OpenAPI 3.1 generator: the document is emitted from the Zod contract
// schemas and this route table, so the implementation and the published
// interface have one source (ADR-002; T125).
import { z } from 'zod';
import {
  changePasswordRequestSchema,
  completeUploadRequestSchema,
  forgotPasswordRequestSchema,
  resetPasswordRequestSchema,
  resendRequestSchema,
  signInRequestSchema,
  signUpRequestSchema,
  startUploadRequestSchema,
  verifyCodeRequestSchema,
} from '@wafar/shared';

const json = (schema: z.ZodType): Record<string, unknown> => {
  const converted = z.toJSONSchema(schema, { io: 'input' }) as Record<string, unknown>;
  delete converted['$schema'];
  return converted;
};

const errorResponse = {
  description: 'The error envelope of contracts/auth-api.md §3',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'retryable'],
            properties: {
              code: { type: 'string' },
              retryable: { type: 'boolean' },
              field: { type: 'string' },
              reason: { type: 'string', enum: ['empty', 'too_long', 'emoji'] },
              retryAfterSeconds: { type: 'integer', minimum: 0 },
            },
          },
        },
      },
    },
  },
};

function route(
  method: 'get' | 'post' | 'delete',
  summary: string,
  options: {
    body?: z.ZodType;
    okStatus: string;
    okDescription: string;
    tags: string[];
  },
): Record<string, unknown> {
  const operation: Record<string, unknown> = {
    summary,
    tags: options.tags,
    responses: {
      [options.okStatus]: { description: options.okDescription },
      default: errorResponse,
    },
  };
  if (options.body !== undefined) {
    operation['requestBody'] = {
      required: true,
      content: { 'application/json': { schema: json(options.body) } },
    };
  }
  return { [method]: operation };
}

/** The committed document's full path table. */
export function buildOpenApiDocument(): Record<string, unknown> {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Wafar Identity and File Intake API',
      version: '1.1.0',
      description:
        'The public authentication and intake surface. Generated from packages/shared/src/contracts and the route table.',
    },
    servers: [{ url: '/api/v1' }],
    paths: {
      '/health': {
        servers: [{ url: '/' }],
        get: {
          summary: 'The readiness probe',
          tags: ['operations'],
          responses: {
            '200': {
              description: 'PostgreSQL, the object store, and the scanner answered',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['status', 'database', 'storage', 'scanner'],
                    properties: {
                      status: { type: 'string', enum: ['ok'] },
                      database: { type: 'string', enum: ['ok'] },
                      storage: { type: 'string', enum: ['ok'] },
                      scanner: { type: 'string', enum: ['ok'] },
                    },
                  },
                },
              },
            },
            '503': {
              description: 'One dependency did not answer; the failing field reads error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['status', 'database', 'storage', 'scanner'],
                    properties: {
                      status: { type: 'string', enum: ['degraded'] },
                      database: { type: 'string', enum: ['ok', 'error'] },
                      storage: { type: 'string', enum: ['ok', 'error'] },
                      scanner: { type: 'string', enum: ['ok', 'error'] },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/catalogs/quota': route('get', 'Read the caller’s two effective limits', {
        okStatus: '200',
        okDescription: 'The monthly and active used/limit pairs',
        tags: ['catalogs'],
      }),
      '/uploads': route('post', 'Start one upload', {
        body: startUploadRequestSchema,
        okStatus: '201',
        okDescription: 'The upload session and one presigned URL per part',
        tags: ['uploads'],
      }),
      '/uploads/{uploadId}/complete': route('post', 'Complete and settle one upload', {
        body: completeUploadRequestSchema,
        okStatus: '201',
        okDescription: 'The accepted catalog, or 200 duplicate',
        tags: ['uploads'],
      }),
      '/uploads/{uploadId}': route('delete', 'Abort one upload (idempotent)', {
        okStatus: '204',
        okDescription: 'Cancelled, or nothing to cancel',
        tags: ['uploads'],
      }),
      '/auth/csrf': route('get', 'The render bootstrap', {
        okStatus: '200',
        okDescription: 'A CSRF token and a signed form stamp',
        tags: ['transport'],
      }),
      '/auth/sign-up': route('post', 'Start an account-creation request', {
        body: signUpRequestSchema,
        okStatus: '202',
        okDescription: 'The pending request and the resume cookie',
        tags: ['sign-up'],
      }),
      '/auth/sign-up/verify': route('post', 'Consume the code and create the account', {
        body: verifyCodeRequestSchema,
        okStatus: '200',
        okDescription: 'One of the four outcomes',
        tags: ['sign-up'],
      }),
      '/auth/verifications/{requestId}': route('get', 'The resume read', {
        okStatus: '200',
        okDescription: 'The pending request the cookie names',
        tags: ['sign-up', 'recovery'],
      }),
      '/auth/verifications/resend': route('post', 'Request a new code', {
        body: resendRequestSchema,
        okStatus: '202',
        okDescription: 'The restarted expiries and the remaining allowance',
        tags: ['sign-up', 'recovery'],
      }),
      '/auth/sign-in': route('post', 'Sign in', {
        body: signInRequestSchema,
        okStatus: '200',
        okDescription: 'A session cookie',
        tags: ['session'],
      }),
      '/auth/sign-out': route('post', 'End the current session', {
        okStatus: '204',
        okDescription: 'Ended, or nothing to end',
        tags: ['session'],
      }),
      '/auth/sign-out-all': route('post', 'End every session of the account', {
        okStatus: '204',
        okDescription: 'Every live session revoked',
        tags: ['session'],
      }),
      '/auth/session': route('get', 'Read the session', {
        okStatus: '200',
        okDescription: 'The guest state or the signed-in session',
        tags: ['session'],
      }),
      '/auth/password/forgot': route('post', 'Start a recovery request', {
        body: forgotPasswordRequestSchema,
        okStatus: '202',
        okDescription: 'The pending request and the resume cookie',
        tags: ['recovery'],
      }),
      '/auth/password/forgot/verify': route('post', 'Verify the recovery code', {
        body: verifyCodeRequestSchema,
        okStatus: '200',
        okDescription: 'The verified, no-account, or administrator outcome',
        tags: ['recovery'],
      }),
      '/auth/password/reset': route('post', 'Set the new password', {
        body: resetPasswordRequestSchema,
        okStatus: '200',
        okDescription: 'The reset outcome',
        tags: ['recovery'],
      }),
      '/auth/password/change': route('post', 'The account’s own change action', {
        body: changePasswordRequestSchema,
        okStatus: '200',
        okDescription: 'The change completed and every session ended',
        tags: ['session'],
      }),
    },
    components: {
      securitySchemes: {
        sessionCookie: { type: 'apiKey', in: 'cookie', name: 'wafar.session' },
      },
    },
  };
}
