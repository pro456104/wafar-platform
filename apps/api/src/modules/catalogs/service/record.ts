// The operational record: one structured `intake.upload.settled` line per
// submission, carrying the outcome, the cause, the time, and the correlation
// identifier alone (FR-062, AC-034, SC-013).
import type { IntakeErrorCode } from '@wafar/shared';

export type SettledOutcome = 'accepted' | 'duplicate' | 'refused' | 'failed' | 'cancelled';

/** The one line's closed field set; no trader value enters it. */
export interface SettledRecord {
  outcome: SettledOutcome;
  cause?: IntakeErrorCode;
  requestId: string;
  timestamp: Date;
}

export interface RecordSink {
  write(line: string): void;
}

export const settledEvent = 'intake.upload.settled';

export function createRecord(sink: RecordSink) {
  return {
    settled(record: SettledRecord): void {
      const line = {
        level: 'info',
        event: settledEvent,
        outcome: record.outcome,
        ...(record.cause === undefined ? {} : { cause: record.cause }),
        requestId: record.requestId,
        timestamp: record.timestamp.toISOString(),
      };
      try {
        sink.write(JSON.stringify(line));
      } catch {
        // A failing sink never changes the submission's outcome.
      }
    },
  };
}

export type OperationalRecord = ReturnType<typeof createRecord>;
