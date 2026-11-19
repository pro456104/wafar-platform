// The 44 visual baselines of contracts/ui-contracts.md §8: the eleven
// presentations × 1280 and 375 CSS px × light and dark, driven through the
// local API and the database so a capture records the named state and nothing
// the database happened to hold (T156; ADR-129's baseline chain, T035, T135).
//
// The idle pair is reviewed against the slice's reference images when the set
// is generated — `docs/design/screenshots/R2/upload--default--1280--light.png`
// and `upload--default--375--light.png` — and the other nine presentations are
// composed from the contract (Complexity Tracking row 5). The reference is a
// design target, not a diff target: conformance is to the recorded contract,
// never pixel identity with the lab (ADR-129).
import { expect, test } from '@playwright/test';
import { prepareUploadPresentation, uploadPresentations } from '../support/presentations.ts';
import { settle } from '../support/scenarios.ts';

const widths = [1280, 375] as const;
const appearances = ['light', 'dark'] as const;

/** The contract's state token; idle is `default`, the name its reference carries. */
const stateTokens: Record<string, string> = {
  idle: 'default',
  uploading: 'transfer',
};

for (const [presentation, label] of uploadPresentations) {
  test(`the ${label} presentation captures at both widths and appearances`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await prepareUploadPresentation(page, presentation);

    for (const width of widths) {
      for (const appearance of appearances) {
        await page.setViewportSize({ width, height: 900 });
        // The appearance is applied before the capture, so the baseline records
        // it rather than the visitor's OS preference (§8, ADR-137).
        await settle(page, appearance);
        const state = stateTokens[presentation] ?? presentation;
        await expect(page).toHaveScreenshot(
          `upload--${state}--${String(width)}--${appearance}.png`,
          { fullPage: true, animations: 'disabled', caret: 'hide' },
        );
      }
    }
  });
}
