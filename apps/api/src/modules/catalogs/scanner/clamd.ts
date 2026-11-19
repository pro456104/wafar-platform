// The antivirus client: clamd's INSTREAM protocol over node:net, one attempt
// per request, with the 90-second budget and `unavailable` on every failure
// (contracts/intake-api.md §6.2; ADR-173).
import { connect, type Socket } from 'node:net';
import type { Scanner, ScanVerdict } from '../../../http/deps.ts';

const zINSTREAM = Buffer.from([0x7a, 0x49, 0x4e, 0x53, 0x54, 0x52, 0x45, 0x41, 0x4d, 0x00]);
const chunkSize = 64 * 1024;

export interface ClamdConfig {
  host: string;
  port: number;
}

export function createClamdScanner(config: ClamdConfig): Scanner {
  async function exchange(
    write: (socket: Socket) => void | Promise<void>,
    budgetMs: number,
  ): Promise<{ answer: string } | null> {
    return new Promise((resolve) => {
      const socket = connect({ host: config.host, port: config.port });
      const chunks: Buffer[] = [];
      let settled = false;
      const timer = setTimeout(() => finish(null), budgetMs);

      function finish(value: { answer: string } | null): void {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        socket.destroy();
        resolve(value);
      }

      socket.on('data', (chunk: Buffer) => chunks.push(chunk));
      socket.on('end', () => finish({ answer: Buffer.concat(chunks).toString('utf8') }));
      socket.on('error', () => finish(null));
      socket.on('close', () => finish({ answer: Buffer.concat(chunks).toString('utf8') }));

      const sent = write(socket);
      if (sent instanceof Promise) sent.catch(() => finish(null));
    });
  }

  return {
    async scan(input): Promise<ScanVerdict> {
      const result = await exchange(async (socket) => {
        socket.write(zINSTREAM);
        const reader = input.stream.getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          for (let offset = 0; offset < value.byteLength; offset += chunkSize) {
            const slice = value.subarray(offset, offset + chunkSize);
            const header = Buffer.alloc(4);
            header.writeUInt32BE(slice.byteLength, 0);
            socket.write(header);
            socket.write(slice);
          }
        }
        socket.write(Buffer.from([0, 0, 0, 0]));
      }, input.budgetMs);

      if (result === null) return { verdict: 'unavailable' };
      const answer = result.answer.trim();
      if (answer.endsWith('OK')) return { verdict: 'clean' };
      const found = /stream: (.+) FOUND/.exec(answer);
      if (found !== null) return { verdict: 'infected', signature: found[1] ?? 'unknown' };
      return { verdict: 'unavailable' };
    },

    async ping(input): Promise<boolean> {
      const result = await exchange((socket) => {
        socket.write('zPING\0');
      }, input.budgetMs);
      return result !== null && result.answer.includes('PONG');
    },
  };
}
