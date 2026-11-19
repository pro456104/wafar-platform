// The page's hydration boundary: a listener the page adds is bound only after
// Nuxt mounts the application, so a journey that activates a control presses it
// after this settles rather than against the server-rendered markup (T033).
import type { Page } from '@playwright/test';

export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const root = document.querySelector('#__nuxt') as
      | (Element & { __vue_app__?: unknown })
      | null;
    return root?.__vue_app__ !== undefined;
  });
}
