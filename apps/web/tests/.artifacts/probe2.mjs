import { chromium } from '@playwright/test';

const browser = await chromium.launch();
for (const path of ['/auth/sign-in', '/auth/forgot-password']) {
  const page = await browser.newPage({ viewport: { width: 320, height: 900 }, locale: 'ar-LY' });
  await page.goto(`http://127.0.0.1:3000${path}`);
  await page.waitForLoadState('networkidle');
  const info = await page.evaluate(() => {
    const list = [];
    for (const element of document.querySelectorAll('*')) {
      const rect = element.getBoundingClientRect();
      if (rect.right > 320.5 || rect.left < -0.5) {
        list.push({
          tag: element.tagName,
          cls: element.className?.toString().slice(0, 60),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        });
      }
    }
    return { scrollWidth: document.scrollingElement?.scrollWidth, list: list.slice(0, 12) };
  });
  console.log(path, JSON.stringify(info));
  await page.close();
}

// The in-progress probe.
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: 'ar-LY' });
let posts = 0;
await page.route('**/api/v1/auth/sign-up', async (route) => {
  posts += 1;
  await new Promise((resolve) => setTimeout(resolve, 800));
  await route.fulfill({
    status: 400,
    contentType: 'application/json',
    body: JSON.stringify({
      error: { code: 'INVALID_FULL_NAME', field: 'fullName', reason: 'empty', retryable: false },
    }),
  });
});
const bootstrap = page.waitForResponse((r) => r.url().endsWith('/api/v1/auth/csrf'));
await page.goto('http://127.0.0.1:3000/auth/sign-up');
await bootstrap;
await page.locator('input[autocomplete="name"]').fill('محمد علي');
await page.locator('input[autocomplete="tel-national"]').fill('912345678');
await page.locator('input[type="password"]').fill('correct horse battery staple');
await page.locator('#wf-city-input').fill('طرابلس');
await page.getByRole('button', { name: 'إنشاء الحساب' }).click();
for (let i = 0; i < 6; i += 1) {
  const state = await page.evaluate(() => {
    const button = document.querySelector('button.wf-submit');
    return { disabled: button?.disabled, text: button?.textContent?.trim(), alerts: document.querySelectorAll('[role="alert"]').length };
  });
  console.log('TICK', i, JSON.stringify(state), 'posts', posts);
  await page.waitForTimeout(200);
}
console.log('FINAL', JSON.stringify(await page.evaluate(() => ({
  disabled: document.querySelector('button.wf-submit')?.disabled,
  text: document.querySelector('button.wf-submit')?.textContent?.trim(),
  alerts: [...document.querySelectorAll('[role="alert"]')].map((n) => n.textContent?.trim()),
  errors: document.querySelectorAll('.wf-field__error').length,
}))));
await browser.close();
