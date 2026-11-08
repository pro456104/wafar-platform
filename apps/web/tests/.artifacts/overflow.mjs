import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 320, height: 900 }, locale: 'ar-LY' });
await page.goto('http://127.0.0.1:3000/auth/sign-up');
await page.waitForLoadState('networkidle');
const info = await page.evaluate(() => {
  const list = [];
  for (const element of document.querySelectorAll('*')) {
    const rect = element.getBoundingClientRect();
    if (rect.right > 320.5 || rect.left < -0.5 || element.scrollWidth > element.clientWidth + 1) {
      list.push({
        tag: element.tagName,
        cls: element.className?.toString().slice(0, 60),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      });
    }
  }
  return { scrollWidth: document.scrollingElement?.scrollWidth, list: list.slice(0, 25) };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
