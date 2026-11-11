// The Twilio adapter's SDK boundary: the client carries the 750 ms bound and the
// send maps acceptance, refusal, and timeout to the port's three answers
// (FR-034, AC-036; ADR-141 decision 1; T304).
import { describe, expect, it, vi } from 'vitest';
import { smsTimeoutMs } from '@wafar/shared';

const { createMessage, twilioFactory } = vi.hoisted(() => {
  const createMessage = vi.fn();
  const twilioFactory = vi.fn(() => ({ messages: { create: createMessage } }));
  return { createMessage, twilioFactory };
});

vi.mock('twilio', () => ({ default: twilioFactory }));

// The adapter must not reach the network through a second path: this test fails
// loudly if the raw fetch call is still the transport.
vi.stubGlobal(
  'fetch',
  vi.fn(() => {
    throw new Error('the adapter must send through the twilio SDK');
  }),
);

import { TwilioSmsTransport } from '../twilio.ts';

const config = {
  accountSid: 'AC00000000000000000000000000000000',
  authToken: 'token',
  from: '+218912345678',
};

const message = {
  to: '+218912345679',
  kind: 'otp_sign_up' as const,
  body: 'رمز التحقق في وفر: 123456. صالح 5 دقائق. لا تشاركه.',
};

describe('the Twilio adapter', () => {
  it('constructs the SDK client with the 750 ms bound', () => {
    new TwilioSmsTransport(config);
    expect(twilioFactory).toHaveBeenCalledWith(config.accountSid, config.authToken, {
      timeout: smsTimeoutMs,
    });
    expect(smsTimeoutMs).toBe(750);
  });

  it('sends through the SDK and answers accepted', async () => {
    createMessage.mockResolvedValueOnce({ sid: 'SM00000000000000000000000000000000' });
    const transport = new TwilioSmsTransport(config);
    await expect(transport.send(message)).resolves.toBe('accepted');
    expect(createMessage).toHaveBeenCalledWith({
      to: message.to,
      from: config.from,
      body: message.body,
    });
  });

  it('answers timed_out when the SDK request times out', async () => {
    createMessage.mockRejectedValueOnce(
      Object.assign(new Error('timeout of 750ms exceeded'), { code: 'ECONNABORTED' }),
    );
    const transport = new TwilioSmsTransport(config);
    await expect(transport.send(message)).resolves.toBe('timed_out');
  });

  it('answers refused for every other dispatch failure', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    createMessage.mockRejectedValueOnce(
      Object.assign(new Error('Unable to create record'), { code: 21608, status: 400 }),
    );
    const transport = new TwilioSmsTransport(config);
    await expect(transport.send(message)).resolves.toBe('refused');
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});
