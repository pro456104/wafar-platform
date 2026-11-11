// The Twilio adapter: the SDK client carries the 750 ms timeout, one dispatch
// with no in-request retry, and no fallback provider. A timeout is a refusal at
// acceptance (CMV 13; ADR-141 decision 1).
import Twilio from 'twilio';
import { smsTimeoutMs } from '@wafar/shared';
import type { SmsMessage, SmsResult, SmsTransport } from './port.ts';
import { AcceptanceEstimate } from './acceptance-estimate.ts';

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  from: string;
}

/** The SDK answers a client-side timeout with one of these codes. */
function isTimeout(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as Error & { code?: unknown }).code;
  return code === 'ECONNABORTED' || code === 'ETIMEDOUT' || error.name === 'AbortError';
}

export class TwilioSmsTransport implements SmsTransport {
  private readonly estimate = new AcceptanceEstimate();
  private readonly client: ReturnType<typeof Twilio>;

  constructor(private readonly config: TwilioConfig) {
    this.client = Twilio(config.accountSid, config.authToken, {
      timeout: smsTimeoutMs,
    });
  }

  async send(message: SmsMessage): Promise<SmsResult> {
    const started = performance.now();
    try {
      await this.client.messages.create({
        to: message.to,
        from: this.config.from,
        body: message.body,
      });
      this.estimate.record(performance.now() - started);
      return 'accepted';
    } catch (error) {
      if (isTimeout(error)) return 'timed_out';
      // The SDK's message can carry the recipient's number, so the log states
      // the provider's code alone (no personal data in a log record).
      const code = (error as { code?: unknown }).code;
      console.error(
        '[sms:twilio] dispatch failed',
        typeof code === 'string' || typeof code === 'number' ? code : 'unknown',
      );
      return 'refused';
    }
  }

  acceptanceEstimateMs(): number {
    return this.estimate.median();
  }
}
