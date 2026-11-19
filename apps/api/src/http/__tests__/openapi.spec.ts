// Unit test the generated OpenAPI document: the unversioned readiness probe is
// published beside the versioned surface, and its two answers carry the bodies
// contracts/auth-api.md §5.13 fixes (T322).
import { describe, expect, it } from 'vitest';
import { buildOpenApiDocument } from '../openapi.ts';

interface PathItem {
  servers?: Array<{ url: string }>;
  get?: { responses: Record<string, unknown> };
}

describe('the OpenAPI document', () => {
  it('publishes the unversioned health probe beside the versioned surface', () => {
    const document = buildOpenApiDocument() as {
      servers: Array<{ url: string }>;
      paths: Record<string, PathItem>;
    };
    expect(document.servers).toEqual([{ url: '/api/v1' }]);

    const health = document.paths['/health'];
    expect(health?.servers).toEqual([{ url: '/' }]);
    expect(Object.keys(health?.get?.responses ?? {})).toEqual(['200', '503']);

    const ok = health?.get?.responses['200'] as {
      content: { 'application/json': { schema: { properties: Record<string, unknown> } } };
    };
    expect(ok.content['application/json'].schema.properties).toMatchObject({
      status: { enum: ['ok'] },
      database: { enum: ['ok'] },
      storage: { enum: ['ok'] },
      scanner: { enum: ['ok'] },
    });

    const degraded = health?.get?.responses['503'] as {
      content: { 'application/json': { schema: { properties: Record<string, unknown> } } };
    };
    expect(degraded.content['application/json'].schema.properties).toMatchObject({
      status: { enum: ['degraded'] },
      database: { enum: ['ok', 'error'] },
      storage: { enum: ['ok', 'error'] },
      scanner: { enum: ['ok', 'error'] },
    });
  });
});
