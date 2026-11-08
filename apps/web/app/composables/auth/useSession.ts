// The session resource: TanStack Query owns it, and `X-Wafar-Activity: 1` is
// sent only from a merchant-initiated handler (FR-032, AC-015).
import { useQuery } from '@tanstack/vue-query';

export interface SessionPayload {
  authenticated: boolean;
  user?: { fullName: string };
  session?: { expiresAt: string; lastActivityAt: string; restricted: boolean };
}

export function useSession() {
  const query = useQuery({
    queryKey: ['session'],
    queryFn: async (): Promise<SessionPayload> => {
      const response = await fetch('/api/v1/auth/session', {
        credentials: 'same-origin',
        headers: { accept: 'application/json' },
      });
      if (response.status === 401) return { authenticated: false };
      return (await response.json()) as SessionPayload;
    },
    staleTime: 30_000,
  });

  /** A merchant-initiated read: the only path that resets the inactivity clock. */
  async function refreshFromUserAction(): Promise<SessionPayload> {
    const response = await fetch('/api/v1/auth/session', {
      credentials: 'same-origin',
      headers: { accept: 'application/json', 'x-wafar-activity': '1' },
    });
    if (response.status === 401) return { authenticated: false };
    return (await response.json()) as SessionPayload;
  }

  return { ...query, refreshFromUserAction };
}
