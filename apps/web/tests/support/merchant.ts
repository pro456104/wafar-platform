// A signed-in merchant for the upload journeys: the product's own sign-up and
// code step, so the session cookie, the CSRF pair, and the account are the ones
// the browser would carry (T033).
import type { Page } from '@playwright/test';
import {
  fillSignUpForm,
  openSignUp,
  submitSignUp,
  uniqueNationalNumber,
} from './bare.ts';
import { dispatchMark, waitForDispatch } from './fake-inbox.ts';
import { waitForHydration } from './hydration.ts';
import { clearRateLimits } from './seed.ts';

export const merchantPassword = 'correct horse battery staple';

export async function enterAsMerchant(page: Page): Promise<void> {
  await clearRateLimits();
  const phone = uniqueNationalNumber(7);
  await openSignUp(page);
  await fillSignUpForm(page, {
    fullName: 'تاجر الاختبار',
    phone,
    password: merchantPassword,
    city: 'طرابلس',
    shopName: 'محل الاختبار',
  });
  const before = dispatchMark();
  await submitSignUp(page);
  const dispatch = await waitForDispatch({ kind: 'otp_sign_up', after: before });
  await page.locator('input[autocomplete="one-time-code"]').fill(dispatch.code);
  await page.locator('button.wf-code-step__submit').click();
  await page.getByText('حسابك جاهز، وأنت مسجل الدخول الآن.').waitFor();

  const quota = page.waitForResponse((response) =>
    response.url().endsWith('/api/v1/catalogs/quota'),
  );
  await page.goto('/upload');
  await quota;
  await waitForHydration(page);
}
