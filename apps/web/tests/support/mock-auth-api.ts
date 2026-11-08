// The visual baseline's API stand-in: every answer the three bare pages read is
// served from the test, so each capture is the named state of
// contracts/ui-contracts.md §10 and not whatever the database happens to hold
// (T116; ADR-129's baseline chain).
import type { Page, Route } from '@playwright/test';

export interface RouteAnswer {
  status: number;
  body?: unknown;
}

/**
 * A held answer leaves its request in flight, so the state's loading rendering
 * is what the baseline captures. The mock records the held route and aborts it
 * when the test releases the page.
 */
export type RouteStep = RouteAnswer | 'hold';

export type AuthRoute =
  | 'bootstrap'
  | 'signUp'
  | 'signUpVerify'
  | 'resume'
  | 'resend'
  | 'signIn'
  | 'recoveryRequest'
  | 'recoveryVerify'
  | 'reset';

export type AuthScript = Partial<Record<AuthRoute, RouteStep | RouteStep[]>>;

export interface AuthApiMock {
  /** How many answered requests are still in flight. */
  readonly held: number;
  /** Aborts every held request, so the page can close without a stray fetch. */
  release(): void;
}

/** The render bootstrap's pair: any non-empty value serves the pages. */
export const bootstrapPair = {
  csrfToken: 'visual-csrf-token',
  formStamp: 'visual-form-stamp',
} as const;

function routeOf(method: string, pathname: string): AuthRoute | undefined {
  if (method === 'GET' && pathname === '/api/v1/auth/csrf') return 'bootstrap';
  if (method === 'GET' && pathname.startsWith('/api/v1/auth/verifications/')) {
    return 'resume';
  }
  if (method !== 'POST') return undefined;
  switch (pathname) {
    case '/api/v1/auth/sign-up':
      return 'signUp';
    case '/api/v1/auth/sign-up/verify':
      return 'signUpVerify';
    case '/api/v1/auth/verifications/resend':
      return 'resend';
    case '/api/v1/auth/sign-in':
      return 'signIn';
    case '/api/v1/auth/password/forgot':
      return 'recoveryRequest';
    case '/api/v1/auth/password/forgot/verify':
      return 'recoveryVerify';
    case '/api/v1/auth/password/reset':
      return 'reset';
    default:
      return undefined;
  }
}

function defaultStep(route: AuthRoute): RouteStep {
  if (route === 'bootstrap') return { status: 200, body: bootstrapPair };
  // A route the scenario did not script answers a refusal, so a missing answer
  // surfaces as a visible error state rather than a silent real request.
  return {
    status: 500,
    body: { error: { code: 'INTERNAL_ERROR', retryable: true } },
  };
}

/**
 * Installs the stand-in before the page is opened. A route given an array
 * answers its calls in order and repeats the last answer, which is how a live
 * resume read is followed by the expired read that ends the request.
 */
export async function installAuthMock(
  page: Page,
  script: AuthScript,
): Promise<AuthApiMock> {
  const planned = new Map<AuthRoute, RouteStep[]>();
  for (const [route, value] of Object.entries(script)) {
    planned.set(route as AuthRoute, Array.isArray(value) ? value : [value as RouteStep]);
  }
  const cursors = new Map<AuthRoute, number>();
  const held: Route[] = [];

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const name = routeOf(request.method(), new URL(request.url()).pathname);
    if (name === undefined) {
      await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
      return;
    }
    const steps = planned.get(name) ?? [defaultStep(name)];
    const cursor = cursors.get(name) ?? 0;
    cursors.set(name, cursor + 1);
    const step = steps[Math.min(cursor, steps.length - 1)] ?? defaultStep(name);
    if (step === 'hold') {
      held.push(route);
      return;
    }
    await route.fulfill({
      status: step.status,
      contentType: 'application/json',
      body: JSON.stringify(step.body ?? {}),
    });
  });

  return {
    get held(): number {
      return held.length;
    },
    release(): void {
      for (const route of held) {
        void route.abort().catch(() => undefined);
      }
      held.length = 0;
    },
  };
}
