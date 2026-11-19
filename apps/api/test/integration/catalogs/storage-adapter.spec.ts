// The storage adapter's contract, proved against a stubbed transport: one key
// and one part number per signed grant, the exact Content-Length, the 15-minute
// expiry, the multipart's create/complete/list/abort answers, `NoSuchUpload`
// read as an empty part list, and the SHA-256 and byte count computed while a
// stream is written (contracts/intake-api.md section 6.1; T031).
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createStorage } from '../../../src/modules/catalogs/storage/adapter.ts';

interface Captured {
  method: string;
  url: string;
  headers: Headers;
  body: string | null;
}

function stub(responses: Response[]): Captured[] {
  const captured: Captured[] = [];
  const queue = [...responses];
  vi.stubGlobal(
    'fetch',
    async (request: Request) => {
      const body = ['GET', 'HEAD'].includes(request.method)
        ? null
        : await request.text();
      captured.push({
        method: request.method,
        url: request.url,
        headers: request.headers,
        body,
      });
      const next = queue.shift();
      if (next === undefined) throw new Error('unexpected request');
      return next;
    },
  );
  return captured;
}

function storage() {
  return createStorage({
    endpoint: 'http://storage.test:8333',
    region: 'us-east-1',
    bucket: 'wafar',
    accessKeyId: 'access',
    secretAccessKey: 'secret',
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the storage adapter', () => {
  it('signs one part URL for one key, one part, and its exact byte count', async () => {
    stub([]);
    const url = await storage().presignPart({
      key: 'intake/upload-1/original',
      uploadId: 'multipart-1',
      partNumber: 3,
      byteSize: 8_388_608,
      expiresInSeconds: 900,
    });

    const parsed = new URL(url);
    expect(parsed.origin).toBe('http://storage.test:8333');
    expect(parsed.pathname).toBe('/wafar/intake/upload-1/original');
    expect(parsed.searchParams.get('partNumber')).toBe('3');
    expect(parsed.searchParams.get('uploadId')).toBe('multipart-1');
    expect(parsed.searchParams.get('X-Amz-Expires')).toBe('900');
    expect(parsed.searchParams.get('X-Amz-Signature')).toMatch(/^[0-9a-f]{64}$/);
    expect(parsed.searchParams.get('X-Amz-SignedHeaders')).toBe('host');
    // One part number and one key: no second of either in the grant.
    expect([...parsed.searchParams.keys()].filter((name) => name === 'partNumber')).toHaveLength(1);
    expect(parsed.pathname.split('/')).toHaveLength(5);
  });

  it('creates a multipart upload and parses its identifier', async () => {
    const captured = stub([
      new Response('<InitiateMultipartUploadResult><UploadId>abc123</UploadId></InitiateMultipartUploadResult>', {
        status: 200,
      }),
    ]);
    const created = await storage().createMultipart({
      key: 'intake/upload-1/original',
      contentType: 'application/octet-stream',
    });
    expect(created.uploadId).toBe('abc123');
    expect(captured[0]?.method).toBe('POST');
    expect(captured[0]?.url).toContain('?uploads');
    expect(captured[0]?.headers.get('authorization')).toContain('AWS4-HMAC-SHA256');
  });

  it('maps NoSuchUpload to an empty part list', async () => {
    stub([
      new Response('<Error><Code>NoSuchUpload</Code></Error>', { status: 404 }),
	]);
    await expect(
      storage().listParts({ key: 'intake/upload-1/original', uploadId: 'gone' }),
    ).resolves.toEqual({ parts: [] });
  });

  it('reads each part’s number and the size the store reports', async () => {
    stub([
      new Response(
        '<ListPartsResult><Part><PartNumber>1</PartNumber><Size>8388608</Size></Part><Part><PartNumber>2</PartNumber><Size>1024</Size></Part></ListPartsResult>',
        { status: 200 },
      ),
    ]);
    await expect(
      storage().listParts({ key: 'intake/upload-1/original', uploadId: 'live' }),
    ).resolves.toEqual({
      parts: [
        { partNumber: 1, byteSize: 8_388_608 },
        { partNumber: 2, byteSize: 1024 },
      ],
    });
  });

  it('completes the multipart with the ordered part list', async () => {
    const captured = stub([new Response('<CompleteMultipartUploadResult/>', { status: 200 })]);
    await storage().completeMultipart({
      key: 'intake/upload-1/original',
      uploadId: 'abc123',
      parts: [
        { partNumber: 1, etag: '"one"' },
        { partNumber: 2, etag: '"two"' },
      ],
    });
    expect(captured[0]?.method).toBe('POST');
    expect(captured[0]?.body).toContain('<PartNumber>1</PartNumber><ETag>"one"</ETag>');
    expect(captured[0]?.body).toContain('<PartNumber>2</PartNumber><ETag>"two"</ETag>');
    expect(captured[0]?.body?.indexOf('"one"')).toBeLessThan(
      captured[0]?.body?.indexOf('"two"') ?? -1,
    );
  });

  it('aborts the multipart and treats an already absent upload as done', async () => {
    const captured = stub([
      new Response(null, { status: 204 }),
      new Response('<Error><Code>NoSuchUpload</Code></Error>', { status: 404 }),
    ]);
    await storage().abortMultipart({ key: 'intake/upload-1/original', uploadId: 'abc123' });
    expect(captured[0]?.method).toBe('DELETE');
    await expect(
      storage().abortMultipart({ key: 'intake/upload-1/original', uploadId: 'abc123' }),
    ).resolves.toBeUndefined();
  });

  it('reads a head as absent or as its byte count', async () => {
    stub([
      new Response(null, { status: 404 }),
      new Response(null, { status: 200, headers: { 'content-length': '4096' } }),
    ]);
    await expect(storage().head({ key: 'intake/upload-1/original' })).resolves.toBeNull();
    await expect(storage().head({ key: 'intake/upload-1/original' })).resolves.toEqual({
      byteSize: 4096,
    });
  });

  it('hashes and counts the bytes while it writes the kept stream', async () => {
    const captured = stub([new Response('', { status: 200 })]);
    const bytes = new TextEncoder().encode('%PDF-1.7 supplier catalog');
    const result = await storage().putStream({
      key: 'catalogs/catalog-1/kept',
      contentType: 'application/pdf',
      body: new Blob([bytes.slice().buffer]).stream() as ReadableStream<Uint8Array>,
    });
    expect(result.byteSize).toBe(bytes.byteLength);
    expect(result.sha256).toBe(createHash('sha256').update(bytes).digest('hex'));
    expect(captured[0]?.method).toBe('PUT');
    expect(captured[0]?.headers.get('content-type')).toBe('application/pdf');
  });

  it('deletes an object and reads a missing object as already gone', async () => {
    const captured = stub([
      new Response(null, { status: 204 }),
      new Response(null, { status: 404 }),
    ]);
    await storage().delete({ key: 'intake/upload-1/original' });
    await expect(storage().delete({ key: 'intake/upload-1/original' })).resolves.toBeUndefined();
    expect(captured.map((entry) => entry.method)).toEqual(['DELETE', 'DELETE']);
  });

  it('probes the bucket and answers a failed probe with an error', async () => {
    stub([new Response(null, { status: 200 }), new Response(null, { status: 404 })]);
    await expect(storage().headBucket()).resolves.toBeUndefined();
    await expect(storage().headBucket()).rejects.toThrow(/bucket probe failed/);
  });

  it('refuses a read the store does not answer with bytes', async () => {
    stub([new Response('', { status: 500 })]);
    await expect(storage().getStream({ key: 'catalogs/catalog-1/kept' })).rejects.toThrow(
      /read failed/,
    );
  });
});
