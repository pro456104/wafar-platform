// The recovery journey end to end: the cross-links, the code step, the reload
// onto the new-password step, the in-place confirmation, the terminal message
// with no retry control, no address, history entry, referrer, or stored value
// carrying the number, and SC-003's three minutes (FR-014, FR-036, FR-037,
// FR-038, FR-002, AC-016, AC-039, AC-002; T084).
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  fillSignUpForm,
  openSignUp,
  submitSignUp,
  uniqueNationalNumber,
} from '../support/bare';
import { dispatchMark, waitForDispatch } from '../support/fake-inbox';

const password = 'correct horse battery staple';
const newPassword = 'a longer replacement phrase';

async function openRecovery(page: Page): Promise<void> {
  const bootstrap = page.waitForResponse((response) =>
    response.url().endsWith('/api/v1/auth/csrf'),
  );
  await page.goto('/auth/forgot-password');
  await bootstrap;
}

async function reloadRecovery(page: Page): Promise<void> {
  const bootstrap = page.waitForResponse((response) =>
    response.url().endsWith('/api/v1/auth/csrf'),
  );
  await page.reload();
  await bootstrap;
}

test('the recovery journey reloads onto the new-password step and states the outcome once', async ({
  page,
  context,
}) => {
  const startedAt = Date.now();
  const phone = uniqueNationalNumber(5);

  // Seed one account through the product's own sign-up journey.
  const before = dispatchMark();
  await openSignUp(page);
  await fillSignUpForm(page, {
    fullName: 'هدى موسى',
    phone,
    password,
    city: 'مصراتة',
  });
  await submitSignUp(page);
  const dispatch = await waitForDispatch({ kind: 'otp_sign_up', after: before });
  await page.locator('input[autocomplete="one-time-code"]').fill(dispatch.code);
  await page.locator('button.wf-code-step__submit').click();
  await expect(page.getByText('حسابك جاهز، وأنت مسجل الدخول الآن.')).toBeVisible();
  await context.clearCookies();

  await openRecovery(page);
  const historyLength = await page.evaluate(() => history.length);
  expect(await page.evaluate(() => document.referrer)).toBe('');

  // The cross-links the page carries.
  await expect(
    page.locator('.bare-layout__links a[href="/auth/sign-in"]').first(),
  ).toBeVisible();
  await expect(
    page.locator('.bare-layout__links a[href="/auth/sign-up"]').first(),
  ).toBeVisible();

  // The request, then the code step in place.
  const beforeRequest = dispatchMark();
  await page.locator('input[autocomplete="tel-national"]').fill(phone);
  await page.getByRole('button', { name: 'إرسال رمز الاستعادة' }).click();
  const recovery = await waitForDispatch({
    kind: 'otp_recovery',
    after: beforeRequest,
  });
  await expect(page.locator('.wf-code-step')).toBeVisible();
  await expect(page.locator('.wf-code-step__collected')).toContainText(
    `+218 ${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(5)}`,
  );
  await expect(page.locator('input[autocomplete="one-time-code"]')).toBeFocused();

  // A reload while the code is pending resumes the code step.
  await reloadRecovery(page);
  await expect(page.locator('.wf-code-step')).toBeVisible();

  // The correct code moves to the new-password step.
  await page.locator('input[autocomplete="one-time-code"]').fill(recovery.code);
  await page.locator('button.wf-code-step__submit').click();
  await expect(page.locator('.wf-new-password')).toBeVisible();
  await expect(page.getByText('كلمة المرور الجديدة').first()).toBeVisible();

  // A reload while the request is verified returns to the new-password step.
  await reloadRecovery(page);
  await expect(page.locator('.wf-new-password')).toBeVisible();
  await expect(page.locator('.wf-code-step')).toHaveCount(0);

  // The confirmation is in place, and the outcome offers no retry control.
  await page.getByLabel('كلمة المرور الجديدة').fill(newPassword);
  await page.getByRole('button', { name: 'حفظ كلمة المرور' }).click();
  await expect(
    page.getByText('تم تغيير كلمة المرور، وانتهت كل الجلسات.'),
  ).toBeVisible();
  await expect(page.locator('.wf-code-step')).toHaveCount(0);
  await expect(page.locator('.wf-new-password')).toHaveCount(0);
  await expect(page.locator('.wf-outcome button')).toHaveCount(0);

  // No address, history entry, referrer, or stored value carries the number.
  expect(new URL(page.url()).pathname).toBe('/auth/forgot-password');
  expect(new URL(page.url()).search).toBe('');
  expect(await page.evaluate(() => history.length)).toBe(historyLength);
  expect(await page.evaluate(() => document.referrer)).toBe('');
  const stored = await page.evaluate(() => ({
    session: Object.values(sessionStorage),
    local: Object.values(localStorage),
  }));
  for (const value of [...stored.session, ...stored.local]) {
    expect(value).not.toContain(phone);
  }
  for (const cookie of await context.cookies()) {
    expect(cookie.value).not.toContain(phone);
  }

  // SC-003's three-minute budget, excluding delivery after acceptance.
  expect(Date.now() - startedAt).toBeLessThan(180_000);
});
