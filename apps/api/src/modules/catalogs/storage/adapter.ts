// The object store's one adapter: every S3 request the intake makes is signed
// here with aws4fetch, against one private bucket (contracts/intake-api.md
// §6.1; ADR-172).
import { createHash } from 'node:crypto';
import { AwsClient } from 'aws4fetch';
import type { IntakeStorage } from '../../../http/deps.ts';

export interface StorageConfig {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

const encoder = new TextEncoder();

function xmlValue(xml: string, tag: string): string | null {
  const match = new RegExp(`<${tag}>([^<]*)</${tag}>`).exec(xml);
  return match?.[1] ?? null;
}

function xmlBlocks(xml: string, tag: string): string[] {
  return [...xml.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g'))].map(
    (match) => match[1] ?? '',
  );
}

export function createStorage(config: StorageConfig): IntakeStorage {
  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region,
    service: 's3',
  });
  const base = config.endpoint.replace(/\/$/, '');
  const bucketUrl = `${base}/${config.bucket}`;

  function objectUrl(key: string, query = ''): string {
    return `${bucketUrl}/${key.split('/').map(encodeURIComponent).join('/')}${query}`;
  }

  async function signed(url: string, init: RequestInit): Promise<Response> {
    const request = await client.sign(url, init);
    return fetch(request);
  }

  return {
    async createMultipart(input) {
      const response = await signed(objectUrl(input.key, '?uploads'), {
        method: 'POST',
        headers: { 'content-type': input.contentType },
      });
      const xml = await response.text();
      const uploadId = xmlValue(xml, 'UploadId');
      if (!response.ok || uploadId === null) {
        throw new Error(`multipart create failed: ${response.status}`);
      }
      return { uploadId };
    },

    async presignPart(input) {
      const url = objectUrl(
        input.key,
        `?partNumber=${input.partNumber}&uploadId=${encodeURIComponent(input.uploadId)}&X-Amz-Expires=${input.expiresInSeconds}`,
      );
      const signedRequest = await client.sign(url, {
        method: 'PUT',
        headers: {
          'content-type': 'application/octet-stream',
          'content-length': String(input.byteSize),
        },
        aws: { signQuery: true },
      });
      return signedRequest.url;
    },

    async completeMultipart(input) {
      const body = `<CompleteMultipartUpload>${input.parts
        .map((part) => `<Part><PartNumber>${part.partNumber}</PartNumber><ETag>${part.etag}</ETag></Part>`)
        .join('')}</CompleteMultipartUpload>`;
      const response = await signed(
        objectUrl(input.key, `?uploadId=${encodeURIComponent(input.uploadId)}`),
        {
          method: 'POST',
          headers: { 'content-type': 'application/xml' },
          body,
        },
      );
      await response.text();
      if (!response.ok) throw new Error(`multipart complete failed: ${response.status}`);
    },

    async listParts(input) {
      const response = await signed(
        objectUrl(input.key, `?uploadId=${encodeURIComponent(input.uploadId)}`),
        { method: 'GET' },
      );
      const xml = await response.text();
      // `NoSuchUpload` is the answer once the abort has run, and it means the
      // same thing as an empty list: no part survives (contract §6.1).
      if (response.status === 404 || xml.includes('<Code>NoSuchUpload</Code>')) {
        return { parts: [] };
      }
      if (!response.ok) throw new Error(`multipart list failed: ${response.status}`);
      return {
        parts: xmlBlocks(xml, 'Part').map((block) => ({
          partNumber: Number(xmlValue(block, 'PartNumber') ?? '0'),
          byteSize: Number(xmlValue(block, 'Size') ?? '0'),
        })),
      };
    },

    async abortMultipart(input) {
      const response = await signed(
        objectUrl(input.key, `?uploadId=${encodeURIComponent(input.uploadId)}`),
        { method: 'DELETE' },
      );
      const text = await response.text();
      if (!response.ok && !text.includes('<Code>NoSuchUpload</Code>')) {
        throw new Error(`multipart abort failed: ${response.status}`);
      }
    },

    async head(input) {
      const response = await signed(objectUrl(input.key), { method: 'HEAD' });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`head failed: ${response.status}`);
      const length = response.headers.get('content-length');
      return { byteSize: length === null ? 0 : Number(length) };
    },

    async getStream(input) {
      const response = await signed(objectUrl(input.key), { method: 'GET' });
      if (!response.ok || response.body === null) {
        throw new Error(`read failed: ${response.status}`);
      }
      return response.body;
    },

    async putStream(input) {
      const hash = createHash('sha256');
      let byteSize = 0;
      const hashed = input.body.pipeThrough(
        new TransformStream<Uint8Array, Uint8Array>({
          transform(chunk, controller) {
            hash.update(chunk);
            byteSize += chunk.byteLength;
            controller.enqueue(chunk);
          },
        }),
      );
      const response = await signed(objectUrl(input.key), {
        method: 'PUT',
        headers: { 'content-type': input.contentType },
        body: hashed,
        // A streamed PUT needs half-duplex in the fetch spec; Node's
        // implementation accepts the stream either way.
        duplex: 'half',
      } as RequestInit);
      await response.text();
      if (!response.ok) throw new Error(`write failed: ${response.status}`);
      return { byteSize, sha256: hash.digest('hex') };
    },

    async delete(input) {
      const response = await signed(objectUrl(input.key), { method: 'DELETE' });
      await response.text();
      if (!response.ok && response.status !== 404) {
        throw new Error(`delete failed: ${response.status}`);
      }
    },

    async headBucket() {
      const response = await signed(bucketUrl, { method: 'HEAD' });
      if (!response.ok) throw new Error(`bucket probe failed: ${response.status}`);
    },
  };
}

export { encoder };
