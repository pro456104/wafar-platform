// The session resource: TanStack Query owns it, and `X-Wafar-Activity: 1` is
// sent only from a merchant-initiated handler, together with the CSRF pair so
// the signal is honoured (FR-032, AC-015, contracts/auth-api.md §2.3).
import { useQuery } from '@tanstack/vue-query';
import { heldCsrfToken } from './useApi';

export interface SessionPayload {
  authenticated: boolean;
  ended?: 'SESSION_ENDED' | 'ACCOUNT_BLOCKED';
  user?: { fullName: string; role?: 'merchant' | 'administrator' };
  session?: { expiresAt: string; lastActivityAt: string; restricted: boolean };
}

type SessionErrorBody = { error?: { code?: string } };

/**
 * A 401 is the ended-session signal, not the guest state: the body names the
 * reason so the frame can choose its blocked variant (FR-049, AC-053;
 * contracts/auth-api.md §5.12).
 */
async function readSessionResponse(response: Response): Promise<SessionPayload> {
  if (response.status !== 401) return (await response.json()) as SessionPayload;
  const body = (await response.json().catch(() => null)) as SessionErrorBody | null;
  const code = body?.error?.code;
  return {
    authenticated: false,
    ...(code === 'SESSION_ENDED' || code === 'ACCOUNT_BLOCKED' ? { ended: code } : {}),
  };
}

export function useSession() {
  const query = useQuery({
    queryKey: ['session'],
    queryFn: async (): Promise<SessionPayload> => {
      const response = await fetch('/api/v1/auth/session', {
        credentials: 'same-origin',
        headers: { accept: 'application/json' },
      });
      return readSessionResponse(response);
    },
    staleTime: 30_000,
  });

  /** A merchant-initiated read: the only path that resets the inactivity clock. */
  async function refreshFromUserAction(): Promise<SessionPayload> {
    const token = heldCsrfToken();
    const response = await fetch('/api/v1/auth/session', {
      credentials: 'same-origin',
      headers: {
        accept: 'application/json',
        'x-wafar-activity': '1',
        ...(token === null ? {} : { 'x-wafar-csrf': token }),
      },
    });
    return readSessionResponse(response);
  }

  return { ...query, refreshFromUserAction };
}
