// The merchant-area door: a guest goes to sign-in carrying an internal return
// target, an administrator session is treated as a guest, a blocked account
// shows R1's blocked state, and an ended session shows the ended-session state
// with no retry (FR-002-FR-004, AC-002, AC-043).
//
// The door reads the session resource to its answer before it decides. Without
// that wait the in-flight read would look like a guest and a signed-in merchant
// would be turned away on the first navigation.
import { bareRoutes, merchantAreaPaths } from '@wafar/shared';
import { useSession } from '../composables/auth/useSession';
import { internalReturnTarget } from '../utils/return-target';

export default defineNuxtRouteMiddleware(async (to) => {
  const session = useSession();
  if (session.data.value === undefined) {
    try {
      await session.suspense();
    } catch {
      // A read that cannot answer is the guest state: the door still answers.
    }
  }
  const payload = session.data.value;

  if (payload === undefined || payload.authenticated === false) {
    // An ended session or a blocked account is not the guest state: the page
    // renders the ended-session panel, and only a real guest is sent to the
    // door (FR-004, FR-049; AC-002, AC-010).
    if (payload?.ended !== undefined) return;
    const target = merchantAreaPaths.includes(to.path) ? to.fullPath : null;
    return navigateTo({
      path: bareRoutes.signIn,
      query: target === null ? {} : { redirect: target },
    });
  }

  // A live administrator session is a guest at the merchant door: the page
  // never renders it, and the sign-in page refuses the account with R1's
  // uniform refusal, so no administrator state is added here (FR-002, AC-002).
  if (payload.user?.role === 'administrator') {
    const target = merchantAreaPaths.includes(to.path) ? to.fullPath : null;
    return navigateTo({
      path: bareRoutes.signIn,
      query: target === null ? {} : { redirect: target },
    });
  }
});

export { internalReturnTarget };
