// The page-load probe SC-006 reads (T100): injected before the document is
// created, it records the first animation frame in which the quota block shows
// its settled presentation — the used and limit counts, the exhausted content,
// or the read failure, and not its loading state — together with the quota
// read's own resource timing.
//
// The page's navigation start is `performance.timeOrigin`, so `settledAt` is
// already the interval from the browser's request for the document to the first
// settled frame, which is the interval SC-006 fixes.
//
// The function is serialized into the browser context, so it must stay
// self-contained: no imports, no closure over this module.
export function quotaProbe() {
  const state = { settledAt: null, presentation: null, quota: null };

  const settled = () => {
    const block = document.querySelector('.wf-quota');
    if (block === null) return null;
    if (block.querySelector('.wf-quota__status[aria-busy="true"]') !== null) return null;
    if (block.querySelector('.wf-quota__exhausted') !== null) return 'exhausted';
    if (block.querySelector('.wf-quota__status--failure') !== null) return 'read-failure';
    if (block.querySelector('.wf-quota__lines') !== null) return 'counts';
    return null;
  };

  const tick = () => {
    if (state.settledAt !== null) return;
    const presentation = settled();
    if (presentation !== null) {
      state.settledAt = performance.now();
      state.presentation = presentation;
      return;
    }
    requestAnimationFrame(tick);
  };

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.name.includes('/api/v1/catalogs/quota')) continue;
        state.quota = { start: entry.startTime, duration: entry.duration };
      }
    });
    observer.observe({ type: 'resource', buffered: true });
  } catch {
    // A browser without the resource timeline still reports the page's frame.
  }

  window.__wfPageLoad = state;
  requestAnimationFrame(tick);
}
