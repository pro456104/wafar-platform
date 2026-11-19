// The per-merchant attempt bound: 60 attempts per fixed 15-minute UTC window,
// enforced after the file-level checks and a limit refusal (FR-028, FR-061;
// CMV 20; ADR-168).
import {
  attemptWindowStart,
  attemptsPerWindow,
  secondsToNextWindow,
  type AttemptState,
} from '../repository/counters.ts';

export { attemptWindowStart, attemptsPerWindow, secondsToNextWindow };

export type AttemptDecision =
  | { allowed: true; state: AttemptState }
  | { allowed: false; retryAfterSeconds: number };

/**
 * The bound is decided over the state the counter reports: a submission that
 * reaches it while the window is spent is refused, is not counted, and does not
 * move the window.
 */
export function decideAttempt(state: AttemptState, now: Date): AttemptDecision {
  if (state.count >= attemptsPerWindow) {
    return { allowed: false, retryAfterSeconds: secondsToNextWindow(now) };
  }
  return { allowed: true, state };
}
