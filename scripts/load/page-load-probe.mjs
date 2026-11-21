// The browser probes SC-006 and SC-007 read (T100, T101).
//
// `quotaProbe` is injected before the document is created: it records the first
// animation frame in which the quota block shows its settled presentation — the
// used and limit counts, the exhausted content, or the read failure, and not its
// loading state — together with the quota read's own resource timing.
//
// `outcomeProbe` is injected beside it: it records the file selection's moment
// on the control's `change` event and the first animation frame in which an
// upload outcome is visible — the success panel, the duplicate panel, the error
// panel, the quota-exceeded state, or the ended-session panel — so the interval
// SC-007 fixes is read from the page, not from the transport.
//
// The page's navigation start is `performance.timeOrigin`, so both intervals
// are already the ones the criteria fix: the request for the document to the
// first settled quota frame, and the file's selection to the outcome's first
// frame.
//
// The functions are serialized into the browser context, so they must stay
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

export function outcomeProbe() {
  const state = { selectedAt: null, shownAt: null, outcome: null, detail: null };

  const visible = () => {
    if (document.querySelector('#upload-success-heading') !== null) return 'accepted';
    if (document.querySelector('#upload-duplicate-heading') !== null) return 'duplicate';
    if (document.querySelector('.upload-error__heading') !== null) return 'refused';
    if (document.querySelector('.wf-quota__exhausted') !== null) return 'refused';
    if (document.querySelector('.wf-ended-session__heading') !== null) return 'ended';
    return null;
  };

  function tick() {
    if (state.shownAt !== null) return;
    const outcome = visible();
    if (outcome !== null) {
      state.shownAt = performance.now();
      state.outcome = outcome;
      const body = document.querySelector('.upload-error__body');
      state.detail = body === null ? null : body.textContent;
      return;
    }
    requestAnimationFrame(tick);
  }

  document.addEventListener(
    'change',
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.type !== 'file') return;
      if (state.selectedAt !== null) return;
      state.selectedAt = performance.now();
      requestAnimationFrame(tick);
    },
    true,
  );

  window.__wfOutcome = state;
}
