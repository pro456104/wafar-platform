// Unit test the environment guard: production must inject the authentication
// secret and must not select the development placeholder (Constitution: Query
// Safety and Secrets; plan Gate 2; T296).
import { describe, expect, it } from 'vitest';
import { parseEnvironment } from '../env.ts';

const developmentSecret = 'development-only-secret-value-0000';

describe('the environment', () => {
  it('refuses a production boot without an injected authentication secret', () => {
    const result = parseEnvironment({ NODE_ENV: 'production' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors['BETTER_AUTH_SECRET']).toEqual([
        'BETTER_AUTH_SECRET must be supplied in production',
      ]);
    }
  });

  it('refuses the development placeholder in production', () => {
    const result = parseEnvironment({
      NODE_ENV: 'production',
      BETTER_AUTH_SECRET: developmentSecret,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors['BETTER_AUTH_SECRET']).toEqual([
        'BETTER_AUTH_SECRET must not be the development placeholder in production',
      ]);
    }
  });

  it('accepts an injected production secret', () => {
    const secret = 'a-production-secret-value-000000';
    const result = parseEnvironment({
      NODE_ENV: 'production',
      BETTER_AUTH_SECRET: secret,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.BETTER_AUTH_SECRET).toBe(secret);
    }
  });

  it('keeps the development placeholder outside production', () => {
    const result = parseEnvironment({ NODE_ENV: 'development' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.BETTER_AUTH_SECRET).toBe(developmentSecret);
    }
  });

  it('refuses a production secret shorter than the minimum', () => {
    const result = parseEnvironment({
      NODE_ENV: 'production',
      BETTER_AUTH_SECRET: 'too-short',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors['BETTER_AUTH_SECRET']).toBeDefined();
    }
  });
});
