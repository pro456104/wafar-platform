import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', (message) => {
  console.log('CONSOLE', message.type(), message.text().slice(0, 400));
});
page.on('pageerror', (error) => console.log('PAGEERROR', error.message.slice(0, 400)));
page.on('requestfailed', (request) =>
  console.log('REQFAIL', request.url().slice(0, 160), request.failure()?.errorText),
);
const response = await page.goto('http://127.0.0.1:3000/auth/sign-up');
console.log('STATUS', response?.status());
await page.waitForTimeout(3000);
console.log('TITLE', JSON.stringify(await page.title()));
const title = await page.title();
console.log('TITLE_CODEPOINTS', [...title].map((c) => c.codePointAt(0)?.toString(16)).join(' '));
console.log('HYDRATED', await page.evaluate(() => document.querySelector('#__nuxt') !== null));
await page.locator('input[autocomplete="tel-national"]').fill('912345678');
await page.locator('input[type="password"]').fill('short');
await page.locator('#wf-city-input').fill('طرابلس');
await page.getByRole('button', { name: 'إنشاء الحساب' }).click();
await page.waitForTimeout(500);
console.log('ERRORS', await page.locator('.wf-field__error').count());
console.log('URL', page.url());
await browser.close();
