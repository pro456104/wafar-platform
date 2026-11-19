// The in-memory object store the integration harness injects: the same port the
// S3 adapter implements, so a suite asserts the intake's outcomes without a
// network round trip.
import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';
import type { IntakeStorage } from '../../src/http/deps.ts';

interface MultipartState {
  key: string;
  parts: Map<number, { bytes: Uint8Array; etag: string }>;
}

interface ObjectEntry {
  bytes: Uint8Array;
  contentType: string;
}

export interface MemoryStorage extends IntakeStorage {
  /** The objects under one prefix, for the withdrawal proofs. */
  list(prefix: string): string[];
  /** One object's bytes, or null when absent. */
  read(key: string): Uint8Array | null;
  /** One multipart's parts, including an aborted one's empty list. */
  partCount(key: string, uploadId: string): number;
  multiparts: Map<string, MultipartState>;
  objects: Map<string, ObjectEntry>;
  failDeletes: boolean;
  failReads: boolean;
  failBucket: boolean;
  failCreateMultipart: boolean;
}

function etagOf(bytes: Uint8Array): string {
  return `"${createHash('md5').update(bytes).digest('hex')}"`;
}

function toStream(bytes: Uint8Array): ReadableStream<Uint8Array> {
  const node = Readable.from([Buffer.from(bytes)]);
  return Readable.toWeb(node) as ReadableStream<Uint8Array>;
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

export function createMemoryStorage(): MemoryStorage {
  const objects = new Map<string, ObjectEntry>();
  const multiparts = new Map<string, MultipartState>();
  let counter = 0;

  const storage: MemoryStorage = {
    objects,
    multiparts,
    failDeletes: false,
    failReads: false,
    failBucket: false,
    failCreateMultipart: false,

    list(prefix) {
      return [...objects.keys()].filter((key) => key.startsWith(prefix)).sort();
    },

    read(key) {
      return objects.get(key)?.bytes ?? null;
    },

    partCount(key, uploadId) {
      const state = multiparts.get(uploadId);
      if (state === undefined || state.key !== key) return 0;
      return state.parts.size;
    },

    async createMultipart(input) {
      if (storage.failCreateMultipart) throw new Error('multipart create failed');
      counter += 1;
      const uploadId = `upload-${counter}`;
      multiparts.set(uploadId, { key: input.key, parts: new Map() });
      return { uploadId };
    },

    async presignPart(input) {
      return `memory://${input.key}?partNumber=${input.partNumber}&uploadId=${input.uploadId}&expires=${input.expiresInSeconds}`;
    },

    async completeMultipart(input) {
      const state = multiparts.get(input.uploadId);
      if (state === undefined || state.key !== input.key) throw new Error('multipart complete failed');
      const parts = [...input.parts].sort((left, right) => left.partNumber - right.partNumber);
      const chunks: Uint8Array[] = [];
      for (const part of parts) {
        const written = state.parts.get(part.partNumber);
        if (written === undefined) throw new Error('multipart part missing');
        chunks.push(written.bytes);
      }
      const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
      const bytes = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
      objects.set(input.key, { bytes, contentType: 'application/octet-stream' });
    },

    async listParts(input) {
      const state = multiparts.get(input.uploadId);
      if (state === undefined || state.key !== input.key) return { parts: [] };
      return {
        parts: [...state.parts.entries()].map(([partNumber, part]) => ({
          partNumber,
          byteSize: part.bytes.byteLength,
        })),
      };
    },

    async abortMultipart(input) {
      multiparts.delete(input.uploadId);
    },

    async head(input) {
      const entry = objects.get(input.key);
      return entry === undefined ? null : { byteSize: entry.bytes.byteLength };
    },

    async getStream(input) {
      if (storage.failReads) throw new Error('read failed');
      const entry = objects.get(input.key);
      if (entry === undefined) throw new Error('read failed');
      return toStream(entry.bytes);
    },

    async putStream(input) {
      const bytes = await collect(input.body);
      const sha256 = createHash('sha256').update(bytes).digest('hex');
      objects.set(input.key, { bytes, contentType: input.contentType });
      return { byteSize: bytes.byteLength, sha256 };
    },

    async delete(input) {
      if (storage.failDeletes) throw new Error('delete failed');
      objects.delete(input.key);
      const multipart = [...multiparts.entries()].find(([, state]) => state.key === input.key);
      if (multipart !== undefined) multiparts.delete(multipart[0]);
    },

    async headBucket() {
      if (storage.failBucket) throw new Error('bucket unavailable');
    },
  };

  return storage;
}

/** The test's own part write, standing in for the browser's PUT. */
export function writePart(
  storage: MemoryStorage,
  uploadId: string,
  partNumber: number,
  bytes: Uint8Array,
): string {
  const state = storage.multiparts.get(uploadId);
  if (state === undefined) throw new Error('unknown multipart');
  const etag = etagOf(bytes);
  state.parts.set(partNumber, { bytes, etag });
  return etag;
}

/** The part write by the object's key, the shape a route test knows. */
export function writePartForKey(
  storage: MemoryStorage,
  key: string,
  partNumber: number,
  bytes: Uint8Array,
): string {
  const found = [...storage.multiparts.entries()].find(([, state]) => state.key === key);
  if (found === undefined) throw new Error('unknown multipart');
  return writePart(storage, found[0], partNumber, bytes);
}

export { toStream, collect };
