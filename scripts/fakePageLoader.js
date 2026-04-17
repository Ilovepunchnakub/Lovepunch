import { wait, qs } from './utils.js';

const SEGMENT_COUNT = 42;

function createOverlayLoader(overlayId, { buildSegments = false } = {}) {
  const overlay = qs(overlayId);
  const cat = overlay?.querySelector('[data-loader-cat]');
  let lockCount = 0;

  if (buildSegments && cat && cat.children.length === 0) {
    for (let i = 0; i < SEGMENT_COUNT; i += 1) {
      const segment = document.createElement('span');
      segment.className = 'fake-loader-cat__segment';
      segment.style.setProperty('--delay', `${(i * -0.03).toFixed(2)}s`);
      cat.appendChild(segment);
    }
  }

  function applyState() {
    if (!overlay) return;
    const show = lockCount > 0;
    overlay.classList.toggle('show', show);
    overlay.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  function show() {
    lockCount += 1;
    applyState();
  }

  function hide() {
    lockCount = Math.max(0, lockCount - 1);
    applyState();
  }

  async function run({ minMs = 1400, beforeSwitch } = {}) {
    show();
    try {
      beforeSwitch?.();
      await wait(minMs);
    } finally {
      hide();
    }
  }

  return {
    show,
    hide,
    run,
    isVisible: () => lockCount > 0
  };
}

export function createFakePageLoader() {
  return createOverlayLoader('globalFakeLoader', { buildSegments: true });
}

export function createEntryCompletionLoader() {
  return createOverlayLoader('entryCompletionLoader');
}
