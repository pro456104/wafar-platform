# SMS provider runbook

**Provider.** Twilio Programmable Messaging (ADR-141, CMV 13). One-way
transactional messages only: the sign-up code, the recovery code, and the two
security notices. `To` is always E.164; no inbound path, no marketing, no email
fallback.

## The port's contract

`apps/api/src/modules/auth/sms/port.ts` fixes three answers: `accepted`,
`refused`, `timed_out`. The adapter's timeout is **750 ms** and is the upper
bound of an acceptance; a timeout is a refusal at acceptance. There is no
in-request retry and no fallback provider.

The four bodies are fixed in `templates.ts`: Arabic, right-to-left, Latin
numerals, no diacritics, no emoji. A one-time-code body is at most 70 UCS-2 code
units after `{code}` is replaced by six digits; a notice is at most 134.

## Development and CI

`SMS_TRANSPORT=fake` selects the deterministic fake. `SMS_FAKE_ACCEPT_MS` sets
its acceptance duration — a whole number of milliseconds from 0 to 750, `0` by
default — and the value is read once at boot; a value outside the range stops
startup. The fake records every message in memory and writes one console line
per dispatch, which is what the end-to-end suites read.

## When the channel is down

A refused or timed-out dispatch changes nothing: the previous code stays valid,
the request stays live, and no re-request allowance is spent. The API answers
`OTP_SEND_FAILED` (502, retryable) and emits `auth.otp.dispatch_failed` with the
flow's `kind` and the channel's name. No patient data appears in the record.

The operator's procedure:

1. Confirm the outage with the provider's status page.
2. Tell a merchant who reports a missing code to retry: the previous code stays
   valid and the retry is a new request, so no allowance is spent by the
   refusal.
3. Change no configuration: the port, the provider, and the 750 ms acceptance
   bound stay as they are.
4. Record the incident, naming the time, the affected flow, and the
   `auth.otp.dispatch_failed` records.

The platform does not report itself unhealthy: `/health` stays 200 because
PostgreSQL is the only readiness dependency and the provider is an outbound
channel whose refusal the flow already handles. R12's monitoring and alerting
own the alert. A replacement provider is a decision record and an adapter, not a
configuration switch, because the port is the boundary.
