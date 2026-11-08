// The fifth incorrect entry's ending end to end: the first four keep the code
// step with the field cleared and the wrong-code message; the fifth ends the
// request, returns the first step with the OTP_REQUEST_ENDED notice as a status,
// keeps every collected value, moves focus to the first field, leaves no live
// request, and lets a fresh submission start a new verification (FR-034, FR-038,
// FR-040, AC-036, AC-041, AC-043; T172).
import { expect, test } from '@playwright/test';
import {
  fillSignUpForm,
  openSignUp,
  reloadSignUp,
  submitSignUp,
  uniqueNationalNumber,
} from '../support/bare';
import { dispatchMark, waitForDispatch } from '../support/fake-inbox';

const password = 'correct horse battery staple';

test('the fifth incorrect entry ends the request and returns the first step with its values', async ({
  page,
}) => {
  const values = {
    fullName: 'أمل الزوي',
    phone: uniqueNationalNumber(10),
    password,
    city: 'سبها',
    shopName: 'ورشة أمل',
  };

  await openSignUp(page);
  const before = dispatchMark();
  await fillSignUpForm(page, values);
  await submitSignUp(page);
  const dispatch = await waitForDispatch({ kind: 'otp_sign_up', after: before });
  const wrong = dispatch.code === '000000' ? '111111' : '000000';
  const field = page.locator('input[autocomplete="one-time-code"]');

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    await field.fill(wrong);
    await page.locator('button.wf-code-step__submit').click();
    await expect(page.locator('.wf-code-step')).toBeVisible();
    await expect(page.locator('.wf-code-step__form input')).toHaveValue('');
    await expect(page.locator('.wf-code-step [role="alert"]')).toHaveText(
      'الرمز غير صحيح.',
    );
  }

  // The fifth ends the request.
  await field.fill(wrong);
  await page.locator('button.wf-code-step__submit').click();
  await expect(page.locator('.wf-code-step')).toHaveCount(0);
  await expect(page.locator('.bare-layout__title')).toHaveText('إنشاء حساب');

  // The notice is a polite status, not an alert.
  const notice = page.locator('.wf-message--status');
  await expect(notice).toBeVisible();
  await expect(notice).toHaveAttribute('role', 'status');
  await expect(notice).toHaveText(
    'انتهت محاولات التحقق. أدخل رقمك من جديد لطلب رمز جديد.',
  );
  await expect(page.locator('.wf-message--alert')).toHaveCount(0);

  // Every collected value is kept, and focus is on the first field.
  await expect(page.locator('input[autocomplete="name"]')).toHaveValue(values.fullName);
  await expect(page.locator('input[autocomplete="tel-national"]')).toHaveValue(
    values.phone,
  );
  await expect(page.locator('#wf-city-input')).toHaveValue(values.city);
  await expect(page.locator('input[autocomplete="organization"]')).toHaveValue(
    values.shopName,
  );
  await expect(page.locator('input[autocomplete="name"]')).toBeFocused();

  // The browser's tie to the ended request is gone, so no live request survives.
  const stored = await page.evaluate(() =>
    sessionStorage.getItem('wafar.pending.requestId'),
  );
  expect(stored).toBeNull();

  // A fresh submission starts a new verification from the kept values, and its
  // code works: the incorrect-entry count begins at zero.
  const beforeFresh = dispatchMark();
  // The password is never re-displayed, so it is the one value to type again.
  await page.locator('input[type="password"]').fill(values.password);
  await submitSignUp(page);
  const fresh = await waitForDispatch({ kind: 'otp_sign_up', after: beforeFresh });
  expect(fresh.code).toMatch(/^\d{6}$/);
  await page.locator('input[autocomplete="one-time-code"]').fill(fresh.code);
  await page.locator('button.wf-code-step__submit').click();
  await expect(page.getByText('حسابك جاهز، وأنت مسجل الدخول الآن.')).toBeVisible();

  // After the new confirmation, a reload returns the first step.
  await reloadSignUp(page);
  await expect(page.locator('form.wf-sign-up')).toBeVisible();
  await expect(page.locator('.wf-code-step')).toHaveCount(0);
  await expect(page.locator('.wf-message--status')).toHaveCount(0);
});
