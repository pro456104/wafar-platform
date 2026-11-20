// The bounded ZIP reader: one streaming decompression of an OOXML package
// whose decoded bytes stop at the cap and whose work stops at the deadline,
// so a zip bomb is refused while it expands rather than after every member has
// been allocated (FR-029, FR-031; CMV 15).
import { Unzip, UnzipInflate } from 'fflate';

/** CMV 15: 1 GiB of decoded content. */
export const zipDecodedCapBytes = 1_073_741_824;

export type ZipRead =
  | { kind: 'ok'; files: Record<string, Uint8Array> }
  | { kind: 'over' }
  | { kind: 'timeout' }
  | { kind: 'corrupt' };

/**
 * The sentinel thrown from the data callback to stop fflate's synchronous push.
 * It is an `Error` so the throw satisfies the lint rule, and it is caught by
 * identity in this file only; it never escapes `readZip`.
 */
class ZipStopError extends Error {
  constructor() {
    super('zip-stop');
    this.name = 'ZipStopError';
  }
}

export interface ZipReadOptions {
  cap?: number;
  deadline?: number;
}

/**
 * Reads one ZIP archive in 64 KiB pushes. The bytes a member decodes to are
 * counted as they arrive, so the cap is enforced during inflation and not by a
 * central-directory claim alone; an expired deadline answers before the next
 * chunk is pushed.
 */
export function readZip(
  bytes: Uint8Array,
  options: ZipReadOptions = {},
): ZipRead {
  const cap = options.cap ?? zipDecodedCapBytes;
  const deadline = options.deadline ?? Number.POSITIVE_INFINITY;
  const files: Record<string, Uint8Array> = {};
  let stopped: 'over' | 'timeout' | 'corrupt' | null = null;
  let total = 0;

  const unzip = new Unzip((file) => {
    const chunks: Uint8Array[] = [];
    let length = 0;
    file.ondata = (dataError, chunk, final) => {
      if (dataError !== null) {
        stopped ??= 'corrupt';
        return;
      }
      if (stopped !== null) {
        if (final) chunks.length = 0;
        return;
      }
      total += chunk.byteLength;
      if (total > cap) {
        stopped = 'over';
        throw new ZipStopError();
      }
      if (Date.now() > deadline) {
        stopped = 'timeout';
        throw new ZipStopError();
      }
      if (chunk.byteLength > 0) {
        chunks.push(chunk);
        length += chunk.byteLength;
      }
      if (final) {
        const body = new Uint8Array(length);
        let offset = 0;
        for (const part of chunks) {
          body.set(part, offset);
          offset += part.byteLength;
        }
        files[file.name] = body;
      }
    };
    file.start();
  });
  unzip.register(UnzipInflate);

  try {
    const chunkSize = 64 * 1024;
    for (let offset = 0; offset < bytes.byteLength; offset += chunkSize) {
      if (stopped !== null) break;
      if (Date.now() > deadline) {
        stopped = 'timeout';
        break;
      }
      const end = Math.min(offset + chunkSize, bytes.byteLength);
      unzip.push(bytes.subarray(offset, end), end === bytes.byteLength);
    }
  } catch (error) {
    if (!(error instanceof ZipStopError) && stopped === null) stopped = 'corrupt';
  }

  // The callbacks assign the outcome, so read it as the declared union rather
  // than the linear-flow narrowing the compiler can see.
  const outcome = stopped as 'over' | 'timeout' | 'corrupt' | null;
  if (outcome === 'over') return { kind: 'over' };
  if (outcome === 'timeout') return { kind: 'timeout' };
  if (outcome === 'corrupt') return { kind: 'corrupt' };
  return { kind: 'ok', files };
}
