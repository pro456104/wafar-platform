// The deterministic scanner double: it answers the same port the real adapter
// does, after a fixed 150 ms, and can be told to answer infected, unavailable,
// or past the budget (contracts/intake-api.md §6.2; T009).
import type { Scanner, ScanVerdict } from '../../../http/deps.ts';

export type ScannerMode = 'clean' | 'infected' | 'unavailable' | 'over-budget';

export interface ScannerDouble extends Scanner {
  setMode(mode: ScannerMode): void;
  setDelay(ms: number): void;
  calls(): number;
}

export function createScannerDouble(
  options: { delayMs?: number; mode?: ScannerMode } = {},
): ScannerDouble {
  let mode: ScannerMode = options.mode ?? 'clean';
  let delayMs = options.delayMs ?? 150;
  let calls = 0;

  const wait = async (ms: number): Promise<void> =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  return {
    calls: () => calls,
    setMode(next) {
      mode = next;
    },
    setDelay(ms) {
      delayMs = ms;
    },
    async scan(): Promise<ScanVerdict> {
      calls += 1;
      if (mode === 'over-budget') {
        await wait(delayMs);
        return { verdict: 'unavailable' };
      }
      await wait(Math.min(delayMs, 150));
      if (mode === 'infected') return { verdict: 'infected', signature: 'Eicar-Test-Signature' };
      if (mode === 'unavailable') return { verdict: 'unavailable' };
      return { verdict: 'clean' };
    },
    async ping(input) {
      if (mode === 'unavailable' || mode === 'over-budget') {
        await wait(input.budgetMs);
        return false;
      }
      return true;
    },
  };
}
